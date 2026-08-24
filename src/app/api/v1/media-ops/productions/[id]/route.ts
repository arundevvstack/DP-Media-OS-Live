import { NextRequest, NextResponse } from 'next/server';
import { MediaopsProductionsIdApiService } from '../../../../../../domains/production/services/MediaopsProductionsIdApiService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await MediaopsProductionsIdApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await MediaopsProductionsIdApiService.handlePATCH(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

