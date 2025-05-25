// GET all properties / POST new property
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

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
      ownerId,
    } = body;

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
        ownerId,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("POST /api/property error:", error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
