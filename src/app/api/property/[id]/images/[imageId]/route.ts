import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";

// DELETE /api/property/[id]/images/[imageId]
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; imageId: string } }
) {
  const { id, imageId: imageIdParam } = await context.params;
  const propertyId = parseInt(id);
  const imageId = parseInt(imageIdParam);
  
  if (isNaN(propertyId) || isNaN(imageId)) {
    return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
  }

  // Get user ID from header for authorization
  const userIdHeader = req.headers.get('X-User-Id');
  if (!userIdHeader) {
    return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
  }

  const userId = parseInt(userIdHeader);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
  }

  try {
    // Check if the image exists and get the property
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: {
        property: {
          select: { ownerId: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }

    // Verify that the image belongs to the specified property
    if (image.propertyId !== propertyId) {
      return NextResponse.json({ error: "La imagen no pertenece a esta propiedad" }, { status: 400 });
    }

    // Check if user is the owner or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (image.property.ownerId !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta imagen" }, { status: 403 });
    }

    await prisma.propertyImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Imagen eliminada" });
  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json({ error: "No se pudo eliminar la imagen" }, { status: 500 });
  }
}