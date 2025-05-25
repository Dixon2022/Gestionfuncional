import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// GET single image
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const image = await prisma.propertyImage.findUnique({
    where: { id: parseInt(params.id) },
    include: { property: true },
  });
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(image);
}

// UPDATE image
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    const updated = await prisma.propertyImage.update({
      where: { id: parseInt(params.id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

// DELETE image
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.propertyImage.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ message: "Image deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
