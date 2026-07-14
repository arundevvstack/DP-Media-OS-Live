import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { clientService } from '@/services/client.service';
import { ProjectTemplate } from '@/lib/workflow/template-engine';
import { withIdempotency } from '@/lib/idempotency';
import { logger } from '@/lib/observability/logger';
import { DomainError, ErrorCode } from '@/lib/transaction';

async function createClientHandler(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!profile || !profile.company_id) {
      return NextResponse.json({ error: 'Forbidden: Tenant company association missing.' }, { status: 403 });
    }

    // Role-based permission guard
    const isAuthorized =
      profile.role_id === 'SUPER_ADMIN' ||
      profile.role_id === 'ADMIN' ||
      profile.role_id === 'MANAGER';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to onboard clients.' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.company_name) {
      return NextResponse.json({ error: 'Validation Error: company_name is required.' }, { status: 400 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const result = await clientService.onboard({
      company_id: profile.company_id,
      name: body.company_name,
      contact_person: body.contact_person,
      email: body.email,
      phone: body.phone,
      industry: body.industry,
      billing_address: body.billing_address,
      gstin: body.gstin,
      template: body.template as ProjectTemplate,
      userId: profile.id,
      userName: profile.fullName,
    }, correlationId);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    logger.error('API Error in crm/client/create:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return withIdempotency(req, createClientHandler);
}
