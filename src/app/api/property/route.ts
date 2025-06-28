// GET all properties / POST new property
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { number } from "zod";

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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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

    if (!mainImageUri) {
      return NextResponse.json(
        { error: "mainImageUri es requerido" },
        { status: 400 }
      );
    }

    // Validate and convert ownerId
    const ownerIdNumber = parseInt(ownerId);
    if (isNaN(ownerIdNumber)) {
      return NextResponse.json({ error: "ownerId debe ser un número válido" }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        price: Number(price), 
        area: area ? Number(area) : null,
        lotSize: lotSize ? Number(lotSize) : null,
        bedrooms: Number(bedrooms), 
        bathrooms: Number(bathrooms), 
        yearBuilt: yearBuilt ? Number(yearBuilt) : null,
        type,
        listingType,
        features,
        isFeatured,
        mainImageUri,
        ownerId: ownerIdNumber,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("POST /api/property error:", error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { propertyId, ownerId } = await req.json();
    if (!propertyId || !ownerId) {
      return NextResponse.json(
        { error: "Faltan datos para eliminar la propiedad." },
        { status: 400 }
      );
    }

    // Verificar que la propiedad exista y pertenezca al usuario
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "La propiedad no existe o ya fue eliminada." },
        { status: 404 }
      );
    }

    if (property.ownerId !== ownerId) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta propiedad." },
        { status: 403 }
      );
    }

    // Eliminar reportes y luego la propiedad, de forma atómica
    await prisma.$transaction([
      prisma.propertyReport.deleteMany({
        where: { propertyId },
      }),
      prisma.property.delete({
        where: { id: propertyId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar propiedad:", error);
    return NextResponse.json(
      {
        error: "Hubo un problema al eliminar la propiedad. Intenta más tarde.",
      },
      { status: 500 }
    );
  }
}
