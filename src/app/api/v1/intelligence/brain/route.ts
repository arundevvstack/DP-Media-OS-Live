import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceBrainApiService } from '../../../../../domains/ai/services/IntelligenceBrainApiService';

export async function POST(req: Request) {
  try {
    const result = await IntelligenceBrainApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

