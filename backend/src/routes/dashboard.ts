import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { encrypt, decrypt } from "../utils/encryption";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.post(
  "/set-master-password",
  async (req: AuthRequest, res: express.Response) => {
    const userId = req.user?.userId;
    const { encryptionSalt, keyDerivationMethod } = req.body;

    if (!encryptionSalt || !keyDerivationMethod) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      if (user.encryptionSalt) {
        res.status(400).json({ error: "Master password already set." });
        return;
      }

      user.encryptionSalt = encryptionSalt;
      user.keyDerivationMethod = keyDerivationMethod;

      await user.save();
      res.status(200).json({ message: "Encryption parameters saved." });
      return;
    } catch (error) {
      console.error("Error setting master password info:", error);
      res.status(500).json({ error: "Internal Server error" });
      return;
    }
  }
);

dashboardRouter.get("/", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw new Error("Not authorized.");
  }

  try {
    const loggedInUser = await User.findById(req.user.userId).select(
      "name username data encryptionSalt"
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
      hasMasterPassword: !!loggedInUser.encryptionSalt,
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

    const newEntry = user.data[user.data.length - 1];
    const decryptedNewEntry = {
      _id: newEntry._id,
      website: newEntry.website,
      username: newEntry.username,
      password: decrypt(newEntry.password),
      notes: newEntry.notes ? decrypt(newEntry.notes) : "",
    };

    res.status(201).json(decryptedNewEntry);
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
      if (notes === "") entry.notes = "";

      await user.save();

      const decryptedUpdatedEntry = {
        _id: entry._id,
        website: entry.website,
        username: entry.username,
        password: decrypt(entry.password),
        notes: entry.notes ? decrypt(entry.notes) : "",
      };

      res.status(200).json(decryptedUpdatedEntry);
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
