import { NextResponse } from "next/server";
import { ProductionIntelligenceEngine } from "@/lib/production/ProductionIntelligenceEngine";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";

export class ProjectsProjectIdIntelligenceApiService {
    static async handleGET(req: Request, { params }: { params: { projectId: string } }) {
    }
}
export const revalidate = 60;