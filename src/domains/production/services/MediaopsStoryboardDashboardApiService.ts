import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from "@/lib/auth";
import { storyboardRepository } from "@/domains/platform/repositories/StoryboardRepository";

export class MediaopsStoryboardDashboardApiService {
    static async handleGET(req: NextRequest) {
    }
}