import { NextResponse } from "next/server";
import { ProviderManager } from "@/lib/production/providers/ProviderManager";
import { productionAIProviderRepository } from "@/domains/platform/repositories/ProductionAIProviderRepository";
import { productionProviderCredentialRepository } from "@/domains/platform/repositories/ProductionProviderCredentialRepository";

export class ProductionSettingsProvidersIdTestApiService {
    static async handlePOST(req: Request, { params }: { params: { id: string } }) {
    }
}