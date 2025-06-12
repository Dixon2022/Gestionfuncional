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
  try {
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  try {
    await prisma.property.delete({
      where: { id: propertyId },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
