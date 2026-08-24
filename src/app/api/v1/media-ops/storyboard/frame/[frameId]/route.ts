import { NextRequest, NextResponse } from 'next/server';
import { MediaopsStoryboardFrameFrameIdApiService } from '../../../../../../../domains/production/services/MediaopsStoryboardFrameFrameIdApiService';

export async function GET(req: NextRequest, { params }: { params: { frameId: string } }) {
  try {
    const result = await MediaopsStoryboardFrameFrameIdApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { frameId: string } }) {
  try {
    const result = await MediaopsStoryboardFrameFrameIdApiService.handlePUT(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { frameId: string } }) {
  try {
    const result = await MediaopsStoryboardFrameFrameIdApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

