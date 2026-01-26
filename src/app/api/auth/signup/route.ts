//* *** --- Made By Naveed --- *** */

import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {

    // --- retriving the data from the request body --- //
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }


    // --- Performing User creation logic --- //
    const db = await getDb("Users");
    const users = db.collection("userdata");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ ok: false, message: "User already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      fitnessMetrics: {},
    });


    // --- Preparing the response user object --- //
    const user = {
      id: result.insertedId.toString(),
      name,
      email,
    };

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
