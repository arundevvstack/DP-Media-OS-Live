import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { objectiveRepository } from "@/domains/projects/repositories/ObjectiveRepository";
import { freelancerBidRepository } from "@/domains/platform/repositories/FreelancerBidRepository";

export class MarketplaceBidsApiService {
    static async handlePOST(req: Request) {
    }
}
const prisma = new PrismaClient();