import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const type = searchParams.get("type"); // <-- Cambia aquí
  const exclude = searchParams.get("exclude");

  if (!city || !type) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // Obtén todas las propiedades (ajusta según tu fuente de datos)
  const allProperties = await prisma.property.findMany({
    include: {
      images: true,
    },
  });
  // Filtra propiedades similares
  const similar = allProperties
    .filter(
      (prop: any) =>
        prop.city === city &&
        prop.type === type &&
        String(prop.id) !== String(exclude)
    )
    .slice(0, 10); // Limita a 10 resultados

  return NextResponse.json(similar);
}
