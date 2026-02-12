import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let app: any;
let User: any;
let RefreshToken: any;
let mongoServer: MongoMemoryServer | null = null;
let usingExternalMongo = false;

const baseUser = {
  email: "tester@example.com",
  password: "Passw0rd!",
  name: "Test User",
};

async function registerDefaultUser(agent = request(app)) {
  return agent.post("/api/auth/register").send(baseUser);
}

beforeAll(async (ctx) => {
  try {
    const externalUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
    if (externalUri) {
      usingExternalMongo = true;
      await mongoose.connect(externalUri, { dbName: "test_auth" });
    } else {
      mongoServer = await MongoMemoryServer.create({
        binary: { version: "7.0.5" }, // Windows-friendly pin
      });
      await mongoose.connect(mongoServer.getUri());
    }

    // Import after env + DB are ready.
    const appModule = await import("../src/api-app");
    app = appModule.default ?? appModule;
    ({ User } = await import("../src/auth/models/user.js"));
    ({ RefreshToken } = await import("../src/auth/models/refreshToken.js"));
  } catch (err) {
    ctx.skip = true;
    console.error("Skipping tests: failed to start database for tests", err);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.connection.close().catch(() => {});
  }
  if (mongoServer && !usingExternalMongo) {
    await mongoServer.stop().catch(() => {});
  }
});

beforeEach(async () => {
  if (User && RefreshToken) {
    await Promise.all([User.deleteMany({}), RefreshToken.deleteMany({})]);
  }
});

describe("Auth endpoints", () => {
  it("registers a new user", async () => {
    const res = await registerDefaultUser();

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered/i);

    const userInDb = await User.findOne({ email: baseUser.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb.passwordHash).toBeTruthy();
  });

  it("rejects duplicate registration", async () => {
    await registerDefaultUser();
    const res = await registerDefaultUser();

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("logs in and sets auth cookies plus refresh token record", async () => {
    await registerDefaultUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: baseUser.email, password: baseUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(baseUser.email);

    const cookies = res.get("set-cookie") || [];
    expect(cookies.some((c: string) => c.startsWith("access_token="))).toBe(
      true,
    );
    expect(cookies.some((c: string) => c.startsWith("refresh_token="))).toBe(
      true,
    );

    const refreshDoc = await RefreshToken.findOne({
      userId: res.body.user.id,
    });
    expect(refreshDoc).toBeTruthy();
  });

  it("rejects login with wrong password", async () => {
    await registerDefaultUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: baseUser.email, password: "wrong-pass" });

    expect(res.status).toBe(401);
  });

  it("refreshes an access token when a valid refresh cookie is present", async () => {
    const agent = request.agent(app);
    await registerDefaultUser(agent);
    await agent
      .post("/api/auth/login")
      .send({ email: baseUser.email, password: baseUser.password });

    const refreshRes = await agent.post("/api/auth/refresh").send();

    expect(refreshRes.status).toBe(200);
    const cookies = refreshRes.get("set-cookie") || [];
    expect(cookies.some((c: string) => c.startsWith("access_token="))).toBe(
      true,
    );
  });

  it("logs out and deletes the refresh token record", async () => {
    const agent = request.agent(app);
    await registerDefaultUser(agent);
    const loginRes = await agent
      .post("/api/auth/login")
      .send({ email: baseUser.email, password: baseUser.password });

    const refreshCookie = (loginRes.get("set-cookie") || []).find((c: string) =>
      c.startsWith("refresh_token="),
    );
    expect(refreshCookie).toBeTruthy();

    const [, tokenValue] = refreshCookie!.split(";")[0].split("=");
    expect(tokenValue).toBeTruthy();

    const logoutRes = await agent.post("/api/auth/logout").send();
    expect(logoutRes.status).toBe(200);

    const refreshDoc = await RefreshToken.findOne({ token: tokenValue });
    expect(refreshDoc).toBeFalsy();
  });
});
