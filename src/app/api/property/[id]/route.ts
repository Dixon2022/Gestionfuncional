import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: parseInt(params.id) },
    include: { images: true, owner: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    const updated = await prisma.property.update({
      where: { id: parseInt(params.id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.property.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
