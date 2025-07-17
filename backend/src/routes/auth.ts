import { Router, Response, Request } from "express";

import bcrypt from "bcrypt";

import { User } from "../models/User";

import { RefreshToken } from "../models/RefreshToken";

import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

import { authenticateToken } from "../middleware/authMiddleware";

import redis from "../utils/redisClient";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/emailService";

const router = Router();

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

const TOKEN_EXPIRY = 1000 * 60 * 2;

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res
        .status(409)
        .json({ existingUser, message: "Username already exists." });

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: token,
      emailVerificationTokenExpires: new Date(Date.now() + TOKEN_EXPIRY),
    });

    await newUser.save();

    await sendVerificationEmail(newUser.email, token);

    const accessToken = generateAccessToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString());

    await new RefreshToken({
      userId: newUser._id,
      token: refreshToken,
    }).save();

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.status(201).json({
      message: "Signup successful! Check you email to verify.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
    return;
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Failed to create user", error });
  }
});

router.get("/verify-email", async (req: Request, res: Response) => {
  console.log("route hit");
  const token = req.query.token as string;
  const user = await User.findOne({
    emailVerificationToken: token,
  });

  if (!user) {
    res.status(400).json({ message: "Invalid or expired verification link." });
    return;
  }

  if (user.emailVerified) {
    res.status(200).json({ ok: true, message: "Already verified." });
    return;
  }

  if (
    !user.emailVerificationTokenExpires ||
    user.emailVerificationTokenExpires < new Date()
  ) {
    res.status(400).json({ message: "Invalid or expired verification link." });
    return;
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpires = null;

  await user.save();

  res
    .status(200)
    .json({ ok: true, message: "Email Verified!. You can now sign in." });
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validUser = await User.findOne({ email });

    if (!validUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid password." });
      return;
    }

    const accessToken = generateAccessToken(validUser._id.toString());
    const refreshToken = generateRefreshToken(validUser._id.toString());

    const decoded = jwt.decode(accessToken) as { iat: number; exp: number };
    console.log("🔐 Access token generated");
    console.log("Issued at:   ", new Date(decoded.iat * 1000).toISOString());
    console.log("Expires at:  ", new Date(decoded.exp * 1000).toISOString());
    console.log("Current time:", new Date().toISOString());

    await new RefreshToken({
      userId: validUser._id,
      token: refreshToken,
    }).save();

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      user: {
        _id: validUser._id,
        name: validUser.name,
        email: validUser.email,
      },
    });
  } catch (error) {
    console.error("Sign in error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/check", authenticateToken, async (req: Request, res: Response) => {
  console.log("route hit");
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  try {
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { userId: string };

    const user = await User.findById(payload.userId).select(
      "name email _id emailVerified encryptionSalt"
    );

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        hasMasterPassword: !!user.encryptionSalt, // or however you check this
      },
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
});

router.post("/signout", async (req: Request, res: Response) => {
  console.log("Cookies received on signout:", req.cookies);
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token required." });
    return;
  }

  try {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.clearCookie("accessToken", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.clearCookie("refreshToken", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Signed out successfully." });
  } catch (error) {
    console.error("Signout error", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required." });
    return;
  }

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      res.status(403).json({ message: "Invalid refresh token." });
      return;
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { userId: string };

    const newAccessToken = generateAccessToken(payload.userId);
    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
    res.status(200).json({ message: "Access token refreshed." });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
    return;
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, emailVerified: true });
    if (!user) {
      res
        .status(404)
        .json({ message: "If an email exists, a reset link has been sent." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetTokenExpires = new Date(Date.now() + TOKEN_EXPIRY);
    await user.save();

    await sendPasswordResetEmail(user.email, token);

    res
      .status(200)
      .json({ message: "If user exists, reset linke has been sent." });
  } catch (error) {
    console.error("Error resetting password", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "Invalid or expired password reset link." });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;

    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successful.Please sign in again." });
  } catch (error) {
    console.error("Error resetting password", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/resend-verification", async (req: Request, res: Response) => {
  const RESEND_LIMIT = 3; // max attempts
  const RESEND_WINDOW_SECONDS = 60 * 60;
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required." });
    return;
  }
  const redisKey = `resend_verification:${email}`;

  try {
    const count = await redis.get(redisKey);
    if (count && parseInt(count) >= RESEND_LIMIT) {
      res.status(429).json({
        message:
          "Too many verification email requests. Please try again later.",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(404)
        .json({ message: "If user exists, verification email has been sent." });
      return;
    }
    if (user.emailVerified) {
      res.status(400).json({
        message:
          "If your email is not verified, you will receive a new link now, or else you can just signin using your credentials.",
      });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationTokenExpires = new Date(Date.now() + TOKEN_EXPIRY);
    await user.save();
    await sendVerificationEmail(user.email, token);

    if (count) {
      await redis.incr(redisKey);
    } else {
      await redis.set(redisKey, "1", "EX", RESEND_WINDOW_SECONDS);
    }
    res.status(200).json({
      message: "Verification email sent on your email.",
    });
  } catch (error) {
    console.error("Error resending verification email: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
