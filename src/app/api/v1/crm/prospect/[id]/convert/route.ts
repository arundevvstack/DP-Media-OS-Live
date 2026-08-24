import { NextRequest, NextResponse } from 'next/server';
import { CrmProspectIdConvertApiService } from '../../../../../../../domains/crm/services/CrmProspectIdConvertApiService';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const result = await CrmProspectIdConvertApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

