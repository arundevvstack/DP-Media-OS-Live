// @ts-nocheck
import { NextResponse } from 'next/server';
import { masterDataService } from '@/core/services/master-data.service';
import { MasterDataCategory } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const company_id = searchParams.get('company_id');
    const category = searchParams.get('category') as MasterDataCategory;

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    if (category) {
      const data = await masterDataService.getByCategory(company_id, category);
      return NextResponse.json(data);
    } else {
      const data = await masterDataService.getAll(company_id);
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await masterDataService.create(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

