import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdIntelligenceApiService } from '../../../../../../domains/projects/services/ProjectsProjectIdIntelligenceApiService';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const result = await ProjectsProjectIdIntelligenceApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

