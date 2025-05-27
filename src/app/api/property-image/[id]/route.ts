import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path

// GET single image - Remains public for now, consider if auth is needed based on app requirements
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const imageId = parseInt(params.id);
  if (isNaN(imageId)) {
    return NextResponse.json({ error: "Invalid image ID format" }, { status: 400 });
  }

  try {
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: { select: { id: true, title: true } } }, // Include minimal property info
    });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json(image);
  } catch (error) {
    console.error(`GET /api/property-image/${params.id} error:`, error);
    return NextResponse.json({ error: "Error fetching image" }, { status: 500 });
  }
}

// UPDATE image (e.g., order)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const imageId = parseInt(params.id);

  if (isNaN(imageId)) {
    return NextResponse.json({ error: "Invalid image ID format" }, { status: 400 });
  }

  try {
    const imageToUpdate = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true }, // Need property to check ownerId
    });

    if (!imageToUpdate) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (imageToUpdate.property.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden: You do not own the property this image belongs to" }, { status: 403 });
    }

    const body = await req.json();
    const { order } = body; // Assuming only 'order' is updatable for an image

    if (typeof order !== 'number') {
      return NextResponse.json({ error: "Invalid data: 'order' must be a number" }, { status: 400 });
    }

    const updatedImage = await prisma.propertyImage.update({
      where: { id: imageId },
      data: { order },
    });
    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error(`PUT /api/property-image/${params.id} error:`, error);
    return NextResponse.json({ error: "Image update failed" }, { status: 500 });
  }
}

// DELETE image
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const imageId = parseInt(params.id);

  if (isNaN(imageId)) {
    return NextResponse.json({ error: "Invalid image ID format" }, { status: 400 });
  }

  try {
    const imageToDelete = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true }, // Need property to check ownerId
    });

    if (!imageToDelete) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (imageToDelete.property.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden: You do not own the property this image belongs to" }, { status: 403 });
    }

    await prisma.propertyImage.delete({
      where: { id: imageId },
    });
    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/property-image/${params.id} error:`, error);
    return NextResponse.json({ error: "Image deletion failed" }, { status: 500 });
  }
}
