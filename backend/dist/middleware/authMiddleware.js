"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        res.status(401).json({ message: "Access token required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, accessSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.authenticateToken = authenticateToken;
