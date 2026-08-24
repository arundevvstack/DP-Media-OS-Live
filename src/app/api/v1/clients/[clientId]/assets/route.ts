import { NextRequest, NextResponse } from 'next/server';
import { ClientsClientIdAssetsApiService } from '../../../../../../domains/crm/services/ClientsClientIdAssetsApiService';

export async function POST(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const result = await ClientsClientIdAssetsApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

