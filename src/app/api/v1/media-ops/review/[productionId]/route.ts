import { NextRequest, NextResponse } from 'next/server';
import { MediaopsReviewProductionIdApiService } from '../../../../../../domains/production/services/MediaopsReviewProductionIdApiService';

export async function GET(req: NextRequest, { params }: { params: { productionId: string } }) {
  try {
    const result = await MediaopsReviewProductionIdApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

