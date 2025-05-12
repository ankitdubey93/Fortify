import express from "express";
import { connectDB } from "./db/connect";
import { config } from "dotenv";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import cors from "cors";
import cookieParser from "cookie-parser";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
