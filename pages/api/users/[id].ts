import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  switch (req.method) {
    case 'GET':
      const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
      return res.status(200).json(user);

    case 'PUT':
      const { name, email, phone } = req.body;
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { name, email, phone, updatedAt: new Date() },
      });
      return res.status(200).json(updatedUser);

    case 'DELETE':
      await prisma.user.delete({ where: { id: parseInt(id) } });
      return res.status(204).end();

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
