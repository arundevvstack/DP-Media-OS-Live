import { NextRequest, NextResponse } from 'next/server';
import { MediaopsProductionsIdCallsheetsApiService } from '../../../../../../../domains/production/services/MediaopsProductionsIdCallsheetsApiService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await MediaopsProductionsIdCallsheetsApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await MediaopsProductionsIdCallsheetsApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

