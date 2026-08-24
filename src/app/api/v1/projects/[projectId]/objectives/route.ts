import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdObjectivesApiService } from '../../../../../../domains/projects/services/ProjectsProjectIdObjectivesApiService';

export async function GET(req: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const result = await ProjectsProjectIdObjectivesApiService.handleGET(req, context);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ projectId: string }> }) {
  try {
    const result = await ProjectsProjectIdObjectivesApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

