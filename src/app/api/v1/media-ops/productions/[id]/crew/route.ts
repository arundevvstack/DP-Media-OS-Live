import { NextRequest, NextResponse } from 'next/server';
import { MediaopsProductionsIdCrewApiService } from '../../../../../../../domains/production/services/MediaopsProductionsIdCrewApiService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await MediaopsProductionsIdCrewApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await MediaopsProductionsIdCrewApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

