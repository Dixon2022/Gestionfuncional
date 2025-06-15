import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      favorites: {
        include: {
          property: true,
        },
      },
    },
  });
  console.log("User found:", user);
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Extrae las propiedades favoritas
  const favorites = user.favorites.map((fav) => fav.property);

  return NextResponse.json({ favorites });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { propertyId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Agregar favorito
  await prisma.favorite.create({
    data: { userId: user.id, propertyId }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { propertyId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Eliminar favorito
  await prisma.favorite.deleteMany({
    where: { userId: user.id, propertyId }
  });

  return NextResponse.json({ ok: true });
}