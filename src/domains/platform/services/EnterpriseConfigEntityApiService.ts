import { NextResponse } from "next/server";
import { organizationUnitRepository } from "@/domains/platform/repositories/OrganizationUnitRepository";
import { organizationUnitRepository } from "@/domains/platform/repositories/OrganizationUnitRepository";

export class EnterpriseConfigEntityApiService {
    static async handleGET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
    }

    static async handlePOST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
    }
}
const orgUnitMap: Record<string, string> = {
  'businessUnit': 'BUSINESS_UNIT',
  'region': 'REGION',
  'country': 'COUNTRY',
  'state': 'STATE',
  'city': 'CITY',
  'branch': 'BRANCH',
  'division': 'DIVISION',
  'department': 'DEPARTMENT',
  'team': 'TEAM',
  'projectOffice': 'PROJECT_OFFICE',
  'office': 'OFFICE'
};