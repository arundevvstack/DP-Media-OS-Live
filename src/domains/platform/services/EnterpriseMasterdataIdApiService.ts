import { NextResponse } from "next/server";
import { masterDataService } from "@/core/services/master-data.service";

export class EnterpriseMasterdataIdApiService {
    static async handleGET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    }

    static async handlePATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    }

    static async handleDELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    }
}