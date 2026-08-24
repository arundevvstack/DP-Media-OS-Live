import { NextRequest, NextResponse } from 'next/server';
import { IntegrationsEtimeofficeTestconnectionApiService } from '../../../../../../domains/platform/services/IntegrationsEtimeofficeTestconnectionApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await IntegrationsEtimeofficeTestconnectionApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

