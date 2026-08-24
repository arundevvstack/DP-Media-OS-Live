import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { conversionService } from "@/services/conversion.service";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import { DomainError, ErrorCode } from "@/lib/transaction";
import { userRepository } from "@/domains/identity/repositories/UserRepository";

export class CrmProspectIdConvertApiService {
    static async handlePOST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    }
}
async function convertHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const { id: prospectId } = await params;

    if (!prospectId) {
      return NextResponse.json({ error: 'Validation Error: prospect id is required.' }, { status: 400 });
    }

    const profile = await userRepository.findUnique({
      where: { id: user.id },
    });

    if (!profile || !profile.company_id) {
      return NextResponse.json({ error: 'Forbidden: Tenant company association missing.' }, { status: 403 });
    }

    // Role check: Admin, SuperAdmin, Manager, or Marketing/Sales can convert
    const isAuthorized =
      profile.role_id === 'SUPER_ADMIN' ||
      profile.role_id === 'ADMIN' ||
      profile.role_id === 'MANAGER' ||
      profile.role_id === 'MARKETING_SALES';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to convert prospects.' }, { status: 403 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const result = await conversionService.convertProspectToClient(
      prospectId,
      profile.company_id,
      profile.id,
      profile.fullName,
      correlationId
    );

    return NextResponse.json({
      message: 'Conversion completed successfully.',
      data: result
    }, { status: 200 });
  } catch (error: any) {
    logger.error('API Error in crm/prospect/[id]/convert:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      if (error.code === ErrorCode.FORBIDDEN) status = 403;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}