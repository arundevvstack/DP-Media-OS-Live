import { NextRequest, NextResponse } from 'next/server';
import { ProjectsCreateApiService } from '../../../../../domains/projects/services/ProjectsCreateApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await ProjectsCreateApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

