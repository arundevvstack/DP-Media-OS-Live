import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import { reviewSessionRepository } from "@/domains/platform/repositories/ReviewSessionRepository";
import { storyboardRepository } from "@/domains/platform/repositories/StoryboardRepository";
import { reviewFrameRepository } from "@/domains/platform/repositories/ReviewFrameRepository";

export class MediaopsReviewProductionIdApiService {
    static async handleGET(req: NextRequest, { params }: { params: { productionId: string } }) {
    }
}