// @ts-nocheck
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    const allUnits = await prisma.organizationUnit.findMany({
      where: {
        company_id,
        is_active: true,
      },
      orderBy: [
        { level: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Build tree
    const map = new Map<string, any>();
    const tree: any[] = [];

    allUnits.forEach(unit => {
      map.set(unit.id, { ...unit, children: [] });
    });

    allUnits.forEach(unit => {
      if (unit.parent_id && map.has(unit.parent_id)) {
        map.get(unit.parent_id).children.push(map.get(unit.id));
      } else {
        tree.push(map.get(unit.id));
      }
    });

    return NextResponse.json(tree);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
