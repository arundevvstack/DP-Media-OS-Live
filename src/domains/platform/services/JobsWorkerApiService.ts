import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { FinancialEngine } from "@/lib/financial-engine";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import crypto from "crypto";
import { logger } from "@/lib/observability/logger";

export class JobsWorkerApiService {
    static async handlePOST(req: Request) {
    }
}

const transactionService = new TransactionService(prisma);