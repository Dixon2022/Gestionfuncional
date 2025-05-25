import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    // ✅ GET: todos los usuarios o uno por ID
    case 'GET':
      if (req.query.id) {
        const id = parseInt(req.query.id as string);
        if (isNaN(id)) {
          return res.status(400).json({ error: 'ID inválido' });
        }
        try {
          const usuario = await prisma.usuario.findUnique({ where: { id } });
          if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
          }
          return res.status(200).json(usuario);
        } catch (error) {
          return res.status(500).json({ error: 'Error al obtener el usuario' });
        }
      } else {
        const usuarios = await prisma.usuario.findMany();
        return res.status(200).json(usuarios);
      }

    // ✅ POST: crear usuario
    case 'POST':
      const { nombre, email } = req.body;
      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }
      try {
        const nuevoUsuario = await prisma.usuario.create({
          data: { nombre, email }
        });
        return res.status(201).json(nuevoUsuario);
      } catch (error) {
        return res.status(500).json({ error: 'Error al crear usuario' });
      }

    // ✅ PUT: actualizar usuario
    case 'PUT':
      const idToUpdate = parseInt(req.query.id as string);
      const { nombre: nombreUpdate, email: emailUpdate } = req.body;

      if (isNaN(idToUpdate)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      try {
        const usuarioActualizado = await prisma.usuario.update({
          where: { id: idToUpdate },
          data: {
            nombre: nombreUpdate,
            email: emailUpdate
          }
        });
        return res.status(200).json(usuarioActualizado);
      } catch (error) {
        return res.status(500).json({ error: 'Error al actualizar usuario' });
      }

    // ✅ DELETE: eliminar usuario
    case 'DELETE':
      const idToDelete = parseInt(req.query.id as string);
      if (isNaN(idToDelete)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      try {
        await prisma.usuario.delete({ where: { id: idToDelete } });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Error al eliminar usuario' });
      }

    // ❌ Método no permitido
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Método ${method} no permitido`);
  }
}
