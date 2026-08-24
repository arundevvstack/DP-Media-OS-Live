import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdJobsRunApiService } from '../../../../../../../domains/projects/services/ProjectsProjectIdJobsRunApiService';

export async function POST(req: NextRequest, ctx: { params: Promise<{ projectId: string }> }) {
  try {
    const result = await ProjectsProjectIdJobsRunApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

