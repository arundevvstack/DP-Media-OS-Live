import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Map structural entities to OrganizationUnitType
const orgUnitMap: Record<string, string> = {
  'businessUnit': 'BUSINESS_UNIT',
  'region': 'REGION',
  'country': 'COUNTRY',
  'state': 'STATE',
  'city': 'CITY',
  'branch': 'BRANCH',
  'division': 'DIVISION',
  'department': 'DEPARTMENT',
  'team': 'TEAM',
  'projectOffice': 'PROJECT_OFFICE',
  'office': 'OFFICE'
};

export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    const modelName = (await params).entity;

    // Handle OrganizationUnit types
    if (orgUnitMap[modelName]) {
      const type = orgUnitMap[modelName] as any; // Cast for Prisma Enum
      const data = await prisma.organizationUnit.findMany({
        where: {
          company_id,
          type,
          is_active: true,
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(data);
    }

    // Check if the dedicated model exists on prisma client
    if (!(prisma as any)[modelName]) {
       return NextResponse.json({ error: `Entity ${modelName} not found` }, { status: 404 });
    }

    const data = await (prisma as any)[modelName].findMany({
      where: {
        company_id,
        is_active: true,
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const body = await req.json();
    const modelName = (await params).entity;

    // Handle OrganizationUnit types
    if (orgUnitMap[modelName]) {
      const type = orgUnitMap[modelName] as any;
      const data = await prisma.organizationUnit.create({
        data: {
          ...body,
          type,
          metadata: body.metadata || {},
        },
      });
      return NextResponse.json(data, { status: 201 });
    }

    if (!(prisma as any)[modelName]) {
      return NextResponse.json({ error: `Entity ${modelName} not found` }, { status: 404 });
    }

    const data = await (prisma as any)[modelName].create({
      data: {
        ...body,
        metadata: body.metadata || {},
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
