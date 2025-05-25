// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import NextCors from "nextjs-cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Aquí habilitas CORS para todas las peticiones que entren a este endpoint
  await NextCors(req, res, {
    origin: "*", // Puedes limitar a tu dominio si quieres, ejemplo: 'https://gestionfuncional.vercel.app'
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  });

  try {
    if (req.method === "POST") {
      const { name, email, phone, password } = req.body;
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const newUser = await prisma.user.create({ data: { name, email, phone, password } });
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
