import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseConfigEntityApiService } from '../../../../../../domains/platform/services/EnterpriseConfigEntityApiService';

export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const result = await EnterpriseConfigEntityApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const result = await EnterpriseConfigEntityApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

