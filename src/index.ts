import express from "express";
import path from "path";
import { connectDB } from "./db/connect";
import { config } from "dotenv";

config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

const dashboard_path = path.join(__dirname, "../public/dashboard.html");
const homepage_path = path.join(__dirname, "../public/index.html");
const static_path = path.join(__dirname, "../public");

app.use(express.static(static_path));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
