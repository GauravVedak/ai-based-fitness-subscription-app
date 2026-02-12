// *** Made By Naveed *** //

import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";


// Health check endpoint to confirm Mongo connectivity and list collections.
export async function GET(_req: Request) {
  try {
    const db = await getDb("Users");
    const collections = await db.listCollections().toArray();
    return NextResponse.json({
      ok: true,
      collections: collections.map((c) => c.name),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
