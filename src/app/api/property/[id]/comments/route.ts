import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

// GET /api/property/[id]/comments - Get all comments for a property
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const comments = await prisma.propertyComment.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // Don't include sensitive data like email, phone, password
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 });
  }
}

// POST /api/property/[id]/comments - Add a new comment
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { comment, userId } = body;

    // Validate required fields
    if (!comment || !userId) {
      return NextResponse.json({ error: "Campos requeridos: comment, userId" }, { status: 400 });
    }

    // Convert userId to integer
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    // Validate comment length
    if (typeof comment !== 'string' || comment.trim().length < 10) {
      return NextResponse.json({ error: "El comentario debe tener al menos 10 caracteres" }, { status: 400 });
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json({ error: "El comentario no puede exceder 1000 caracteres" }, { status: 400 });
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // Verify user exists and is not blocked
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      select: { id: true, blocked: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.blocked) {
      return NextResponse.json({ error: "Usuario bloqueado" }, { status: 403 });
    }

    // Create comment
    const newComment = await prisma.propertyComment.create({
      data: {
        propertyId,
        userId: userIdInt,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 });
  }
}

// DELETE /api/property/[id]/comments - Delete a comment
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { commentId, userId } = body;

    if (!commentId || !userId) {
      return NextResponse.json({ error: "Campos requeridos: commentId, userId" }, { status: 400 });
    }

    // Get comment to verify ownership
    const comment = await prisma.propertyComment.findUnique({
      where: { id: commentId },
      select: { userId: true, propertyId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    if (comment.propertyId !== propertyId) {
      return NextResponse.json({ error: "Comentario no pertenece a esta propiedad" }, { status: 400 });
    }

    // Check if user is the comment author or an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const isOwner = comment.userId === userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "No autorizado para eliminar este comentario" }, { status: 403 });
    }

    // Delete comment
    await prisma.propertyComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: "Error al eliminar comentario" }, { status: 500 });
  }
}
