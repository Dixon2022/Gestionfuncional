import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma"; // o como tengas configurado tu prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
  });
}
