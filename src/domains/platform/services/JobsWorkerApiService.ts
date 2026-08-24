import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { FinancialEngine } from "@/lib/financial-engine";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";

export class JobsWorkerApiService {
    static async handlePOST(req: Request) {
    }
}
const prisma = new PrismaClient();
const transactionService = new TransactionService(prisma);