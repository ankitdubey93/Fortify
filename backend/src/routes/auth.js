"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const jwt_1 = require("../utils/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
};
router.post("/signup", async (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        res.status(400).json({ message: "All fields are required." });
        return;
    }
    try {
        const existingUser = await User_1.User.findOne({ username });
        if (existingUser) {
            res
                .status(409)
                .json({ existingUser, message: "Username already exists." });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.User({
            name,
            username,
            password: hashedPassword,
        });
        const savedUser = (await newUser.save());
        const accessToken = (0, jwt_1.generateAccessToken)(savedUser._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(savedUser._id.toString());
        await new RefreshToken_1.RefreshToken({
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
    }
    catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Failed to create user", error });
    }
});
router.post("/signin", async (req, res) => {
    try {
        const { username, password } = req.body;
        const validUser = await User_1.User.findOne({ username });
        if (!validUser) {
            res.status(404).json({ message: "User not found. Invalid username." });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, validUser.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid password." });
            return;
        }
        const accessToken = (0, jwt_1.generateAccessToken)(validUser._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(validUser._id.toString());
        await new RefreshToken_1.RefreshToken({
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
    }
    catch (error) {
        res.status(500).json({ message: "fdgd" });
    }
});
router.post("/signout", async (req, res) => {
    console.log("Cookies received on signout:", req.cookies);
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token required." });
        return;
    }
    try {
        await RefreshToken_1.RefreshToken.deleteOne({ token: refreshToken });
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
    }
    catch (error) {
        console.error("Signout error", error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
});
router.post("/refresh", async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required." });
        return;
    }
    try {
        const storedToken = await RefreshToken_1.RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            res.status(403).json({ message: "Invalid refresh token." });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = (0, jwt_1.generateAccessToken)(payload.userId);
        res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
        res.status(200).json({ message: "Access token refreshed." });
    }
    catch (error) {
        console.error("Refresh error:", error);
        res.status(403).json({ message: "Invalid or expired refresh token." });
        return;
    }
});
exports.default = router;
