import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceBidsApiService } from '../../../../../domains/platform/services/MarketplaceBidsApiService';

export async function POST(req: Request) {
  try {
    const result = await MarketplaceBidsApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

