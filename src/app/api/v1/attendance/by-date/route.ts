import { NextRequest, NextResponse } from 'next/server';
import { AttendanceBydateApiService } from '../../../../../domains/platform/services/AttendanceBydateApiService';

export async function GET(req: NextRequest) {
  try {
    const result = await AttendanceBydateApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

