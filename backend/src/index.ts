import { config } from "dotenv";

import { validateEnv } from "./utils/validateEnv";

import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import https from "https";

import http from "http";

import fs from "fs";

import path from "path";

const envPath = path.resolve(__dirname, "../.env.development");

console.log("Looking for .env at:", envPath);
console.log("Exists:", fs.existsSync(envPath));

if (process.env.NODE_ENV === "production") {
  config({ path: path.resolve(__dirname, "../.env.production") });
  console.log("Loading production environment variables.");
} else {
  config({ path: path.resolve(__dirname, "../.env.development") });
  console.log("Loading development environment variables.");
}
console.log("Loaded env:", {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  FRONTEND_URL: process.env.FRONTEND_URL,
});

validateEnv();

import { connectDB } from "./db/connect";

import authRouter from "./routes/auth";

import authenticatedRouter from "./routes/authenticatedRoutes";

const app = express();
app.set('trust proxy', 1); // One if Nginx is directly in front


const PORT = Number(process.env.PORT) || 3000;

const allowedOrigin = process.env.FRONTEND_URL;

console.log("Allowed Origin:", allowedOrigin);

if (!allowedOrigin) {
  console.error(
    "FRONTEND_URL is not defined in the environment variables. CORS might not work correctly."
  );
  process.exit(1);
}

let credentials: { key: string; cert: string } | undefined;

// Load SSL cert and key
try {
  const privateKey = fs.readFileSync(
    path.join("/etc/ssl/selfsigned/nginx-selfsigned.key"),
    "utf8"
  );

  const certificate = fs.readFileSync(
    path.join("/etc/ssl/selfsigned/nginx-selfsigned.crt"),
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

mainRouter.use("/dashboard", authenticatedRouter);

app.use("/api", mainRouter);

// Start HTTPS server

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.NODE_ENV === "production" && credentials) {
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(PORT,'0.0.0.0' ,() => {
        console.log(`HTTPS Server running on PORT ${PORT}`);
      });
    } else {
      const httpServer = http.createServer(app);
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`HTTP Server running on http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error("❌ Server failed to start:", err);
  }
};

startServer();
