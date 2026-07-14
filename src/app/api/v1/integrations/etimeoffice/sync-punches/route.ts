import { NextRequest, NextResponse } from 'next/server';
import { scrapeAttendance, isConfigured } from '@/lib/etimeoffice';
import prisma from '@/lib/prisma';

/**
 * POST /api/v1/integrations/etimeoffice/sync-punches
 *
 * Uses Playwright to log into eTimeOffice, scrape the Daily In/Out report,
 * and upsert attendance records into EmployeeAttendance.
 * Body: { from_date: "YYYY-MM-DD", to_date: "YYYY-MM-DD" }
 */
export async function GET(req: NextRequest) {
  // Allow cron to hit this route via GET without a body
  return handleSync(req, false);
}

export async function POST(req: NextRequest) {
  return handleSync(req, true);
}

async function handleSync(req: NextRequest, hasBody: boolean) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ error: 'eTimeOffice credentials not configured in .env' }, { status: 400 });
    }

    let body: any = {};
    if (hasBody) {
      body = await req.json().catch(() => ({}));
    }
    
    let records = [];
    let fromDate = new Date();
    let toDate = new Date();

    if (body.records && Array.isArray(body.records)) {
      // Manual CSV import provided from the frontend
      records = body.records;
    } else {
      fromDate = body.from_date ? new Date(body.from_date) : (() => {
        const d = new Date(); d.setDate(d.getDate() - 1); return d;
      })();
      toDate = body.to_date ? new Date(body.to_date) : new Date();

      // Scrape attendance via Playwright headless browser
      const result = await scrapeAttendance(fromDate, toDate);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
      records = result.records || [];
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No attendance records found for the given date range in eTimeOffice.',
        synced: 0, skipped: 0
      });
    }

    // Build emp_code → user map via raw SQL (Prisma types may not have emp_code yet)
    const userRows = await prisma.$queryRawUnsafe<{ id: string; emp_code: string | null; company_id: string | null }[]>(
      `SELECT id, emp_code, company_id FROM "User" WHERE emp_code IS NOT NULL`
    );
    const empCodeMap = new Map(userRows.map(u => [u.emp_code!, u]));

    let synced = 0;
    let skipped = 0;

    for (const rec of records) {
      if (!rec.emp_code) { skipped++; continue; }
      const user = empCodeMap.get(rec.emp_code);
      if (!user) { skipped++; continue; }

      // Parse date from DD/MM/YYYY or YYYY-MM-DD
      let punchDate: Date;
      if (rec.date.includes('/')) {
        const [dd, mm, yy] = rec.date.split('/');
        punchDate = new Date(`${yy}-${mm}-${dd}T00:00:00.000Z`);
      } else {
        punchDate = new Date(rec.date + 'T00:00:00.000Z');
      }
      if (isNaN(punchDate.getTime())) { skipped++; continue; }

      // Map eTimeOffice status codes → internal status
      const statusMap: Record<string, string> = {
        'P': 'PRESENT', 'A': 'ABSENT', 'L': 'ON_LEAVE',
        'WO': 'WEEKEND', 'H': 'HOLIDAY', 'HD': 'HALF_DAY',
      };
      const status = statusMap[rec.status?.toUpperCase()] || 'PRESENT';

      try {
        const existingRec = await prisma.employeeAttendance.findFirst({
          where: { user_id: user.id, date: punchDate },
        });
        if (existingRec) {
          await prisma.employeeAttendance.update({
            where: { id: existingRec.id },
            data: {
              status,
              ...(rec.in_time  && { check_in:  rec.in_time }),
              ...(rec.out_time && { check_out: rec.out_time }),
            },
          });
        } else {
          await prisma.employeeAttendance.create({
            data: {
              id: require('crypto').randomUUID(),
              user_id: user.id,
              company_id: user.company_id || '',
              date: punchDate,
              status,
              ...(rec.in_time  && { check_in:  rec.in_time }),
              ...(rec.out_time && { check_out: rec.out_time }),
            },
          });
        }
        synced++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      total_scraped: records.length,
      synced,
      skipped,
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


