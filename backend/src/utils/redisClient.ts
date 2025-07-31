import Redis from "ioredis";

// Replace hardcoded IP with environment variable for flexibility
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1", // fallback to localhost
  port: 6379, // default Redis port
});

export default redis;
