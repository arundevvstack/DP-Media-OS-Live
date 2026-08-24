import { NextRequest, NextResponse } from 'next/server';
import { CrmProspectCreateApiService } from '../../../../../../domains/crm/services/CrmProspectCreateApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await CrmProspectCreateApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

