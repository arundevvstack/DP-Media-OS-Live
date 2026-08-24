import { NextRequest, NextResponse } from 'next/server';
import { AttendanceIdApiService } from '../../../../../domains/platform/services/AttendanceIdApiService';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const result = await AttendanceIdApiService.handlePATCH(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

