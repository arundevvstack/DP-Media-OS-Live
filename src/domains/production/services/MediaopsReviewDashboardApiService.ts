import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import { reviewSessionRepository } from "@/domains/platform/repositories/ReviewSessionRepository";
import { revisionRequestRepository } from "@/domains/platform/repositories/RevisionRequestRepository";

export class MediaopsReviewDashboardApiService {
    static async handleGET(req: NextRequest) {
    }
}