import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// Get all images
export async function GET() {
  const images = await prisma.propertyImage.findMany({
    include: { property: true },
  });
  return NextResponse.json(images);
}

// Create new image
export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const image = await prisma.propertyImage.create({
      data: {
        url: body.url,
        order: body.order,
        propertyId: body.propertyId,
      },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }
}
