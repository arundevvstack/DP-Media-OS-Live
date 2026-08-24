import { NextRequest, NextResponse } from 'next/server';
import { QueueProcessApiService } from '../../../../../domains/platform/services/QueueProcessApiService';

export async function POST(req: Request) {
  try {
    const result = await QueueProcessApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

