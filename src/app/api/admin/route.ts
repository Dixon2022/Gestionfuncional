import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';


export async function GET() {
  try {
    const reports = await prisma.propertyReport.findMany({
      include: {
        property: {
          include: {
            owner: true, // 👈 Asegúrate de incluir el owner aquí
            images: true // opcional: también puedes incluir imágenes si usas PropertyCard
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('[ADMIN REPORTES GET]', error);
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
  }
}

// DELETE: Eliminar una propiedad
export async function DELETE(req: Request) {
  try {
    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId requerido' }, { status: 400 });
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN REPORTES DELETE]', error);
    return NextResponse.json({ error: 'Error al eliminar propiedad' }, { status: 500 });
  }
}