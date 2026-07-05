import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EventBus } from "@/lib/event-bus";

export async function POST(req: NextRequest, { params }: { params: { productionId: string } }) {
  try {
    const session = await requireAuth();
    
    const storyboard = await prisma.storyboard.findFirst({
      where: {
        production_id: params.productionId,
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

    if (!storyboard) return NextResponse.json({ error: "Storyboard not found" }, { status: 404 });

    // Mark as approved
    await prisma.storyboard.update({
      where: { id: storyboard.id },
      data: { status: "APPROVED" }
    });

    // Automate generation of Shot List, Prompts, and Checklist
    
    // 1. Generate Shot List
    for (const frame of storyboard.Frames) {
      // Find or create scene
      let scene = await prisma.scene.findFirst({
        where: { production_id: params.productionId, scene_number: frame.scene_number?.toString() }
      });
      if (!scene) {
        scene = await prisma.scene.create({
          data: {
            production_id: params.productionId,
            scene_number: frame.scene_number?.toString() || "1",
            description: "Auto-generated from Storyboard"
          }
        });
      }

      // Create Shot
      await prisma.shotList.create({
        data: {
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
    const promptLibrary = await prisma.promptLibrary.create({
      data: {
        company_id: session.company_id,
        name: `Asset Prompts - ${params.productionId}`,
        description: "Auto-generated AI prompts from Storyboard",
      }
    });

    // Create Templates based on frames
    for (const frame of storyboard.Frames) {
      if (frame.description) {
        await prisma.promptTemplate.create({
          data: {
            library_id: promptLibrary.id,
            name: `Scene ${frame.scene_number} Shot ${frame.shot_number}`,
            prompt_text: `Generate a cinematic frame. Subject: ${frame.description}. Camera: ${frame.CameraSetup?.angle || 'Eye Level'} angle, ${frame.CameraSetup?.lens || '35mm'}. Lighting: ${frame.LightingSetup?.key_light || 'Natural'}, Mood: ${frame.LightingSetup?.mood || 'Neutral'}. Environment: ${frame.ArtDirection?.set_design || 'Standard'}.`,
            is_active: true
          }
        });
      }
    }

    // 3. Fire Event for notifications / audit
    await EventBus.publish("STORYBOARD_APPROVED", {
      company_id: session.company_id,
      user_id: session.user_id,
      storyboard_id: storyboard.id,
      production_id: params.productionId
    });

    return NextResponse.json({ 
      data: { success: true, message: "Storyboard approved and execution artifacts generated." } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
