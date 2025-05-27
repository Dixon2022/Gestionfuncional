import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as needed

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Note: Returning all users is generally not a good practice for non-admin roles.
  // This should be restricted further based on roles or removed if not needed.
  try {
    const users = await prisma.user.findMany({
      // Consider selecting only non-sensitive fields if this endpoint is kept
      // select: { id: true, name: true, email: true, phone: true /* no password_hash */ }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}

// POST /api/user is removed to avoid redundancy with /api/signup
// and ensure password hashing is handled correctly by the signup route.
// If this endpoint were to be kept, it would need:
// 1. Authentication (e.g., admin only)
// 2. Password hashing for the `password` field before saving
// export async function POST(request: NextRequest) {
//   // ... implementation ...
// }
