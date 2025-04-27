import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get("/", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw new Error("Not authorized.");
  }

  try {
    const loggedInUser = await User.findById(req.user.userId).select(
      "name data"
    );

    if (!loggedInUser) {
      res
        .status(404)
        .json({ message: "User session expired. Please sign in." });
      return;
    }

    res.status(200).json({
      message: `Welcome ${loggedInUser.name}`,
      entries: loggedInUser.data,
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

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    user.data.push({ website, username, password, notes });

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

      (entry.website = website ?? entry.website),
        (entry.username = username ?? entry.username),
        (entry.password = password ?? entry.password),
        (entry.notes = notes ?? entry.notes);

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

      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default dashboardRouter;
