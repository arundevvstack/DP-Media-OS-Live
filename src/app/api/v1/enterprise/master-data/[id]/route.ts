import { NextResponse } from 'next/server';
import { masterDataService } from '@/core/services/master-data.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await masterDataService.getById((await params).id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const data = await masterDataService.update((await params).id, body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await masterDataService.delete((await params).id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
