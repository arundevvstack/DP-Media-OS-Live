// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    
    // Auth check
    const prod = await prisma.production.findFirst({
      where: { id: params.id, company_id: session.company_id }
    });
    if (!prod) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const service = new BaseService("crewAssignment");
    const crew = await service.findMany({
      where: { production_id: params.id },
      include: {
        User: true,
        ShootDay: true
      }
    });
    
    return NextResponse.json({ data: crew });
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

    const service = new BaseService("crewAssignment");
    const assignment = await service.create({
      data: {
        production_id: params.id,
        user_id: body.user_id,
        role: body.role,
        shoot_day_id: body.shoot_day_id || null,
        status: body.status || "CONFIRMED"
      },
      include: { User: true }
    });
    
    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
