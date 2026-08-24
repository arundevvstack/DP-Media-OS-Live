import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { NextRequest } from "next/server";
import { ContextBuilder } from "@/lib/production/assistant/ContextBuilder";
import { OpenRouterAdapter } from "@/lib/production/providers/adapters/OpenRouterAdapter";
import { productionProviderCredentialRepository } from "@/domains/platform/repositories/ProductionProviderCredentialRepository";
import { productionAssistantThreadRepository } from "@/domains/platform/repositories/ProductionAssistantThreadRepository";
import { productionAssistantMessageRepository } from "@/domains/platform/repositories/ProductionAssistantMessageRepository";

export class ProjectsProjectIdAssistantChatApiService {
    static async handlePOST(req: NextRequest, { params }: { params: { projectId: string } }) {
    }
}