import { NextRequest, NextResponse } from 'next/server';
import { WebhooksStripeApiService } from '../../../../../domains/platform/services/WebhooksStripeApiService';

export async function POST(req: Request) {
  try {
    const result = await WebhooksStripeApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

