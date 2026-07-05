// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getUserDetails();
    const service = new BaseService("production");
    
    const production = await service.findOne({
      where: { 
        id: params.id,
        company_id: session.company_id
      },
      include: {
        Project: true,
        Phases: true,
        Milestones: true,
        CallSheets: true,
        CrewAssignments: {
          include: { User: true }
        }
      }
    });

    if (!production) {
      return NextResponse.json({ error: "Production not found" }, { status: 404 });
    }
    
    return NextResponse.json({ data: production });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getUserDetails();
    const body = await req.json();
    const service = new BaseService("production");
    
    // Ensure ownership
    await service.findOne({
      where: { id: params.id, company_id: session.company_id }
    });

    const production = await service.update({
      where: { id: params.id },
      data: body,
      include: { Project: true }
    });
    
    return NextResponse.json({ data: production });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
