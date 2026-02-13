import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

let mongoServer: MongoMemoryServer | null = null;
let verifyAdmin: typeof import("../src/lib/admin/auth").verifyAdmin;
let getDb: typeof import("../src/lib/mongodb").getDb;
let clientPromise: Promise<any>;

const adminId = new ObjectId();
const memberId = new ObjectId();

const requestWithCookie = (cookie?: string) =>
  new Request("http://localhost/api/admin/orders", {
    headers: cookie ? { cookie } : {},
  });

describe("Admin workflow authentication", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: { version: "7.0.5" },
    });
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = "test-admin-secret";

    const mongoModule = await import("../src/lib/mongodb");
    clientPromise = mongoModule.default;
    getDb = mongoModule.getDb;

    const authModule = await import("../src/lib/admin/auth");
    verifyAdmin = authModule.verifyAdmin;

    const db = await getDb("Users");
    const users = db.collection("userdata");
    await users.insertMany([
      { _id: adminId, email: "admin@test.com", role: "admin" },
      { _id: memberId, email: "user@test.com", role: "member" },
    ]);
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

  it("rejects when no token is provided", async () => {
    const result = await verifyAdmin(requestWithCookie());
    expect(result.ok).toBe(false);
    expect(result.response.status).toBe(401);
  });

  it("rejects when the user is not an admin", async () => {
    const token = jwt.sign(
      { sub: memberId.toString(), email: "user@test.com" },
      process.env.JWT_SECRET as string,
    );
    const result = await verifyAdmin(
      requestWithCookie(`access_token=${token}`),
    );
    expect(result.ok).toBe(false);
    expect(result.response.status).toBe(403);
  });

  it("allows access for a valid admin token", async () => {
    const token = jwt.sign(
      { sub: adminId.toString(), email: "admin@test.com" },
      process.env.JWT_SECRET as string,
    );
    const result = await verifyAdmin(
      requestWithCookie(`access_token=${token}`),
    );
    expect(result.ok).toBe(true);
    expect(result.userId).toBe(adminId.toString());
  });
});
