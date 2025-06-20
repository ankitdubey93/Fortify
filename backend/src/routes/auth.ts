import { Router, Response, Request } from "express";

import bcrypt from "bcrypt";

import { User } from "../models/User";

import { RefreshToken } from "../models/RefreshToken";

import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

import { authenticateToken } from "../middleware/authMiddleware";

import jwt from "jsonwebtoken";

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

router.post("/signup", async (req: Request, res: Response) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      res
        .status(409)
        .json({ existingUser, message: "Username already exists." });

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    const savedUser = (await newUser.save()) as User;

    const accessToken = generateAccessToken(savedUser._id.toString());
    const refreshToken = generateRefreshToken(savedUser._id.toString());

    await new RefreshToken({
      userId: savedUser._id,
      token: refreshToken,
    }).save();

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.status(201).json({
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
      },
      message: "User created succesfully.",
    });
    return;
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Failed to create user", error });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const validUser = await User.findOne({ username });

    if (!validUser) {
      res.status(404).json({ message: "User not found. Invalid username." });
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
        username: validUser.username,
      },
    });
  } catch (error) {
    console.error("Sign in error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/check", authenticateToken, async (req: Request, res: Response) => {
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
      "name username _id"
    );

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ user });
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

export default router;
