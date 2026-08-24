import { NextRequest, NextResponse } from 'next/server';
import { MediaopsReviewDashboardApiService } from '../../../../../../domains/production/services/MediaopsReviewDashboardApiService';

export async function GET(req: NextRequest) {
  try {
    const result = await MediaopsReviewDashboardApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

