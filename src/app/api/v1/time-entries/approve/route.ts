import { NextRequest, NextResponse } from 'next/server';
import { TimeentriesApproveApiService } from '../../../../../domains/hrm/services/TimeentriesApproveApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await TimeentriesApproveApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

