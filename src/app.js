import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { User } from "./auth/models/user.js";
import { env } from "./config/env.js";

const app = express();
app.use(express.json());

// Allow CORS from frontend
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// User Registration
app.post("/api/auth/register", async (req, res) => {
  console.log("Register endpoint called", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.error("Missing email or password");
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("User already exists");
      return res.status(409).json({ message: "User already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash });
    await user.save();
    console.log("User registered successfully", user);
    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { sub: user._id, email: user.email },
      env.jwtAccessSecret,
      { expiresIn: env.jwtAccessExpiresIn },
    );
    return res.status(200).json({ token, user: { email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Sync Auth0 user to MongoDB
app.post("/api/auth/sync-auth0-user", async (req, res) => {
  console.log("Sync Auth0 user endpoint called", req.body);
  try {
    const { auth0UserId, email, name, picture } = req.body;

    if (!auth0UserId || !email) {
      console.error("Missing required fields: auth0UserId or email");
      return res
        .status(400)
        .json({ message: "Auth0 user ID and email are required." });
    }

    // Check if user exists by auth0UserId
    let user = await User.findOne({ auth0UserId });

    if (user) {
      console.log("User found by auth0UserId, updating...", user._id);
      // Update existing user
      user.email = email;
      if (name) user.name = name;
      if (picture) user.picture = picture;
      await user.save();
      console.log("User updated successfully:", {
        userId: user._id,
        email: user.email,
        auth0UserId: user.auth0UserId,
      });
      return res.status(200).json({
        message: "User updated successfully.",
        user: {
          id: user._id,
          email: user.email,
          auth0UserId: user.auth0UserId,
          name: user.name,
        },
        status: "updated",
      });
    }

    // Check if user exists by email (in case auth0UserId wasn't set before)
    user = await User.findOne({ email });

    if (user) {
      console.log(
        "User found by email, updating with auth0UserId...",
        user._id,
      );
      // Update existing user with auth0UserId
      user.auth0UserId = auth0UserId;
      if (name) user.name = name;
      if (picture) user.picture = picture;
      await user.save();
      console.log("User updated with auth0UserId successfully:", {
        userId: user._id,
        email: user.email,
        auth0UserId: user.auth0UserId,
      });
      return res.status(200).json({
        message: "User updated successfully.",
        user: {
          id: user._id,
          email: user.email,
          auth0UserId: user.auth0UserId,
          name: user.name,
        },
        status: "updated",
      });
    }

    // Create new user
    console.log("Creating new user with Auth0 data...");
    user = new User({
      email,
      auth0UserId,
      name: name || undefined,
      picture: picture || undefined,
      status: "active",
    });
    await user.save();
    console.log("User created successfully in MongoDB:", {
      userId: user._id,
      email: user.email,
      auth0UserId: user.auth0UserId,
    });
    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: user._id,
        email: user.email,
        auth0UserId: user.auth0UserId,
        name: user.name,
      },
      status: "created",
    });
  } catch (err) {
    console.error("Sync Auth0 user error:", err);
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
});

export default app;
