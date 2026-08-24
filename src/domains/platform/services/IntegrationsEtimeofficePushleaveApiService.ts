import { NextRequest, NextResponse } from "next/server";
import { isConfigured } from "@/lib/etimeoffice";
import { leaveRequestRepository } from "@/domains/platform/repositories/LeaveRequestRepository";

export class IntegrationsEtimeofficePushleaveApiService {
    static async handlePOST(req: NextRequest) {
    }
}