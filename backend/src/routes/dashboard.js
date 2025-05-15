"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const User_1 = require("../models/User");
const encryption_1 = require("../utils/encryption");
const dashboardRouter = express_1.default.Router();
dashboardRouter.use(authMiddleware_1.authenticateToken);
dashboardRouter.get("/", async (req, res) => {
    if (!req.user) {
        throw new Error("Not authorized.");
    }
    try {
        const loggedInUser = await User_1.User.findById(req.user.userId).select("name username data");
        if (!loggedInUser) {
            res
                .status(404)
                .json({ message: "User session expired. Please sign in." });
            return;
        }
        const decryptedData = loggedInUser.data.map((entry) => ({
            _id: entry._id,
            website: entry.website,
            username: entry.username,
            password: (0, encryption_1.decrypt)(entry.password),
            notes: entry.notes ? (0, encryption_1.decrypt)(entry.notes) : "",
        }));
        res.status(200).json({
            message: `Welcome ${loggedInUser.name}`,
            loggedInUser,
            entries: decryptedData,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});
dashboardRouter.post("/", async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { website, username, password, notes } = req.body;
    if (!website || !username || !password) {
        res
            .status(400)
            .json({ message: "Website, username, and password are required." });
        return;
    }
    try {
        const user = await User_1.User.findById(req.user.userId);
        console.log(user);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        user.data.push({
            website,
            username,
            password: (0, encryption_1.encrypt)(password),
            notes: notes ? (0, encryption_1.encrypt)(notes) : "",
        });
        await user.save();
        const newEntry = user.data[user.data.length - 1];
        const decryptedNewEntry = {
            _id: newEntry._id,
            website: newEntry.website,
            username: newEntry.username,
            password: (0, encryption_1.decrypt)(newEntry.password),
            notes: newEntry.notes ? (0, encryption_1.decrypt)(newEntry.notes) : "",
        };
        res.status(201).json(decryptedNewEntry);
    }
    catch (error) {
        console.error("Error saving entry: ", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
dashboardRouter.put("/:entryId", async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { entryId } = req.params;
    const { website, username, password, notes } = req.body;
    try {
        const user = await User_1.User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const entry = await user.data.id(entryId);
        if (!entry) {
            res.status(404).json({ message: "Entry not found." });
            return;
        }
        if (website)
            entry.website = website;
        if (username)
            entry.username = username;
        if (password)
            entry.password = (0, encryption_1.encrypt)(password);
        if (notes)
            entry.notes = (0, encryption_1.encrypt)(notes);
        if (notes === "")
            entry.notes = "";
        await user.save();
        const decryptedUpdatedEntry = {
            _id: entry._id,
            website: entry.website,
            username: entry.username,
            password: (0, encryption_1.decrypt)(entry.password),
            notes: entry.notes ? (0, encryption_1.decrypt)(entry.notes) : "",
        };
        res.status(200).json(decryptedUpdatedEntry);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});
dashboardRouter.delete("/:entryId", async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { entryId } = req.params;
    try {
        const user = await User_1.User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const entry = user.data.id(entryId);
        if (!entry) {
            res.status(404).json({ message: "Entry not found." });
            return;
        }
        user.data.pull(entryId);
        await user.save();
        res.status(200).json({ message: "Entry deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});
dashboardRouter.get("/:entryId", async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const { entryId } = req.params;
    try {
        const user = await User_1.User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const entry = user.data.id(entryId);
        if (!entry) {
            res.status(404).json({ message: "Entry not found." });
            return;
        }
        const decryptedEntry = {
            _id: entry._id,
            website: entry.website,
            password: (0, encryption_1.decrypt)(entry.password),
            notes: entry.notes ? (0, encryption_1.decrypt)(entry.notes) : "",
        };
        res.status(201).json(decryptedEntry);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.default = dashboardRouter;
