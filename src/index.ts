import express from "express";
import path from "path";
import { connectDB } from "./db/connect";
import { config } from "dotenv";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mainRouter = express.Router();

app.use("/api", mainRouter);

mainRouter.use("/auth", authRouter);
mainRouter.use("/dashboard", dashboardRouter);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
