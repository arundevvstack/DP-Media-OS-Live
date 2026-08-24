import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { distributedJobQueueRepository } from "@/domains/platform/repositories/DistributedJobQueueRepository";
import { distributedJobQueueRepository } from "@/domains/platform/repositories/DistributedJobQueueRepository";
import { webhookDeliveryLogRepository } from "@/domains/platform/repositories/WebhookDeliveryLogRepository";
import { infrastructureIncidentRepository } from "@/domains/platform/repositories/InfrastructureIncidentRepository";

export class SystemOpsHealthApiService {
    static async handleGET(req: Request) {
    }
}
const prisma = new PrismaClient();