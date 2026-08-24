import { NextRequest, NextResponse } from 'next/server';
import { SystemOpsHealthApiService } from '../../../../../../domains/platform/services/SystemOpsHealthApiService';

export async function GET(req: Request) {
  try {
    const result = await SystemOpsHealthApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

