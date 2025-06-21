import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import VaultRouter from "./credentialVault";

const authenticatedRouter = express.Router();

authenticatedRouter.use(authenticateToken);

authenticatedRouter.post(
  "/set-master-password",
  async (req: AuthRequest, res: express.Response) => {
    const userId = req.user?.userId;
    console.log(userId);
    const { encryptionSalt, keyDerivationMethod, verification } = req.body;

    if (!encryptionSalt || !keyDerivationMethod || !verification) {
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
      user.verification = verification;

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

authenticatedRouter.get(
  "/",
  async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      throw new Error("Not authorized.");
    }

    try {
      const loggedInUser = await User.findById(req.user.userId).select(
        "name username _id"
      );

      if (!loggedInUser) {
        res
          .status(404)
          .json({ message: "User session expired. Please sign in." });
        return;
      }

      res.status(200).json({
        _id: loggedInUser._id,
        name: loggedInUser.name,
        username: loggedInUser.username,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

authenticatedRouter.get(
  "/master-password-status",
  async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      throw new Error("Not authorized.");
    }

    try {
      const loggedInUser = await User.findById(req.user.userId).select(
        "encryptionSalt"
      );

      if (!loggedInUser) {
        res
          .status(404)
          .json({ message: "User session expired. Please login again." });
        return;
      }

      res.status(200).json({
        hasMasterPassword: !!loggedInUser.encryptionSalt,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

authenticatedRouter.use("/credential-vault", VaultRouter);

authenticatedRouter.post(
  "/",
  async (req: AuthRequest, res: express.Response) => {
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
        password,
        notes: notes ? notes : "",
      });

      await user.save();

      res.status(201).json({ message: "Successful" });
    } catch (error) {
      console.error("Error saving entry: ", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

authenticatedRouter.get(
  "/salt",
  async (req: AuthRequest, res: express.Response) => {
    console.log("route hit");
    if (!req.user) {
      throw new Error("Not Authorized.");
    }

    try {
      const loggedInUser = await User.findById(req.user.userId).select(
        "encryptionSalt keyDerivationMethod verification"
      );

      if (!loggedInUser) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      res.status(200).json({
        encryptionSalt: loggedInUser.encryptionSalt,
        keyDerivationMethod: loggedInUser.keyDerivationMethod,
        verification: loggedInUser.verification,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default authenticatedRouter;
