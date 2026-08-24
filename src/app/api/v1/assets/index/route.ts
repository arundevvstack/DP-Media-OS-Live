import { NextRequest, NextResponse } from 'next/server';
import { AssetsIndexApiService } from '../../../../../domains/platform/services/AssetsIndexApiService';

export async function POST(req: Request) {
  try {
    const result = await AssetsIndexApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

