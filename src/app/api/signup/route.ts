// app/api/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone, role } = body;

    // Validación básica
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe." },
        { status: 409 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "admin", // Asignar el rol de usuario
      },
    });

    return NextResponse.json({
      message: "Usuario registrado exitosamente.",
      user: {
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { ownerId, images } = body;

    if (!ownerId || typeof ownerId !== "number") {
      return NextResponse.json({ error: "ownerId requerido y debe ser número" }, { status: 400 });
    }

    // ...elimina imágenes si es necesario...

    // Elimina la propiedad solo si el ownerId coincide
    await prisma.property.delete({
      where: {
        id: Number(params.id),
        ownerId: ownerId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar propiedad" }, { status: 500 });
  }
}
