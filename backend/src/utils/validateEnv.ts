export const validateEnv = () => {
  const requiredVars = [
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "JWT_SECRET",
    "MONGODB_URI",
    "FRONTEND_URL",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing env variables: ", missing.join(", "));
    process.exit(1);
  }
};
