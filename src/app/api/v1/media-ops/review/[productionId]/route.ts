import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from '@/lib/auth';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { productionId: string } }) {
  try {
    const session = await getUserDetails();

    // Find active review session or create DRAFT
    let reviewSession = await prisma.reviewSession.findFirst({
      where: {
        production_id: params.productionId,
        status: { notIn: ["ARCHIVED"] }
      },
      include: {
        Production: true,
        Participants: true,
        Frames: {
          include: {
            Frame: true,
            Comments: true,
            Annotations: true
          }
        },
        Assets: {
          include: {
            Asset: true,
            Comments: true,
            Annotations: true
          }
        },
        Decisions: {
          include: { User: true }
        }
      }
    });

    if (!reviewSession) {
      reviewSession = await prisma.reviewSession.create({
        data: {
          production_id: params.productionId,
          name: `Review Session - ${new Date().toLocaleDateString()}`,
          created_by_id: session.user_id,
          status: "DRAFT"
        },
        include: {
          Production: true,
          Participants: true,
          Frames: {
            include: { Frame: true, Comments: true, Annotations: true }
          },
          Assets: {
            include: { Asset: true, Comments: true, Annotations: true }
          },
          Decisions: {
            include: { User: true }
          }
        }
      });

      // Automatically import approved storyboard frames for review
      const storyboard = await prisma.storyboard.findFirst({
        where: { production_id: params.productionId, status: "APPROVED" },
        include: { Frames: true }
      });

      if (storyboard) {
        for (const frame of storyboard.Frames) {
          await prisma.reviewFrame.create({
            data: {
              session_id: reviewSession.id,
              frame_id: frame.id,
            }
          });
        }
      }
      
      // refetch to get the frames
      reviewSession = await prisma.reviewSession.findUnique({
        where: { id: reviewSession.id },
        include: {
          Production: true,
          Participants: true,
          Frames: {
            include: { Frame: true, Comments: true, Annotations: true }
          },
          Assets: {
            include: { Asset: true, Comments: true, Annotations: true }
          },
          Decisions: {
            include: { User: true }
          }
        }
      });
    }

    return NextResponse.json({ data: reviewSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
