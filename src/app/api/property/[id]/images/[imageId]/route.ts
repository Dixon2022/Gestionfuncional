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
    await prisma.propertyImage.delete({
      where: { id: imageId },
    });
    return NextResponse.json({ message: "Imagen eliminada" });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar la imagen" }, { status: 500 });
  }
}