import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { marketLeadRepository } from "@/domains/crm/repositories/MarketLeadRepository";
import { prospectRepository } from "@/domains/crm/repositories/ProspectRepository";
import { marketAlertRepository } from "@/domains/platform/repositories/MarketAlertRepository";

export class IntelligenceMarketCrmsyncApiService {
    static async handlePOST(request: Request) {
    }
}
