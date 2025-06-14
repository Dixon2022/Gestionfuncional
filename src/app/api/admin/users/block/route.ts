import { NextResponse } from "next/server";
import { prisma } from  "../../../../../../lib/prisma";

export async function POST(req: Request) {
  const { id, blocked } = await req.json();
  if (typeof id !== "number" || typeof blocked !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id },
    data: { blocked },
  });
  return NextResponse.json({ success: true });
}