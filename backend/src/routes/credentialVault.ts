import express, { Request, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

const VaultRouter = express.Router();

VaultRouter.use(authenticateToken);

VaultRouter.get("/", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await User.findById(req.user.userId).select("data");

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Send the encrypted data entries directly
    res.status(200).json({ data: user.data });
  } catch (error) {
    console.error("Error fetching credential vault:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

VaultRouter.post(
  "/add-entry",
  async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    try {
      const { website, username, password, notes } = req.body;
      console.log(req.body);

      if (!website || !username || !password) {
        res.status(400).json({ message: "Missing required fields." });
        return;
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const newEntry = {
        website,
        username,
        password,
        ...(notes && { notes }),
      };

      user.data.push(newEntry);
      await user.save();

      res.status(201).json({ message: "Entry added successfully." });
    } catch (error) {
      console.error("Error adding entry:", error);
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  }
);

export default VaultRouter;
