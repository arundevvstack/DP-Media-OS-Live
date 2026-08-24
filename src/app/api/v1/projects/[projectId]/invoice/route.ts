import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdInvoiceApiService } from '../../../../../../domains/projects/services/ProjectsProjectIdInvoiceApiService';

export async function POST(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  try {
    const result = await ProjectsProjectIdInvoiceApiService.handlePOST(req, context);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

