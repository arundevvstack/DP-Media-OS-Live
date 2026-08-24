import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";
import { workflowStateRepository } from "@/domains/platform/repositories/WorkflowStateRepository";
import { budgetRepository } from "@/domains/finance/repositories/BudgetRepository";
import { objectiveRepository } from "@/domains/projects/repositories/ObjectiveRepository";
import { objectiveRepository } from "@/domains/projects/repositories/ObjectiveRepository";

export class IntelligenceReportingApiService {
    static async handleGET(req: Request) {
    }
}
const prisma = new PrismaClient();