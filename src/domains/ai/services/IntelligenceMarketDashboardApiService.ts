import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { marketOpportunityRepository } from "@/domains/crm/repositories/MarketOpportunityRepository";
import { marketLeadRepository } from "@/domains/crm/repositories/MarketLeadRepository";
import { competitorRepository } from "@/domains/platform/repositories/CompetitorRepository";
import { industryTrendRepository } from "@/domains/platform/repositories/IndustryTrendRepository";
import { marketAlertRepository } from "@/domains/platform/repositories/MarketAlertRepository";
import { marketResearchNoteRepository } from "@/domains/platform/repositories/MarketResearchNoteRepository";

export class IntelligenceMarketDashboardApiService {
    static async handleGET() {
    }
}
const prisma = new PrismaClient();