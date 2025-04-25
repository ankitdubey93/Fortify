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

export default dashboardRouter;
