import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  // Generate a reset token (in production, store this in DB with expiration)
  const token = crypto.randomBytes(32).toString('hex');
  // TODO: Save token and email to DB with expiration for real implementation

  // Construct reset URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

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

    res.status(200).json({ message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.' });
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    res.status(500).json({ message: 'Error enviando el email de recuperación.' });
  }
}
