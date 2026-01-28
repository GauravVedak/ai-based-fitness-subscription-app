import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function POST(request: NextRequest) {
  try {
    console.log("Sync user API route called");
    
    // Get the Auth0 session
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      console.log("No Auth0 session found");
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { user } = session;
    console.log("Auth0 user data:", { 
      sub: user.sub, 
      email: user.email, 
      name: user.name 
    });

    // Call the Express backend to sync user to MongoDB
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const syncResponse = await fetch(`${API_BASE}/api/auth/sync-auth0-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth0UserId: user.sub,
        email: user.email,
        name: user.name || user.nickname,
        picture: user.picture,
      }),
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      console.error("Failed to sync user to MongoDB:", errorData);
      return NextResponse.json(
        { message: "Failed to sync user", error: errorData },
        { status: syncResponse.status }
      );
    }

    const syncData = await syncResponse.json();
    console.log("User synced successfully to MongoDB:", syncData);
    
    return NextResponse.json({
      message: "User synced successfully",
      ...syncData,
    });
  } catch (error) {
    console.error("Error in sync user route:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
