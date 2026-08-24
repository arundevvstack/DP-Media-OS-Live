import { NextResponse } from "next/server";
import { productionAssetRepository } from "@/domains/platform/repositories/ProductionAssetRepository";

export class ProjectsProjectIdAssetsAssetIdReviewApiService {
    static async handlePOST(req: Request, { params }: { params: { projectId: string, assetId: string } }) {
    }
}