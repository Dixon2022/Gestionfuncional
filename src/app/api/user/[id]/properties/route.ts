import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = parseInt(params.id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      include: { images: true },
    });

    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
