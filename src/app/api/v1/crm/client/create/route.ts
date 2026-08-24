import { NextRequest, NextResponse } from 'next/server';
import { CrmClientCreateApiService } from '../../../../../../domains/crm/services/CrmClientCreateApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await CrmClientCreateApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

