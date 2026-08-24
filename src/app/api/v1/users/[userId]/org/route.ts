import { NextRequest, NextResponse } from 'next/server';
import { UsersUserIdOrgApiService } from '../../../../../../domains/identity/services/UsersUserIdOrgApiService';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  try {
    const result = await UsersUserIdOrgApiService.handlePATCH(req, ctx);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

