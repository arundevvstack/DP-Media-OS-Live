// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Calculate live widgets for the user's company
    const storyboards = await prisma.storyboard.findMany({
      where: {
        Production: {
          company_id: session.company_id
        }
      },
      include: {
        Frames: true,
        Approvals: true,
        Comments: true,
      }
    });

    let totalFrames = 0;
    let framesCompleted = 0;
    let framesPending = 0;
    let revisionRequests = 0;
    let clientFeedback = 0;
    let directorFeedback = 0;
    let approvedStoryboards = 0;

    for (const sb of storyboards) {
      totalFrames += sb.Frames.length;
      if (sb.status === "APPROVED") {
        approvedStoryboards++;
        framesCompleted += sb.Frames.length; // assuming all frames are done if SB is approved
      } else {
        framesPending += sb.Frames.length;
      }
      
      const rejectedApprovals = sb.Approvals.filter(a => a.status === "REJECTED").length;
      revisionRequests += rejectedApprovals;

      clientFeedback += sb.Comments.filter(c => c.content.includes("client")).length; // rough heuristic
      directorFeedback += sb.Comments.filter(c => c.content.includes("director")).length; // rough heuristic
    }

    const metrics = {
      activeStoryboards: storyboards.filter(s => s.status !== "APPROVED").length,
      approvedStoryboards,
      totalFrames,
      framesCompleted,
      framesPending,
      revisionRequests,
      clientFeedback,
      directorFeedback,
      productionReadiness: storyboards.length > 0 ? Math.round((approvedStoryboards / storyboards.length) * 100) : 0
    };

    return NextResponse.json({ data: metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
