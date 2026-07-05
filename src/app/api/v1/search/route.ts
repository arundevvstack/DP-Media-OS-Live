// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserDetails } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { companyId: company_id } = await getUserDetails();
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q || q.trim() === '') {
      return NextResponse.json({ results: [] });
    }

    const query = q.trim();

    // Run parallel searches across the enterprise
    const [
      projects,
      clients,
      users,
      storyboards,
      assets,
      reviews
    ] = await Promise.all([
      prisma.project.findMany({
        where: {
          company_id,
          OR: [
            { project_name: { contains: query, mode: 'insensitive' } },
            /* no desc */
          ]
        },
        take: 5
      }),
      prisma.client.findMany({
        where: {
          company_id,
          name: { contains: query, mode: 'insensitive' }
        },
        take: 5
      }),
      prisma.user.findMany({
        where: {
          company_id,
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      prisma.storyboard.findMany({ where: { name: { contains: query, mode: 'insensitive' } }, take: 5 }),
      prisma.aIAsset.findMany({ where: { name: { contains: query, mode: 'insensitive' } }, take: 5 }),
      prisma.reviewSession.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            /* no desc */
          ]
        },
        take: 5
      })
    ]);

    // Format into standard search result objects
    const results = [
      ...projects.map(p => ({ type: 'Project', id: p.id, title: p.project_name, subtitle: p.status, link: `/projects/${p.id}` })),
      ...clients.map(c => ({ type: 'Client', id: c.id, title: c.name, subtitle: c.industry || 'Client', link: `/crm/clients/${c.id}` })),
      ...users.map(u => ({ type: 'Employee', id: u.id, title: u.fullName, subtitle: u.department || u.email, link: `/hr-ops/hr/employees/${u.id}` })),
      ...storyboards.map(s => ({ type: 'Storyboard', id: s.id, title: s.name, subtitle: `Project ${s.production_id}`, link: `/media-ops/storyboard/dashboard?project_id=${s.production_id}` })),
      ...assets.map(a => ({ type: 'AI Asset', id: a.id, title: a.name, subtitle: `Status: ${a.status}`, link: `/media-ops/execution/assets?project_id=${a.production_id}` })),
      ...reviews.map(r => ({ type: 'Review Session', id: r.id, title: r.name, subtitle: r.status, link: `/media-ops/review/session/${r.id}` }))
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
