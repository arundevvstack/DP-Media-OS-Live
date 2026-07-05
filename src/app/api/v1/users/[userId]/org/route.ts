import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/v1/users/[userId]/org
// Updates department, functional_manager_id, hr_manager_id via raw SQL
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { department, functional_manager_id, hr_manager_id } = await req.json();

    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET department = $1, functional_manager_id = $2, hr_manager_id = $3 WHERE id = $4`,
      department || null,
      functional_manager_id || null,
      hr_manager_id || null,
      userId
    );

    // Return updated values
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT u.id, u.department, u.functional_manager_id, u.hr_manager_id,
        fm."fullName" as functional_manager_name, hm."fullName" as hr_manager_name
       FROM "User" u
       LEFT JOIN "User" fm ON fm.id = u.functional_manager_id
       LEFT JOIN "User" hm ON hm.id = u.hr_manager_id
       WHERE u.id = $1`,
      userId
    );

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
