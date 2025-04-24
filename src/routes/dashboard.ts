import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get("/", (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw new Error("Not authorized.");
  } else {
    res.status(200).json({ message: "User signed in. welcom" });
  }
});

export default dashboardRouter;
