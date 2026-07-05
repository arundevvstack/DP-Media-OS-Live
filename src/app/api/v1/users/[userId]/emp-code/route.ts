import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/v1/users/[userId]/emp-code
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { emp_code } = await req.json();
    const code = emp_code?.trim() || null;

    // Use raw SQL to bypass the stale Prisma client (emp_code was added to schema but client DLL was locked during generate)
    await prisma.$executeRaw`UPDATE "User" SET emp_code = ${code} WHERE id = ${userId}`;

    // Fetch back the updated user for confirmation
    const users = await prisma.$queryRaw<{ id: string; fullName: string; emp_code: string | null }[]>`
      SELECT id, "fullName", emp_code FROM "User" WHERE id = ${userId} LIMIT 1
    `;
    const user = users[0];

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
