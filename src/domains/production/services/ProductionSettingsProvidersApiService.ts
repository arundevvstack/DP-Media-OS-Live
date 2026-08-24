import { NextResponse } from "next/server";
import { ProviderManager } from "@/lib/production/providers/ProviderManager";
import { productionAIProviderRepository } from "@/domains/platform/repositories/ProductionAIProviderRepository";

export class ProductionSettingsProvidersApiService {
    static async handleGET(req: Request) {
    }

    static async handlePOST(req: Request) {
    }
}