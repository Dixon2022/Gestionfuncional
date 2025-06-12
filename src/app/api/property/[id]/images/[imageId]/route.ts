import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";

// DELETE /api/property/[id]/images/[imageId]
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; imageId: string } }
) {
  const imageId = parseInt(context.params.imageId);
  if (isNaN(imageId)) {
    return NextResponse.json({ error: "ID de imagen inválido" }, { status: 400 });
  }
  try {
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }
    await prisma.propertyImage.delete({
      where: { id: imageId },
    });
    return NextResponse.json({ message: "Imagen eliminada" });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar la imagen" }, { status: 500 });
  }
}