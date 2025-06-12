import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

// POST /api/property/[id]/images
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const propertyId = parseInt(params.id);
    if (isNaN(propertyId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { images } = body as { images: string[] };

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No hay imágenes para guardar" }, { status: 400 });
    }

    // Guarda cada imagen como un registro PropertyImage
    const createdImages = await Promise.all(
      images.map((url, idx) =>
        prisma.propertyImage.create({
          data: {
            url,
            order: idx,
            propertyId,
          },
        })
      )
    );

    return NextResponse.json({ images: createdImages }, { status: 201 });
  } catch (error) {
    console.error("POST /api/property/[id]/images error:", error);
    return NextResponse.json({ error: "Error al guardar imágenes" }, { status: 500 });
  }
}