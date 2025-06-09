//Api de reporte de propiedades
// post y get

import { NextResponse } from 'next/server';
import {prisma} from '../../../../lib/prisma';

// POST: Crear un nuevo reporte
export async function POST(req: Request) {
  try {
    const { propertyId, reason, message } = await req.json();

    if (!propertyId || !reason) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const report = await prisma.propertyReport.create({
      data: {
        propertyId,
        reason,
        message,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('[REPORT POST ERROR]', error);
    return NextResponse.json({ error: 'Error interno al crear el reporte' }, { status: 500 });
  }
}

// GET: Obtener todos los reportes (idealmente solo para admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const where = propertyId ? { propertyId: Number(propertyId) } : {};
    const reports = await prisma.propertyReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('[REPORT GET ERROR]', error);
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
  }
}