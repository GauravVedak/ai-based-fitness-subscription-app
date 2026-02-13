import "dotenv/config";
import app from "./src/api-app";
import connectDatabase from "./src/config/database";
import { env } from "./src/config/env";

async function start() {
  try {
    await connectDatabase();
    app.listen(env.port || 5000, () => {
      console.log(`API listening on port ${env.port || 5000}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
