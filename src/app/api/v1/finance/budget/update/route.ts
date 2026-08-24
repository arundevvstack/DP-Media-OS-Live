import { NextRequest, NextResponse } from 'next/server';
import { FinanceBudgetUpdateApiService } from '../../../../../../domains/finance/services/FinanceBudgetUpdateApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await FinanceBudgetUpdateApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

