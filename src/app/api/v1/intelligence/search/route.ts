import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceSearchApiService } from '../../../../../domains/ai/services/IntelligenceSearchApiService';

export async function GET(req: Request) {
  try {
    const result = await IntelligenceSearchApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

