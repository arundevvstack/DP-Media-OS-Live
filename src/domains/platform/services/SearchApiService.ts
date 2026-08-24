import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";
import { clientRepository } from "@/domains/crm/repositories/ClientRepository";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { storyboardRepository } from "@/domains/platform/repositories/StoryboardRepository";
import { aIAssetRepository } from "@/domains/platform/repositories/AIAssetRepository";
import { reviewSessionRepository } from "@/domains/platform/repositories/ReviewSessionRepository";

export class SearchApiService {
    static async handleGET(req: NextRequest) {
    }
}