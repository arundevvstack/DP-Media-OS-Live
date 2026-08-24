import { NextRequest, NextResponse } from 'next/server';
import { FinanceVendorApiService } from '../../../../../domains/finance/services/FinanceVendorApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await FinanceVendorApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

