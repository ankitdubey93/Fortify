import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { encrypt, decrypt } from "../utils/encryption";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get("/", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw new Error("Not authorized.");
  }

  try {
    const loggedInUser = await User.findById(req.user.userId).select(
      "name username data"
    );

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
      password: decrypt(entry.password),
      notes: entry.notes ? decrypt(entry.notes) : "",
    }));

    res.status(200).json({
      message: `Welcome ${loggedInUser.name}`,
      loggedInUser,
      entries: decryptedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

dashboardRouter.post("/", async (req: AuthRequest, res: express.Response) => {
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
    const user = await User.findById(req.user.userId);
    console.log(user);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    user.data.push({
      website,
      username,
      password: encrypt(password as string),
      notes: notes ? encrypt(notes) : "",
    });

    await user.save();

    res.status(201).json({ message: "Entry added successfully." });
  } catch (error) {
    console.error("Error saving entry: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

dashboardRouter.put(
  "/:entryId",
  async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { entryId } = req.params;
    const { website, username, password, notes } = req.body;

    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const entry = await user.data.id(entryId);

      if (!entry) {
        res.status(404).json({ message: "Entry not found." });
        return;
      }

      if (website) entry.website = website;
      if (username) entry.username = username;
      if (password) entry.password = encrypt(password);
      if (notes) entry.notes = encrypt(notes);

      await user.save();

      res.status(200).json({ message: "Entry updated successfully." });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

dashboardRouter.delete(
  "/:entryId",
  async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { entryId } = req.params;

    try {
      const user = await User.findById(req.user.userId);

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
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

dashboardRouter.get(
  "/:entryId",
  async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    const { entryId } = req.params;

    try {
      const user = await User.findById(req.user?.userId);
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
        password: decrypt(entry.password),
        notes: entry.notes ? decrypt(entry.notes) : "",
      };

      res.status(201).json(decryptedEntry);
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default dashboardRouter;
