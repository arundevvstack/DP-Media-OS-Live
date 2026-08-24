import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseMasterdataApiService } from '../../../../../domains/platform/services/EnterpriseMasterdataApiService';

export async function GET(req: Request) {
  try {
    const result = await EnterpriseMasterdataApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const result = await EnterpriseMasterdataApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

