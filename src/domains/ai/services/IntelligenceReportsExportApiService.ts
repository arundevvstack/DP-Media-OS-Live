import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";

export class IntelligenceReportsExportApiService {
    static async handleGET(req: NextRequest) {
    }
}