import { NextRequest, NextResponse } from 'next/server';
import { MediaopsStoryboardDashboardApiService } from '../../../../../../domains/production/services/MediaopsStoryboardDashboardApiService';

export async function GET(req: NextRequest) {
  try {
    const result = await MediaopsStoryboardDashboardApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

