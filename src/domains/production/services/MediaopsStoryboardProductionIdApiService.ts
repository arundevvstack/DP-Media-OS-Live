import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";
import { storyboardRepository } from "@/domains/platform/repositories/StoryboardRepository";

export class MediaopsStoryboardProductionIdApiService {
    static async handleGET(req: NextRequest, { params }: { params: Promise<{ productionId: string }> }) {
    }
}
const transactionService = new TransactionService(prisma);