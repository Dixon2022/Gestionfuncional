import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const paramId = parseInt(params.id);

  if (isNaN(paramId)) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
  }

  if (!session || !session.user || (session.user as any).id !== paramId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: paramId },
      select: { // Explicitly select non-sensitive fields
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(`GET /api/user/${params.id} error:`, error);
    return NextResponse.json({ error: "Error fetching user data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const paramId = parseInt(params.id);

  if (isNaN(paramId)) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
  }

  if (!session || !session.user || (session.user as any).id !== paramId) {
    return NextResponse.json({ error: "Unauthorized to update this profile" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, phone } = data; // Only allow updating name and phone

    if (!name && !phone) { // Check if at least one updatable field is provided
        return NextResponse.json({ error: "Missing fields to update (name or phone)" }, { status: 400 });
    }
    
    // Prevent email or password updates through this endpoint
    if (data.email || data.password) {
        return NextResponse.json({ error: "Email or password updates are not allowed via this endpoint." }, { status: 400 });
    }

    const updateData: { name?: string; phone?: string; updatedAt: Date } = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    // Email is not allowed to be updated here to prevent conflicts with NextAuth identity/email provider.
    // Password should be updated via a separate, more secure flow (e.g., "change password" page).

    const updatedUser = await prisma.user.update({
      where: { id: paramId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, updatedAt: true }, // Return non-sensitive fields
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`PUT /api/user/${params.id} error:`, error);
    // Add more specific error handling, e.g., for Prisma record not found
    return NextResponse.json({ error: "Error updating user profile" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const paramId = parseInt(params.id);

  if (isNaN(paramId)) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
  }
  
  // For now, only allow users to delete their own account.
  // Admin deletion would require role checks.
  if (!session || !session.user || (session.user as any).id !== paramId) {
    return NextResponse.json({ error: "Unauthorized to delete this profile" }, { status: 401 });
  }

  try {
    // Optional: Check if user exists before attempting delete, though Prisma handles this.
    const userExists = await prisma.user.findUnique({ where: { id: paramId } });
    if (!userExists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Consider implications: what happens to user's properties? 
    // This might require cascading deletes or setting ownerId to null, depending on schema and business logic.
    // For now, direct delete:
    await prisma.user.delete({ where: { id: paramId } });
    return NextResponse.json({ message: "User profile deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/user/${params.id} error:`, error);
    // Add more specific error handling
    return NextResponse.json({ error: "Error deleting user profile" }, { status: 500 });
  }
}
