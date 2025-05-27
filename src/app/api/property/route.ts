// GET all properties / POST new property
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as needed

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: true,
        images: true,
      },
    });
    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      address,
      city,
      price,
      area,
      lotSize,
      bedrooms,
      bathrooms,
      yearBuilt,
      type,
      listingType,
      features,
      isFeatured,
      mainImageUri,
      // ownerId, // ownerId will be taken from session
    } = body;

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        price,
        area,
        lotSize,
        bedrooms,
        bathrooms,
        yearBuilt,
        type,
        listingType,
        features,
        isFeatured,
        mainImageUri,
        ownerId: userId, // Use authenticated user's ID
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("POST /api/property error:", error);
    // It's good practice to check error type for more specific messages
    if (error instanceof z.ZodError) { // Assuming you might use Zod for validation
        return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// Helper import for ZodError if you use Zod, otherwise remove
import * as z from 'zod';
