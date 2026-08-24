import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceCopilotApiService } from '../../../../../domains/ai/services/IntelligenceCopilotApiService';

export async function POST(req: Request) {
  try {
    const result = await IntelligenceCopilotApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

