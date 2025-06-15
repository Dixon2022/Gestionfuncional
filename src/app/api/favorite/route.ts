import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET: obtener favoritos
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email no proporcionado" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        favorites: {
          include: {
            property: {
              include: {
                images: true, // aquí incluyes las imágenes de la propiedad
              },
            },
          },
        },
      },
    });

    if (!user)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );

    const favorites = user.favorites.map((fav) => fav.property);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error en GET /favorites:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: agregar favorito
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY recibido en POST /api/favorite:", body);

    const { propertyId, email } = body;

    if (!email || !propertyId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );

    await prisma.favorite.create({
      data: { userId: user.id, propertyId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error en POST /api/favorite:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", detail: error.message },
      { status: 500 }
    );
  }
}

// DELETE: eliminar favorito
export async function DELETE(req: Request) {
  try {
    const { propertyId, email } = await req.json();

    if (!email) return NextResponse.json({ error: "No autorizado: falta email" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    await prisma.favorite.deleteMany({
      where: { userId: user.id, propertyId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en DELETE /favorite:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
