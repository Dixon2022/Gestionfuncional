import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, message, propertyName, agentEmail } = req.body;

  // Basic server-side validation
  if (
    !name || typeof name !== 'string' || name.length < 2 ||
    !email || typeof email !== 'string' || !isValidEmail(email) ||
    !message || typeof message !== 'string' || message.length < 10 ||
    !propertyName || typeof propertyName !== 'string' ||
    !agentEmail || typeof agentEmail !== 'string' || !isValidEmail(agentEmail)
  ) {
    return res.status(400).json({ message: 'Datos inválidos en el formulario.' });
  }

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
      from: 'smtp@mailtrap.io', // Use a valid sender address for Mailtrap
      to: agentEmail,
      replyTo: `${name} <${email}>`,
      subject: `Consulta sobre la propiedad: ${propertyName}`,
      text: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone || 'No proporcionado'}\nMensaje: ${message}`,
    });

    res.status(200).json({ message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('Error enviando email:', error); // Log only on server
    res.status(500).json({ message: 'Error enviando el email. Intenta de nuevo más tarde.' });
  }
}
