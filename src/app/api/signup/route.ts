// app/api/signup/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

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
