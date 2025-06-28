import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

// GET /api/property/[id]/availability - Get availability for a property
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const availability = await prisma.propertyAvailability.findMany({
      where: { propertyId },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: "Error al obtener disponibilidad" }, { status: 500 });
  }
}

// POST /api/property/[id]/availability - Add new availability range
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { startDate, endDate, ownerId } = body;

    // Validate required fields
    if (!startDate || !endDate || !ownerId) {
      return NextResponse.json({ error: "Campos requeridos: startDate, endDate, ownerId" }, { status: 400 });
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, listingType: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    if (property.ownerId !== ownerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Only allow availability for rental properties
    if (property.listingType !== 'Alquiler') {
      return NextResponse.json({ error: "La disponibilidad solo aplica para propiedades de alquiler" }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: "La fecha de inicio debe ser anterior a la fecha de fin" }, { status: 400 });
    }

    if (start < new Date()) {
      return NextResponse.json({ error: "La fecha de inicio no puede ser en el pasado" }, { status: 400 });
    }

    // Check for overlapping availability
    const overlapping = await prisma.propertyAvailability.findFirst({
      where: {
        propertyId,
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
            ],
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json({ error: "Las fechas se superponen con disponibilidad existente" }, { status: 400 });
    }

    // Create availability
    const availability = await prisma.propertyAvailability.create({
      data: {
        propertyId,
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json({ error: "Error al crear disponibilidad" }, { status: 500 });
  }
}

// DELETE /api/property/[id]/availability - Delete availability range
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { availabilityId, ownerId } = body;

    if (!availabilityId || !ownerId) {
      return NextResponse.json({ error: "Campos requeridos: availabilityId, ownerId" }, { status: 400 });
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    if (property.ownerId !== ownerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Delete availability
    await prisma.propertyAvailability.delete({
      where: {
        id: availabilityId,
        propertyId, // Extra security check
      },
    });

    return NextResponse.json({ message: "Disponibilidad eliminada" });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json({ error: "Error al eliminar disponibilidad" }, { status: 500 });
  }
}
