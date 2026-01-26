// *** Made By Naveed *** //

import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {

    // --- retriving the data from the request body --- //
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }

    const db = await getDb("Users");
    const users = db.collection("userdata");

      // --- minimal safe debugging info for development  --- //
    const user = await users.findOne({ email });
    if (process.env.NODE_ENV !== "production") {
      console.debug("[auth/login] attempt for", { email });
      console.debug("[auth/login] userFound:", !!user);
      if (user) console.debug("[auth/login] hasPasswordHash:", !!user.passwordHash);
    }

    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    // --- User Credentials checkup --- //
    const match = await bcrypt.compare(password, user.passwordHash || "");
    if (!match) {
      if (process.env.NODE_ENV !== "production") console.debug("[auth/login] password mismatch for", { email });
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      fitnessMetrics: user.fitnessMetrics || {},
    };

    return NextResponse.json({ ok: true, user: safeUser });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
