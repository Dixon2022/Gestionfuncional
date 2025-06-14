import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(req: Request) {
  const { id, role } = await req.json();
  if (typeof id !== "number" || !["admin", "user"].includes(role)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id },
    data: { role },
  });
  return NextResponse.json({ success: true });
}