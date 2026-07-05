import { NextRequest, NextResponse } from 'next/server';
import { isConfigured } from '@/lib/etimeoffice';
import prisma from '@/lib/prisma';

/**
 * POST /api/v1/integrations/etimeoffice/push-leave
 *
 * Pushes an approved leave request to eTimeOffice via Playwright automation.
 * Body: { leaveRequestId: string }
 *
 * Called automatically when a leave is approved in the Media OS Approvals page.
 *
 * NOTE: Full leave-push automation (navigating the eTimeOffice leave entry form
 * via headless browser) is a future enhancement. For now this logs the intent
 * and returns a success so the approval flow is not blocked.
 */
export async function POST(req: NextRequest) {
  try {
    const { leaveRequestId } = await req.json();
    if (!leaveRequestId) {
      return NextResponse.json({ error: 'leaveRequestId is required' }, { status: 400 });
    }

    if (!isConfigured()) {
      return NextResponse.json({
        success: false,
        warning: 'eTimeOffice credentials not configured — leave not pushed to eTimeOffice.'
      });
    }

    // Fetch the leave request for logging
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        User: { select: { fullName: true } },
        LeaveType: { select: { name: true } }
      }
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // TODO: Implement full Playwright-based leave entry automation
    // (Navigate to eTimeOffice leave module, fill the form, submit)
    console.log(`[eTimeOffice] Would push leave for ${leaveRequest.User?.fullName}: ` +
      `${leaveRequest.LeaveType?.name} from ${leaveRequest.start_date} to ${leaveRequest.end_date}`);

    return NextResponse.json({
      success: true,
      message: `Leave recorded for ${leaveRequest.User?.fullName}. ` +
        `Manual entry in eTimeOffice may be required until push automation is fully enabled.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
