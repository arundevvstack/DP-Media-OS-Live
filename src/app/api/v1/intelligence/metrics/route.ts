import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceMetricsApiService } from '../../../../../domains/ai/services/IntelligenceMetricsApiService';

export async function GET() {
  try {
    const result = await IntelligenceMetricsApiService.handleGET();
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

