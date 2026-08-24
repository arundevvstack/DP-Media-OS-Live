import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceReportingApiService } from '../../../../../domains/ai/services/IntelligenceReportingApiService';

export async function GET(req: Request) {
  try {
    const result = await IntelligenceReportingApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

