import { NextRequest, NextResponse } from 'next/server';
import { UsersUserIdEmpcodeApiService } from '../../../../../../domains/identity/services/UsersUserIdEmpcodeApiService';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  try {
    const result = await UsersUserIdEmpcodeApiService.handlePATCH(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

