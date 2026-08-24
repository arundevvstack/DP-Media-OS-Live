import { NextRequest, NextResponse } from 'next/server';
import { IntegrationsEtimeofficePushleaveApiService } from '../../../../../../domains/platform/services/IntegrationsEtimeofficePushleaveApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await IntegrationsEtimeofficePushleaveApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

