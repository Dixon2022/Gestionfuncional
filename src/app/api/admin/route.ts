import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const reports = await prisma.propertyReport.findMany({
      include: {
        property: {
          include: {
            owner: true, // 👈 Asegúrate de incluir el owner aquí
            images: true // opcional: también puedes incluir imágenes si usas PropertyCard
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('[ADMIN REPORTES GET]', error);
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
  }
}

// DELETE: Eliminar una propiedad
export async function DELETE(req: Request) {
  try {
    const { propertyId, ownerId } = await req.json();

    // ...aquí tu lógica de permisos...

    // Elimina primero los reportes asociados y luego la propiedad
    await prisma.$transaction([
      prisma.propertyReport.deleteMany({
        where: { propertyId },
      }),
      prisma.property.delete({
        where: { id: propertyId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    return NextResponse.json(
      { error: 'Hubo un problema al eliminar la propiedad. Intenta más tarde.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();
  if (!token || !newPassword) {
    return NextResponse.json({ message: 'Datos incompletos.' }, { status: 400 });
  }

  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.expiresAt < new Date()) {
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status:400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: reset.email },
    data: { password: hashed },
  });

  // Borra el token para que no se reutilice
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });
}

// Código para manejar la creación del token de restablecimiento de contraseña
export async function createResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 hora
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt: expires,
    },
  });
}