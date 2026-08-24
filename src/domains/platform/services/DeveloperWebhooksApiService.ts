import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { webhookEndpointRepository } from "@/domains/identity/repositories/WebhookEndpointRepository";

export class DeveloperWebhooksApiService {
    static async handlePOST(req: Request) {
    }
}
const prisma = new PrismaClient();