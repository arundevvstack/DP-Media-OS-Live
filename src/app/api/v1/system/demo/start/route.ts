import { NextRequest, NextResponse } from 'next/server';
import { SystemDemoStartApiService } from '../../../../../../domains/platform/services/SystemDemoStartApiService';

export async function POST(req: Request) {
  try {
    const result = await SystemDemoStartApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

