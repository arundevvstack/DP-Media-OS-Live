// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const service = new BaseService("aIAsset"); // Prisma models are usually lower camelCase in BaseService
    
    const { searchParams } = new URL(req.url);
    const filter: any = { 
      Production: { company_id: session.company_id }
    };
    
    if (searchParams.has("production_id")) filter.production_id = searchParams.get("production_id");

    const result = await service.findMany(filter, {
      include: {
        Production: {
          select: { name: true }
        },
        Versions: true
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const service = new BaseService("aIAsset");
    
    if (!body.production_id || !body.name || !body.asset_type || !body.url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await service.create({
      production_id: body.production_id,
      name: body.name,
      asset_type: body.asset_type,
      url: body.url,
      metadata: body.metadata || {},
      prompt_link: body.prompt_link || null,
      status: body.status || "GENERATED"
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
