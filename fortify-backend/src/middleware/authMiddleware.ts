import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const accessSecret = process.env.ACCESS_TOKEN_SECRET;

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader?.split(" ")[1];
  console.log(token);

  if (!token) {
    res.status(401).json({ message: "Access Token required" });
  } else {
    try {
      const decoded = jwt.verify(token, accessSecret as string) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ message: "Invalid or expired token" });
    }
  }
};
