import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { prisma } from '../../../../lib/prisma'; // Asegúrate de importar prisma

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return NextResponse.json({ message: 'Email inválido.' }, { status: 400 });
  }

  // Generate a reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  // Guarda el token en la base de datos
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt: expires,
    },
  });

  // Construct reset URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gestionfuncional.vercel.app';
  const resetUrl = `${baseUrl}/profile/reset-password?token=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: 'smtp@mailtrap.io',
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Has solicitado cambiar tu contraseña. Haz clic en el siguiente enlace para restablecerla:\n\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.`,
    });

    return NextResponse.json({ message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.' });
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    return NextResponse.json({ message: 'Error enviando el email de recuperación.' }, { status: 500 });
  }
}
