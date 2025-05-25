import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // Asegúrate que la ruta sea correcta

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !phone || !password) {
        // Validación básica de campos
        return res.status(400).json({ error: "Missing fields" });
      }

      const newUser = await prisma.user.create({
        data: { name, email, phone, password },
      });

      return res.status(201).json(newUser);
    }

    if (req.method === "GET") {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
