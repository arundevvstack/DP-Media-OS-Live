import { NextResponse } from "next/server";
import { ENTERPRISE_TEMPLATES, DEFAULT_TIMELINE_DAYS, EnterpriseStageTemplate } from "@/lib/enterprise-workflow-templates";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";

export class ProjectsProjectIdChangepipelineApiService {
    static async handlePOST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    }
}

function distributeStageTimelines(
  startDate: Date,
  endDate: Date,
  stages: EnterpriseStageTemplate[]
): { start: Date; end: Date }[] {
  const totalMs = endDate.getTime() - startDate.getTime();
  const result: { start: Date; end: Date }[] = [];
  let cursor = startDate.getTime();

  for (const stage of stages) {
    const stageDuration = Math.round(totalMs * stage.weight);
    const stageStart = new Date(cursor);
    const stageEnd = new Date(cursor + stageDuration);
    result.push({ start: stageStart, end: stageEnd });
    cursor += stageDuration;
  }

  if (result.length > 0) {
    result[result.length - 1].end = new Date(endDate);
  }

  return result;
}
async function findBestAssignee(
  tx: any,
  companyId: string,
  department: string
): Promise<string | null> {
  try {
    const users = await tx.user.findMany({
      where: {
        company_id: companyId,
        department: {
          contains: department,
          mode: 'insensitive',
        },
        status: { not: 'inactive' },
      },
      select: { id: true, department: true },
    });

    if (!users || users.length === 0) return null;

    const loads = await Promise.all(
      users.map(async (u: { id: string; department: string }) => {
        const count = await tx.objective.count({
          where: {
            assignee_id: u.id,
            status: { in: ['Pending', 'In Progress'] },
          },
        });
        return { userId: u.id, load: count };
      })
    );

    loads.sort((a: { userId: string; load: number }, b: { userId: string; load: number }) => a.load - b.load);
    return loads[0]?.userId ?? null;
  } catch {
    return null;
  }
}