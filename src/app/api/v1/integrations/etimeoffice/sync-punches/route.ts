import { NextRequest, NextResponse } from 'next/server';
import { IntegrationsEtimeofficeSyncpunchesApiService } from '../../../../../../domains/platform/services/IntegrationsEtimeofficeSyncpunchesApiService';

export async function GET(req: NextRequest) {
  try {
    const result = await IntegrationsEtimeofficeSyncpunchesApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await IntegrationsEtimeofficeSyncpunchesApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

