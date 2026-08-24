import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { operationalTelemetryRepository } from "@/domains/platform/repositories/OperationalTelemetryRepository";

export class TelemetryApiService {
    static async handlePOST(req: Request) {
    }
}
const prisma = new PrismaClient();