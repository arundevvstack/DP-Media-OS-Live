import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from "@/lib/auth";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";

export class MediaopsProductionsApiService {
    static async handleGET(req: NextRequest) {
    }

    static async handlePOST(req: NextRequest) {
    }
}
const transactionService = new TransactionService(prisma);
async function productionCreateHandler(req: NextRequest) {
  try {
    const session = await getUserDetails();
    const body = await req.json();
    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const production = await transactionService.runInTransaction(correlationId, async (tx) => {
      // Duplicate protection: a project shouldn't have duplicate identical productions named the same
      if (body.name && body.project_id) {
          const duplicate = await tx.production.findFirst({
              where: { 
                  project_id: body.project_id,
                  name: body.name
              }
          });
          if (duplicate) {
              throw new DomainError(`Production "${body.name}" already exists in this project`, ErrorCode.CONFLICT);
          }
      }

      const data = {
        ...body,
        id: crypto.randomUUID(),
        company_id: session.company_id,
        status: body.status || "PLANNING"
      };

      const created = await tx.production.create({
        data,
        include: { Project: true }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          company_id: session.company_id,
          user_id: session.id,
          entity_type: 'Production',
          entity_id: created.id,
          action: 'PRODUCTION_INITIALIZED',
          after_state: { status: data.status, project_id: data.project_id }
        }
      });

      return created;

    }, undefined, {
      userId: session.id,
      tenantId: session.company_id,
      domain: 'production',
      service: 'production-create'
    });
    
    return NextResponse.json({ data: production }, { status: 201 });
  } catch (error: any) {
    logger.error('Production Creation API Error:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}