import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { vectorStore } from "@/lib/vector-provider";

export class IntelligenceSearchApiService {
    static async handleGET(req: Request) {
    }
}