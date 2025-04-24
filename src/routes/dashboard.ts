import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get("/dashboard", (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw new Error("Not authorized.");
  } else {
  }
});
