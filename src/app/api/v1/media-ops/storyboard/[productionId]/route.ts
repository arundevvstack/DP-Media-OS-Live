import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from '@/lib/auth';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { productionId: string } }) {
  try {
    const session = await getUserDetails();
    
    // Fetch the primary storyboard for the production
    let storyboard = await prisma.storyboard.findFirst({
      where: {
        production_id: params.productionId,
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
      // Auto-create a default storyboard if none exists for this production
      const prod = await prisma.production.findUnique({
        where: { id: params.productionId, company_id: session.company_id }
      });

      if (!prod) {
        return NextResponse.json({ error: "Production not found" }, { status: 404 });
      }

      storyboard = await prisma.storyboard.create({
        data: {
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
    }

    return NextResponse.json({ data: storyboard });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
