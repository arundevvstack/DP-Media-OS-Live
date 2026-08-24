import { NextRequest, NextResponse } from 'next/server';
import { SearchApiService } from '../../../../domains/platform/services/SearchApiService';

export async function GET(req: NextRequest) {
  try {
    const result = await SearchApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

