import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceMarketCrmsyncApiService } from '../../../../../../domains/ai/services/IntelligenceMarketCrmsyncApiService';

export async function POST(request: Request) {
  try {
    const result = await IntelligenceMarketCrmsyncApiService.handlePOST(request);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

