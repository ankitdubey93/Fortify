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

export default VaultRouter;
