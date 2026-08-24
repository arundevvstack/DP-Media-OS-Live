import { NextRequest, NextResponse } from 'next/server';
import { MediaopsStoryboardProductionIdApproveApiService } from '../../../../../../../domains/production/services/MediaopsStoryboardProductionIdApproveApiService';

export async function POST(req: NextRequest, ctx: { params: Promise<{ productionId: string }> }) {
  try {
    const result = await MediaopsStoryboardProductionIdApproveApiService.handlePOST(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

