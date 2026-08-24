import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from "@/lib/auth";

export class MediaopsProductionsIdApiService {
    static async handleGET(req: NextRequest, { params }: { params: { id: string } }) {
    }

    static async handlePATCH(req: NextRequest, { params }: { params: { id: string } }) {
    }
}