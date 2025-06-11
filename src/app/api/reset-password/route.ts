import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

// Cambia la contraseña usando el token recibido
export async function POST(req: Request) {
  const { token, newPassword } = await req.json();
  if (!token || !newPassword) {
    return NextResponse.json({ message: 'Datos incompletos.' }, { status: 400 });
  }

  // Busca el token en la base de datos y verifica que no esté expirado
  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.expiresAt < new Date()) {
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 400 });
  }

  // Actualiza la contraseña del usuario
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: reset.email },
    data: { password: hashed },
  });

  // Borra el token para que no se reutilice
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });
}