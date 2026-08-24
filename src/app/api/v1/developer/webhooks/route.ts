import { NextRequest, NextResponse } from 'next/server';
import { DeveloperWebhooksApiService } from '../../../../../domains/platform/services/DeveloperWebhooksApiService';

export async function POST(req: Request) {
  try {
    const result = await DeveloperWebhooksApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

