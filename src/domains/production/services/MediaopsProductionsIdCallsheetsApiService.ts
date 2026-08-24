import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from "@/lib/auth";
import { productionRepository } from "@/domains/platform/repositories/ProductionRepository";
import { shootDayRepository } from "@/domains/platform/repositories/ShootDayRepository";

export class MediaopsProductionsIdCallsheetsApiService {
    static async handleGET(req: NextRequest, { params }: { params: { id: string } }) {
    }

    static async handlePOST(req: NextRequest, { params }: { params: { id: string } }) {
    }
}