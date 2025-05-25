// pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from "next";

const mockUsers = [
  {
    email: "admin@admin.com",
    password: "123456",
    name: "Admin",
    phone: "12345678",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }

  const { email, password } = req.body;

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res
      .status(401)
      .json({ error: "Correo o contraseña incorrectos" });
  }

  return res.status(200).json(user);
}
