import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdStagesTransitionApiService } from '../../../../../../../domains/projects/services/ProjectsProjectIdStagesTransitionApiService';

export async function POST(req: NextRequest, ctx: { params: Promise<{ projectId: string }> }) {
  try {
    const result = await ProjectsProjectIdStagesTransitionApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

