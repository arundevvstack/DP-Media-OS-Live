import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { marketResearchNoteRepository } from "@/domains/platform/repositories/MarketResearchNoteRepository";

export class IntelligenceMarketNotesApiService {
    static async handlePOST(request: Request) {
    }
}
