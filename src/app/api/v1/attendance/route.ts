import { NextRequest, NextResponse } from 'next/server';
import { AttendanceApiService } from '../../../../domains/platform/services/AttendanceApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await AttendanceApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

