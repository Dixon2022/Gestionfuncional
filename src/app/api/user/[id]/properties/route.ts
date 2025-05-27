import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const requestedUserId = parseInt(params.id);

  if (isNaN(requestedUserId)) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
  }

  if (!session || !session.user || (session.user as any).id !== requestedUserId) {
    // Users can only fetch their own properties.
    // Admin/other roles would require different logic.
    return NextResponse.json({ error: "Unauthorized to view these properties" }, { status: 401 });
  }

  // At this point, (session.user as any).id is equal to requestedUserId
  const authenticatedUserId = (session.user as any).id;

  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: authenticatedUserId }, // Fetch properties for the authenticated user
      include: { 
        images: true,
        // Optionally include other details if needed by the client
        // owner: { select: { name: true, email: true } } // Example
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error(`GET /api/user/${params.id}/properties error:`, error);
    return NextResponse.json({ error: "Failed to fetch user properties" }, { status: 500 });
  }
}
