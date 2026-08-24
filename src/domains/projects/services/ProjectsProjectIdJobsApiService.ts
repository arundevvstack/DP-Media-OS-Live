import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { productionAIJobRepository } from "@/domains/production/repositories/ProductionAIJobRepository";

export class ProjectsProjectIdJobsApiService {
    static async handleGET(req: Request, { params }: { params: { projectId: string } }) {
    }
}