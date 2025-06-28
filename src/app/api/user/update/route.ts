import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, userDescription } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(userDescription !== undefined && { userDescription }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        userDescription: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
