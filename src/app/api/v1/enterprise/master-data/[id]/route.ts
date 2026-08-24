import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseMasterdataIdApiService } from '../../../../../../domains/platform/services/EnterpriseMasterdataIdApiService';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await EnterpriseMasterdataIdApiService.handleGET(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await EnterpriseMasterdataIdApiService.handlePATCH(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await EnterpriseMasterdataIdApiService.handleDELETE(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

