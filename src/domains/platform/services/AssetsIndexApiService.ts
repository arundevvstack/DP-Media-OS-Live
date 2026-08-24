import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { assetRepository } from "@/domains/projects/repositories/AssetRepository";

export class AssetsIndexApiService {
    static async handlePOST(req: Request) {
    }
}
