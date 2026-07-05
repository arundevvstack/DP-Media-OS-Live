// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const service = new BaseService("callSheet");
    
    // Ensure production belongs to company
    const prod = await prisma.production.findFirst({
      where: { id: params.id, company_id: session.company_id }
    });
    if (!prod) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const sheets = await service.findMany({
      where: { production_id: params.id },
      include: {
        ShootDay: {
          include: {
            Scenes: true,
            CrewAssignments: {
              include: { User: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json({ data: sheets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    
    // Auth check
    const prod = await prisma.production.findFirst({
      where: { id: params.id, company_id: session.company_id }
    });
    if (!prod) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // A CallSheet MUST have a ShootDay. If one doesn't exist for the body.date, we create it.
    let shootDayId = body.shoot_day_id;
    if (!shootDayId && body.date) {
        const newShootDay = await prisma.shootDay.create({
            data: {
                production_id: params.id,
                date: new Date(body.date),
                call_time: new Date(body.call_time || body.date),
                wrap_time: new Date(body.wrap_time || body.date),
                location_id: body.location_id
            }
        });
        shootDayId = newShootDay.id;
    }

    const service = new BaseService("callSheet");
    const sheet = await service.create({
      data: {
        production_id: params.id,
        shoot_day_id: shootDayId,
        special_notes: body.special_notes,
        weather_notes: body.weather_notes,
        status: body.status || "DRAFT"
      },
      include: { ShootDay: true }
    });
    
    return NextResponse.json({ data: sheet }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
