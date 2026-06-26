import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company context found" }, { status: 400 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { assignee_id } = body;

    const prospect = await prisma.prospect.findUnique({
      where: { id: id, company_id: profile.company_id },
      include: {
        requirements: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const requirement = prospect.requirements[0];

    // Check if pilot already exists
    if (prospect.pilot_project_id) {
      return NextResponse.json({ error: "Pilot project already exists" }, { status: 400 });
    }

    // Create Pilot Project
    const project = await prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        company_id: profile.company_id,
        project_name: `${prospect.company_name} - Pilot Video`,
        type: "Pilot",
        project_type: "Pilot Video",
        status: "active",
        client_name: prospect.company_name,
        progress: 0,
        budget: requirement?.project_details?.budget ? parseFloat(requirement.project_details.budget) : 0,
        pilot_project_id: id,
        updated_at: new Date(),
        requirements: requirement ? {
          connect: { id: requirement.id }
        } : undefined,
        ProjectMember: assignee_id ? {
          create: {
            id: crypto.randomUUID(),
            user_id: assignee_id,
            role: "lead",
            company_id: profile.company_id
          }
        } : undefined
      }
    });

    // Update prospect with pilot details and move stage
    const updatedProspect = await prisma.prospect.update({
      where: { id: id },
      data: {
        stage: "pilot_video",
        pilot_project_id: project.id,
        pilot_status: "in_progress"
      }
    });

    return NextResponse.json({ 
      success: true, 
      project: project,
      prospect: updatedProspect 
    });

  } catch (error: any) {
    console.error("Error creating pilot:", error);
    return NextResponse.json({ error: error.message || "Failed to create pilot project" }, { status: 500 });
  }
}
