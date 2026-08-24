import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";
import { invoiceRepository } from "@/domains/finance/repositories/InvoiceRepository";

export class ProjectsProjectIdInvoiceApiService {
    static async handlePOST(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
    }
}