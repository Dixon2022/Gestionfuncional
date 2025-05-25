import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  return user
    ? NextResponse.json(user)
    : NextResponse.json({ error: "User not found" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const data = await request.json();

  if (!data.name || !data.email || !data.phone)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted" });
  } catch {
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
