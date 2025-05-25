import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters: any = {};

  if (searchParams.get("city")) {
    filters.city = searchParams.get("city");
  }
  if (searchParams.get("type")) {
    filters.type = searchParams.get("type");
  }
  if (searchParams.get("minPrice") && searchParams.get("maxPrice")) {
    filters.price = {
      gte: parseFloat(searchParams.get("minPrice")!),
      lte: parseFloat(searchParams.get("maxPrice")!),
    };
  }

  try {
    const filtered = await prisma.property.findMany({
      where: filters,
      include: { images: true, owner: true },
    });

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "Filter error" }, { status: 400 });
  }
}
