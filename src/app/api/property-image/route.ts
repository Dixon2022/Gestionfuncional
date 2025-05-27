import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path

// Get all images - ควรจำกัดการเข้าถึงนี้เพิ่มเติมใน production app
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Note: Returning all images across all properties is generally not advised
  // without proper admin role checks and pagination.
  try {
    const images = await prisma.propertyImage.findMany({
      include: { property: { select: { id: true, title: true, ownerId: true } } }, // Include some property context
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET /api/property-image error:", error);
    return NextResponse.json({ error: "Error fetching images" }, { status: 500 });
  }
}

// Create new image
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { url, order, propertyId } = body;

    if (!url || !propertyId) {
      return NextResponse.json({ error: "Missing required fields: url and propertyId" }, { status: 400 });
    }
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    const image = await prisma.propertyImage.create({
      data: {
        url,
        order: order || 0, // Default order to 0 if not provided
        propertyId,
      },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("POST /api/property-image error:", error);
    return NextResponse.json({ error: "Failed to create image record" }, { status: 500 });
  }
}
