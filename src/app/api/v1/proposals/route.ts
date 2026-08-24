import { NextRequest, NextResponse } from 'next/server';
import { ProposalsApiService } from '../../../../domains/projects/services/ProposalsApiService';

export async function POST(req: NextRequest) {
  try {
    const result = await ProposalsApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await ProposalsApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

