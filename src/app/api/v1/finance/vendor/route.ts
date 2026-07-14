import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import { withIdempotency } from '@/lib/idempotency';
import { logger } from '@/lib/observability/logger';

const transactionService = new TransactionService(prisma);

async function createVendorHandler(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { company_id, name, service_type, payment_terms } = body;

    if (!company_id || !name || !service_type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const result = await transactionService.runInTransaction(
      correlationId,
      async (tx) => {
        // Verify user is part of the company and has rights
        const dbUser = await tx.user.findUnique({ where: { id: user.id }});
        const isManager = dbUser?.role_id === 'SUPER_ADMIN' || dbUser?.role_id === 'ADMIN' || dbUser?.role_id === 'PROJECT_MANAGER';

        if (!isManager || dbUser?.company_id !== company_id) {
            throw new DomainError("Forbidden", ErrorCode.FORBIDDEN);
        }

        const vendor = await tx.vendor.create({
          data: {
            company_id,
            name,
            service_type,
            payment_terms: payment_terms || 'Net 30'
          }
        });

        return vendor;
      },
      undefined,
      {
        userId: user.id,
        tenantId: company_id,
        domain: "finance",
        service: "vendor-creation"
      }
    );

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    logger.error("Vendor Creation Error", error);
    
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.FORBIDDEN) status = 403;
      if (error.code === ErrorCode.VALIDATION_ERROR) status = 400;
      
      return NextResponse.json({ error: error.message }, { status });
    }
    
    return NextResponse.json({ error: error.message || "Failed to create vendor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return withIdempotency(req, createVendorHandler);
}
