import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth";
import { proposalRepository } from "@/domains/platform/repositories/ProposalRepository";

export class ProposalsApiService {
    static async handlePOST(req: NextRequest) {
    }

    static async handleGET(req: NextRequest) {
    }
}