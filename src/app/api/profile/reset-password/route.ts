import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, currentPassword, newPassword } = await req.json();
  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json({ message: 'Datos incompletos.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ message: 'La contraseña actual es incorrecta.' }, { status: 401 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });
}