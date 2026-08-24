import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceMarketDashboardApiService } from '../../../../../../domains/ai/services/IntelligenceMarketDashboardApiService';

export async function GET() {
  try {
    const result = await IntelligenceMarketDashboardApiService.handleGET();
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

