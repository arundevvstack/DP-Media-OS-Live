import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceMarketNotesApiService } from '../../../../../../domains/ai/services/IntelligenceMarketNotesApiService';

export async function POST(request: Request) {
  try {
    const result = await IntelligenceMarketNotesApiService.handlePOST(request);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

