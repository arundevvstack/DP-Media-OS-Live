import { NextRequest, NextResponse } from 'next/server';
import { ProductionSettingsProvidersApiService } from '../../../../../../domains/production/services/ProductionSettingsProvidersApiService';

export async function GET(req: Request) {
  try {
    const result = await ProductionSettingsProvidersApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const result = await ProductionSettingsProvidersApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

