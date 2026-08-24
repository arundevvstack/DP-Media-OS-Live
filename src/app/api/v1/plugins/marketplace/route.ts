import { NextRequest, NextResponse } from 'next/server';
import { PluginsMarketplaceApiService } from '../../../../../domains/platform/services/PluginsMarketplaceApiService';

export async function GET(req: Request) {
  try {
    const result = await PluginsMarketplaceApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const result = await PluginsMarketplaceApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

