import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdChangepipelineApiService } from '../../../../../../domains/projects/services/ProjectsProjectIdChangepipelineApiService';

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const result = await ProjectsProjectIdChangepipelineApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

