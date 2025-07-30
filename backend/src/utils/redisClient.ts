import Redis from "ioredis";

const redis = new Redis({
  host: "redis",   // use the Docker service name
  port: 6379,      // default Redis port
});

export default redis;
