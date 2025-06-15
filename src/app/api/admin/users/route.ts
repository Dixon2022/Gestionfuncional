import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    // Obtén el id del usuario actual desde query params si lo envías
    const { searchParams } = new URL(req.url);
    const excludeId = searchParams.get("excludeId");

    const where = excludeId ? { NOT: { id: Number(excludeId) } } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        blocked: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    // ...en la desestructuración:
    const { email, password, name, phone, role, userDescription } = body;

    // Crea el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        phone,
        role,
        userDescription,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}