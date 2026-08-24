import { NextRequest, NextResponse } from 'next/server';
import { SystemDemoseedApiService } from '../../../../../domains/platform/services/SystemDemoseedApiService';

export async function POST(req: Request) {
  try {
    const result = await SystemDemoseedApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

