import { NextRequest, NextResponse } from 'next/server';
import { OrganizationTreeApiService } from '../../../../../domains/platform/services/OrganizationTreeApiService';

export async function GET(req: Request) {
  try {
    const result = await OrganizationTreeApiService.handleGET(req);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

