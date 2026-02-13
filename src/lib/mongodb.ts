// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const options = {};
const defaultDbName =
  process.env.MONGODB_DB || process.env.MONGO_DB || "Users";

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI or MONGO_URI environment variable in .env.local",
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Reuse the client in dev to avoid creating multiple connections.
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise as Promise<MongoClient>;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName || defaultDbName);
}

/**
 * Performs a lightweight ping to confirm the MongoDB connection is alive.
 * Throws if the ping fails so callers can short-circuit their workflows.
 */
export async function ensureMongoConnected(dbName?: string) {
  const client = await clientPromise;
  try {
    await client
      .db(dbName || defaultDbName)
      .command({ ping: 1 });
    return true;
  } catch (err) {
    console.error("MongoDB connectivity check failed:", err);
    throw err;
  }
}

export async function getMongoClient() {
  return clientPromise;
}
