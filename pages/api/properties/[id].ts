import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  switch (req.method) {
    case 'GET':
      const property = await prisma.property.findUnique({ where: { id: parseInt(id) } });
      return res.status(200).json(property);

    case 'PUT':
      const updated = await prisma.property.update({
        where: { id: parseInt(id) },
        data: { ...req.body, updatedAt: new Date() },
      });
      return res.status(200).json(updated);

    case 'DELETE':
      await prisma.property.delete({ where: { id: parseInt(id) } });
      return res.status(204).end();

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
