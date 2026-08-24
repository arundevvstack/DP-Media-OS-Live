import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EventBus } from "@/lib/event-bus";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";

export class MediaopsStoryboardProductionIdApproveApiService {
    static async handlePOST(req: NextRequest, ctx: { params: Promise<{ productionId: string }> }) {
    }
}
const transactionService = new TransactionService(prisma);
async function storyboardApproveHandler(req: NextRequest, { params }: { params: Promise<{ productionId: string }> }) {
  try {
    const session = await getUserDetails();
    const { productionId } = await params;
    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const storyboardId = await transactionService.runInTransaction(correlationId, async (tx) => {
      const storyboard = await tx.storyboard.findFirst({
        where: {
          production_id: productionId,
          Production: {
            company_id: session.company_id
          }
        },
        include: {
          Frames: {
            include: { CameraSetup: true, LightingSetup: true, ArtDirection: true }
          }
        }
      });
  
      if (!storyboard) {
          throw new DomainError("Storyboard not found", ErrorCode.NOT_FOUND);
      }
      
      if (storyboard.status === "APPROVED") {
          throw new DomainError("Storyboard is already approved", ErrorCode.CONFLICT);
      }
  
      // Mark as approved
      await tx.storyboard.update({
        where: { id: storyboard.id },
        data: { status: "APPROVED" }
      });
  
      // Automate generation of Shot List, Prompts, and Checklist
      
      // 1. Generate Shot List
      for (const frame of storyboard.Frames) {
        // Find or create scene
        let scene = await tx.scene.findFirst({
          where: { production_id: productionId, scene_number: frame.scene_number?.toString() }
        });
        
        if (!scene) {
          scene = await tx.scene.create({
            data: {
              id: crypto.randomUUID(),
              production_id: productionId,
              scene_number: frame.scene_number?.toString() || "1",
              description: "Auto-generated from Storyboard"
            }
          });
        }
  
        // Create Shot
        await tx.shotList.create({
          data: {
            id: crypto.randomUUID(),
            scene_id: scene.id,
            shot_number: frame.shot_number?.toString() || "1",
            description: frame.description || "Auto-generated from Storyboard",
            angle: frame.CameraSetup?.angle,
            movement: frame.CameraSetup?.movement,
            lens: frame.CameraSetup?.lens
          }
        });
      }
  
      // 2. Generate Prompt Library
      const promptLibrary = await tx.promptLibrary.create({
        data: {
          id: crypto.randomUUID(),
          company_id: session.company_id,
          name: `Asset Prompts - ${productionId}`,
          description: "Auto-generated AI prompts from Storyboard",
        }
      });
  
      // Create Templates based on frames
      for (const frame of storyboard.Frames) {
        if (frame.description) {
          await tx.promptTemplate.create({
            data: {
              id: crypto.randomUUID(),
              library_id: promptLibrary.id,
              name: `Scene ${frame.scene_number} Shot ${frame.shot_number}`,
              prompt_text: `Generate a cinematic frame. Subject: ${frame.description}. Camera: ${frame.CameraSetup?.angle || 'Eye Level'} angle, ${frame.CameraSetup?.lens || '35mm'}. Lighting: ${frame.LightingSetup?.key_light || 'Natural'}, Mood: ${frame.LightingSetup?.mood || 'Neutral'}. Environment: ${frame.ArtDirection?.set_design || 'Standard'}.`,
              is_active: true
            }
          });
        }
      }

      await tx.auditLog.create({
          data: {
              id: crypto.randomUUID(),
              company_id: session.company_id,
              user_id: session.id,
              entity_type: 'Storyboard',
              entity_id: storyboard.id,
              action: 'STORYBOARD_APPROVED'
          }
      });

      return storyboard.id;

    }, undefined, {
        userId: session.id,
        tenantId: session.company_id,
        domain: 'ai-studio',
        service: 'storyboard-approve',
        productionId
    });

    // 3. Fire Event for notifications / audit (outside tx to prevent delays)
    await EventBus.publish("STORYBOARD_APPROVED", {
      company_id: session.company_id,
      user_id: session.id,
      storyboard_id: storyboardId,
      production_id: productionId
    });

    return NextResponse.json({ 
      data: { success: true, message: "Storyboard approved and execution artifacts generated." } 
    });
  } catch (error: any) {
    logger.error('Storyboard Approve Error:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}