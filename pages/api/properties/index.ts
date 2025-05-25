import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const properties = await prisma.property.findMany();
    return res.status(200).json(properties);
  }

  if (req.method === 'POST') {
    const data = req.body;

    try {
      const newProperty = await prisma.property.create({ data });
      return res.status(201).json(newProperty);
    } catch (error) {
      return res.status(400).json({ error: 'Error creating property', details: error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
