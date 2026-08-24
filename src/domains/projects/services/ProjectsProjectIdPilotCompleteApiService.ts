import { NextRequest, NextResponse } from "next/server";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";
import { deliverableRepository } from "@/domains/projects/repositories/DeliverableRepository";
import { requirementChartRepository } from "@/domains/platform/repositories/RequirementChartRepository";
import { prospectRepository } from "@/domains/crm/repositories/ProspectRepository";

export class ProjectsProjectIdPilotCompleteApiService {
    static async handlePOST(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
    }
}