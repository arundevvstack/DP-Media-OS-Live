import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from '@/lib/auth';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { frameId: string } }) {
  try {
    const session = await getUserDetails();
    
    if (params.frameId === 'new') {
      return NextResponse.json({ data: { isNew: true } });
    }

    const frame = await prisma.storyboardFrame.findUnique({
      where: { id: params.frameId },
      include: {
        CameraSetup: true,
        LightingSetup: true,
        ArtDirection: true,
        Comments: {
          include: { User: { select: { id: true, fullName: true } } },
          orderBy: { created_at: 'desc' }
        },
        Storyboard: { select: { production_id: true } }
      }
    });

    if (!frame) return NextResponse.json({ error: "Frame not found" }, { status: 404 });

    return NextResponse.json({ data: frame });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { frameId: string } }) {
  try {
    const session = await getUserDetails();
    const body = await req.json();

    const { 
      CameraSetup, LightingSetup, ArtDirection, 
      scene_number, shot_number, frame_number, description, 
      image_url, ai_image_url, sketch_url,
      dialogue, narration, sound_notes, music_notes, fx_notes,
      production_notes, client_notes, director_notes, status
    } = body;

    const frame = await prisma.storyboardFrame.update({
      where: { id: params.frameId },
      data: {
        scene_number, shot_number, frame_number, description,
        image_url, ai_image_url, sketch_url,
        dialogue, narration, sound_notes, music_notes, fx_notes,
        production_notes, client_notes, director_notes, status,
        CameraSetup: CameraSetup ? {
          upsert: {
            create: CameraSetup,
            update: CameraSetup
          }
        } : undefined,
        LightingSetup: LightingSetup ? {
          upsert: {
            create: LightingSetup,
            update: LightingSetup
          }
        } : undefined,
        ArtDirection: ArtDirection ? {
          upsert: {
            create: ArtDirection,
            update: ArtDirection
          }
        } : undefined
      },
      include: {
        CameraSetup: true, LightingSetup: true, ArtDirection: true
      }
    });

    return NextResponse.json({ data: frame });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { frameId: string } }) {
  try {
    const session = await getUserDetails();
    const body = await req.json();
    const { storyboard_id, ...rest } = body;

    if (!storyboard_id) return NextResponse.json({ error: "storyboard_id required" }, { status: 400 });

    const frame = await prisma.storyboardFrame.create({
      data: {
        storyboard_id,
        frame_number: rest.frame_number || 1,
        ...rest
      },
      include: {
        CameraSetup: true, LightingSetup: true, ArtDirection: true
      }
    });

    return NextResponse.json({ data: frame });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
