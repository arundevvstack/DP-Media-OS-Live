import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from '@/lib/auth';
import prisma from "@/lib/prisma";
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';
import crypto from 'crypto';
import { logger } from '@/lib/observability/logger';

const transactionService = new TransactionService(prisma);

export async function GET(req: NextRequest, { params }: { params: Promise<{ productionId: string }> }) {
  try {
    const session = await getUserDetails();
    const { productionId } = await params;
    
    // Fetch the primary storyboard for the production
    let storyboard = await prisma.storyboard.findFirst({
      where: {
        production_id: productionId,
        Production: {
          company_id: session.company_id
        }
      },
      include: {
        Frames: {
          include: {
            CameraSetup: true,
            LightingSetup: true,
            ArtDirection: true
          },
          orderBy: {
            frame_number: 'asc'
          }
        },
        Sections: {
          orderBy: {
            sequence_order: 'asc'
          }
        },
        Production: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!storyboard) {
      // Auto-create a default storyboard transactionally to avoid race conditions
      const correlationId = crypto.randomUUID();
      storyboard = await transactionService.runInTransaction(correlationId, async (tx) => {
          // Double-check to avoid duplicate creation under load
          const existing = await tx.storyboard.findFirst({
              where: { production_id: productionId }
          });

          if (existing) {
              return existing as any;
          }

          const prod = await tx.production.findUnique({
            where: { id: productionId, company_id: session.company_id }
          });
    
          if (!prod) {
            throw new DomainError("Production not found", ErrorCode.NOT_FOUND);
          }
    
          return await tx.storyboard.create({
            data: {
              id: crypto.randomUUID(),
              production_id: prod.id,
              name: "Main Storyboard",
              version: 1,
              status: "DRAFT"
            },
            include: {
              Frames: true,
              Sections: true,
              Production: true
            }
          });
      }, undefined, {
          userId: session.id,
          tenantId: session.company_id,
          domain: 'ai-studio',
          service: 'storyboard-auto-create',
          productionId
      });
    }

    return NextResponse.json({ data: storyboard });
  } catch (error: any) {
    logger.error('Storyboard GET Error:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
