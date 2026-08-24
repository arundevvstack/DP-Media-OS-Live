import { NextRequest, NextResponse } from 'next/server';
import { CrmProspectIdPilotApiService } from '../../../../../../../domains/crm/services/CrmProspectIdPilotApiService';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const result = await CrmProspectIdPilotApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

