import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;

  const property = await prisma.property.findUnique({
    where: { id: parseInt(params.id) },
    include: { images: true, owner: true },
  });

  if (!property) {
    return new Response('Property not found', { status: 404 });
  }

  return new Response(JSON.stringify(property), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const body = await req.json();
  const propertyId = parseInt(params.id);
  
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // Get user ID from header
  const userIdHeader = req.headers.get('X-User-Id');
  if (!userIdHeader) {
    return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
  }

  const userId = parseInt(userIdHeader);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
  }

  try {
    // First check if the property exists and get its owner
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!existingProperty) {
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

    // Check ownership or admin role
    if (existingProperty.ownerId !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: "No tienes permiso para editar esta propiedad" }, { status: 403 });
    }

    // Update the property
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: body,
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let ownerId: number | undefined;
  try {
    const body = await req.json();
    ownerId = Number(body.ownerId);
    // No necesitas procesar images aquí, la DB lo hace en cascada
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!ownerId || isNaN(ownerId)) {
    return NextResponse.json({ error: "ownerId requerido y debe ser número" }, { status: 400 });
  }

  try {
    await prisma.property.delete({
      where: {
        id: propertyId,
        ownerId: ownerId,
      },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
