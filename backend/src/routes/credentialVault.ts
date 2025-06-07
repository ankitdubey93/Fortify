import express, { Request, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

const VaultRouter = express.Router();

VaultRouter.use(authenticateToken);

VaultRouter.get("/", async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized.");
  }

  try {
    const user = await User.findById(req.user.userId).select("encryptionSalt");

    if (!user) {
      res
        .status(404)
        .json({ message: "User session expired. Please login again." });
      return;
    }

    res.status(201).json({
      encryptionSalt: user.encryptionSalt,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

export default VaultRouter;
