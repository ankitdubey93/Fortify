import {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/emailService';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { RefreshToken } from '../models/RefreshToken';
import redis from "../utils/redisClient";



const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 15 * 60 * 1000,
}

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}


const TOKEN_EXPIRY = 1000 * 60 * 300;

export const signUp = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password) {
            res.status(400).json({message: "All fields are required."});
            return;
        }

        const existingUser = await User.findOne({email});
        if(existingUser) {
            res.status(409).json({message: "User already exists."});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");

        const newUser = await new User({
            name, 
            email,
            password: hashedPassword,
            emailVerificationToken: token,
            emailVerificationTokenExpires: new Date(Date.now() + TOKEN_EXPIRY),
        }).save();

        await sendVerificationEmail(newUser.email, token);

        const accessToken = generateAccessToken(newUser._id.toString());
        const refreshToken = generateRefreshToken(newUser._id.toString());

        await new RefreshToken({
            userId: newUser._id, token: refreshToken
        }).save();

        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        res.status(201).json({
            message: "Signup Successful! Check your email to verify.",
            user: {_id: newUser._id, name: newUser.name, email: newUser.email}
        });
    } catch (error) {
        next(error);
    }
};


export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        const validatedUser = await User.findOne({email});

        if(!validatedUser) {
            res.status(404).json({message:"User not found. Please register first."});
            return;
        }

        const isMatch = bcrypt.compare(password,validatedUser.password);
        
        if(!isMatch) {
            res.status(401).json({message: "Invalid Password."});
            return;
        }

        const accessToken = generateAccessToken(validatedUser._id.toString());
        const refreshToken = generateRefreshToken(validatedUser._id.toString());

        await new RefreshToken({userId: validatedUser._id, token: refreshToken}).save();

        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        res.status(200).json({
            user: {
                _id: validatedUser._id, name: validatedUser.name, email: validatedUser.email
            }, 
        });

    } catch (error) {
        next(error);
    }
};


export const verifyEmail =  async (req: Request, res: Response, next: NextFunction) => {
try {

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

  }catch (error) {
    next(error);
}
};

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {

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
        hasMasterPassword: !!user.encryptionSalt,
      }
    });
    
    }  catch (error) {
        next(error);
      }

    };


   export const refresh =  async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
      }
    };


    export const signOut =  async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
      }
    };


    export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
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
          .json({ message: "If user exists, reset link has been sent." });
      } catch (error) {
        next(error);
      }
    };


    export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
      }
    };



export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
}