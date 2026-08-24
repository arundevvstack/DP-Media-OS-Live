import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdAssistantChatApiService } from '../../../../../../../domains/projects/services/ProjectsProjectIdAssistantChatApiService';

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const result = await ProjectsProjectIdAssistantChatApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

