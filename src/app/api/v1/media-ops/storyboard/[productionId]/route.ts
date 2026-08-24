import { NextRequest, NextResponse } from 'next/server';
import { MediaopsStoryboardProductionIdApiService } from '../../../../../../domains/production/services/MediaopsStoryboardProductionIdApiService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ productionId: string }> }) {
  try {
    const result = await MediaopsStoryboardProductionIdApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

