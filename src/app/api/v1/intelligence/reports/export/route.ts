import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceReportsExportApiService } from '../../../../../../domains/ai/services/IntelligenceReportsExportApiService';

export async function GET(req: NextRequest) {
  try {
    const result = await IntelligenceReportsExportApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

