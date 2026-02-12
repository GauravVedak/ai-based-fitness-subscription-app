import dotenv from "dotenv";

// Load any project-level .env first, but allow overrides below.
dotenv.config({ path: ".env", override: false });

// Provide sane defaults for test runs so endpoints can sign tokens.
process.env.JWT_ACCESS_SECRET ||= "test-access-secret";
process.env.JWT_REFRESH_SECRET ||= "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRES_IN ||= "15m";
process.env.JWT_REFRESH_EXPIRES_IN ||= "7d";
process.env.PORT ||= "5001";
// @ts-expect-error: allow overriding env for test runtime
process.env.NODE_ENV = "test";
