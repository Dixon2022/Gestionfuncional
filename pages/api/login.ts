// pages/api/login.ts

import { NextApiRequest, NextApiResponse } from "next";

// Simulación de base de datos (reemplaza por tu lógica real)
const mockUsers = [
  {
    email: "test@example.com",
    password: "123456",
    name: "Juan Pérez",
    phone: "12345678",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    return res.status(200).json(user);
  }

  // Si no es POST, rechaza con 405
  res.setHeader("Allow", ["POST"]);
  return res.status(405).end(`Método ${req.method} no permitido`);
}
