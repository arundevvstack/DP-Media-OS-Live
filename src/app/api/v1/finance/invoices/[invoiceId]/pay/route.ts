import { NextRequest, NextResponse } from 'next/server';
import { FinanceInvoicesInvoiceIdPayApiService } from '../../../../../../../domains/finance/services/FinanceInvoicesInvoiceIdPayApiService';

export async function POST(req: NextRequest, ctx: { params: { invoiceId: string } }) {
  try {
    const result = await FinanceInvoicesInvoiceIdPayApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

