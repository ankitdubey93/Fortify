import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import https from "https";

import fs from "fs";

import path from "path";

import { config } from "dotenv";

import { connectDB } from "./db/connect";

import authRouter from "./routes/auth";

import dashboardRouter from "./routes/dashboard";


config();


const app = express();

const PORT = process.env.PORT || 3000;


// Load SSL cert and key

const privateKey = fs.readFileSync(path.join("/etc/ssl/selfsigned/selfsigned.key"), "utf8");

const certificate = fs.readFileSync(path.join("/etc/ssl/selfsigned/selfsigned.crt"), "utf8");


const credentials = { key: privateKey, cert: certificate };


// Middlewares

app.use(cookieParser());

app.use(

  cors({

    origin: "https://13.232.226.34", // Use your domain or IP

    credentials: true,

  })

);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// Routers

const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);

mainRouter.use("/dashboard", dashboardRouter);

app.use("/api", mainRouter);


// Start HTTPS server

const startServer = async () => {

  try {

    await connectDB();

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, () => {

      console.log(`✅ HTTPS Server running on https://13.232.226.34:${PORT}`);

    });

  } catch (err) {

    console.error("❌ Server failed to start:", err);

  }

};


startServer();

