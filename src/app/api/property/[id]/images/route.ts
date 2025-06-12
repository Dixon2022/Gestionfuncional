import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const propertyId = parseInt(context.params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  try {
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
    return NextResponse.json({ error: "No se pudieron guardar las imágenes" }, { status: 500 });
  }
}