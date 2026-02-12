import dotenv from "dotenv";

dotenv.config();

// Centralized environment values shared across server code and tests.
const env = {
  port: process.env.PORT || "5000",
  mongoUri: process.env.MONGO_URI || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

export { env };
export default env;
