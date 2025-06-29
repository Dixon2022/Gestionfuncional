import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const propertyId = parseInt(id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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
    // Check if the property exists and if the user owns it or is admin
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // Check if user is the owner or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (property.ownerId !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: "No tienes permiso para subir imágenes a esta propiedad" }, { status: 403 });
    }

    const { images } = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No hay imágenes" }, { status: 400 });
    }

    // Guarda cada imagen como PropertyImage
    const created = await Promise.all(
      images.map((img: string, idx: number) =>
        prisma.propertyImage.create({
          data: {
            url: img,
            order: idx,
            propertyId,
          },
        })
      )
    );

    return NextResponse.json({ images: created });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: "No se pudieron guardar las imágenes" }, { status: 500 });
  }
}