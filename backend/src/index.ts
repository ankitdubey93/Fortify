import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import https from "https";

import fs from "fs";

import path from "path";

import { config } from "dotenv";

if (process.env.NODE_ENV === "production") {
  config({ path: path.resolve(__dirname, "./.env.production") });
  console.log("Loading production environment variables.");
} else {
  config({ path: path.resolve(__dirname, "./.env.development") });
  console.log("Loading development environment variables.");
}

import { connectDB } from "./db/connect";

import authRouter from "./routes/auth";

import dashboardRouter from "./routes/dashboard";

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigin = process.env.FRONTEND_URL;

if (!allowedOrigin) {
  console.error(
    "FRONTEND_URL is not defined in the environment variables. CORS might not work correctly."
  );
  process.exit(1);
}

let credentials;

// Load SSL cert and key
try {
  const privateKey = fs.readFileSync(
    path.join("/etc/ssl/selfsigned/selfsigned.key"),
    "utf8"
  );

  const certificate = fs.readFileSync(
    path.join("/etc/ssl/selfsigned/selfsigned.crt"),
    "utf8"
  );

  credentials = { key: privateKey, cert: certificate };
  console.log("SSL certificates loaded successfully.");
} catch (error) {
  console.warn(
    "Could not load SSL certificates. This is expected if running in development without self-signed certificates. Server will attempt to start wihtout them."
  );
}

// Middlewares

app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigin, // Dynamically set origin based on environment

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

    let server;

    if (credentials) {
      server = https.createServerServer(credentials, app);
      console.log("Starting HTTPS server ......");
    }

    const httpsServer = https.createServer(credentials, app);

    // const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, () => {
      console.log(`✅ HTTPS Server running on ${allowedOrigin}:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
  }
};

startServer();
