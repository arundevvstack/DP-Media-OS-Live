import { NextRequest, NextResponse } from 'next/server';
import { UsersApiService } from '../../../../domains/identity/services/UsersApiService';

export async function GET(request: Request) {
  try {
    const result = await UsersApiService.handleGET(request);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

