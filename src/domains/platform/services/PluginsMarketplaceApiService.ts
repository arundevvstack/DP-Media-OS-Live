import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { marketplacePluginRepository } from "@/domains/platform/repositories/MarketplacePluginRepository";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { companyPluginInstallationRepository } from "@/domains/platform/repositories/CompanyPluginInstallationRepository";

export class PluginsMarketplaceApiService {
    static async handleGET(req: Request) {
    }

    static async handlePOST(req: Request) {
    }
}
