import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from "@/lib/auth";
import { productionRepository } from "@/domains/platform/repositories/ProductionRepository";
import { productionRepository } from "@/domains/platform/repositories/ProductionRepository";

export class MediaopsProductionsIdCrewApiService {
    static async handleGET(req: NextRequest, { params }: { params: { id: string } }) {
    }

    static async handlePOST(req: NextRequest, { params }: { params: { id: string } }) {
    }
}