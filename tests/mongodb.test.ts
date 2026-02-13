import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;
let ensureMongoConnected: (dbName?: string) => Promise<boolean>;
let clientPromise: Promise<any>;

describe("MongoDB connection verification", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: { version: "7.0.5" }, // windows-friendly pin
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Re-import after setting env so the client uses the in-memory URI.
    const mongoModule = await import("../src/lib/mongodb");
    ensureMongoConnected = mongoModule.ensureMongoConnected;
    clientPromise = mongoModule.default;
  });

  afterAll(async () => {
    if (clientPromise) {
      const client = await clientPromise;
      await client.close().catch(() => {});
    }
    if (mongoServer) {
      await mongoServer.stop().catch(() => {});
      mongoServer = null;
    }
  });

  it("confirms a healthy connection with ping", async () => {
    await expect(ensureMongoConnected()).resolves.toBe(true);
  });

  it("surfaces an error when the server goes away", async () => {
    await mongoServer?.stop();
    mongoServer = null;

    await expect(ensureMongoConnected()).rejects.toBeTruthy();
  });
});
