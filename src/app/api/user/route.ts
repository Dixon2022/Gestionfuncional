import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, password, role, userDescription } = data;

    if (!name || !email || !phone || !password || !userDescription) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: { name, email, phone, password, role, userDescription },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
