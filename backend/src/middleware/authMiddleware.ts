import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";
import { decode } from "punycode";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const accessSecret = process.env.ACCESS_TOKEN_SECRET;

if (!accessSecret) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in the environment variables."
  );
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    console.warn("No access token found in cookies.");
    res.status(401).json({ message: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, accessSecret as string) as JwtPayload;

    const currentTime = new Date();
    const tokenExpiry = new Date(decoded.exp! * 1000);
    console.log("Access token verified.");
    console.log("Decoded payload", decoded);
    console.log("Current time", currentTime.toISOString());
    console.log("Token expires at:", tokenExpiry.toISOString());
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verifying access token:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Access token expired." });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: "Invalid access token." });
      return;
    }

    res.status(403).json({ message: "Authentication failed." });
    return;
  }
};
