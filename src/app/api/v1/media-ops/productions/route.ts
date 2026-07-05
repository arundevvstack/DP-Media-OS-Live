// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const service = new BaseService("production");
    
    const { searchParams } = new URL(req.url);
    const filter: any = { company_id: session.company_id };
    
    if (searchParams.has("status")) filter.status = searchParams.get("status");
    if (searchParams.has("project_id")) filter.project_id = searchParams.get("project_id");

    const productions = await service.findMany({
      where: filter,
      include: {
        Project: true,
        Phases: true,
        Milestones: true,
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json({ data: productions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const service = new BaseService("production");
    
    const data = {
      ...body,
      company_id: session.company_id,
      status: body.status || "PLANNING"
    };

    const production = await service.create({
      data,
      include: { Project: true }
    });
    
    return NextResponse.json({ data: production }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

