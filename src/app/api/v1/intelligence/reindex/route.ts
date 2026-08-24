import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceReindexApiService } from '../../../../../domains/ai/services/IntelligenceReindexApiService';

export async function POST() {
  try {
    const result = await IntelligenceReindexApiService.handlePOST();
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

