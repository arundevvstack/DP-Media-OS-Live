import { NextRequest, NextResponse } from 'next/server';
import { ProductionSettingsProvidersIdTestApiService } from '../../../../../../../../domains/production/services/ProductionSettingsProvidersIdTestApiService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await ProductionSettingsProvidersIdTestApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

