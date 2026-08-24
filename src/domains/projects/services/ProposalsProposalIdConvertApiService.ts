import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth";
import { proposalRepository } from "@/domains/platform/repositories/ProposalRepository";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";

export class ProposalsProposalIdConvertApiService {
    static async handlePOST(req: NextRequest, context: { params: Promise<{ proposalId: string }> }) {
    }
}