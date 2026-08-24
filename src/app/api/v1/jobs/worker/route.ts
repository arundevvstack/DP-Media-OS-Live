import { NextRequest, NextResponse } from 'next/server';
import { JobsWorkerApiService } from '../../../../../domains/platform/services/JobsWorkerApiService';

export async function POST(req: Request) {
  try {
    const result = await JobsWorkerApiService.handlePOST(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

