import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ENTERPRISE_TEMPLATES, DEFAULT_TIMELINE_DAYS, EnterpriseStageTemplate } from "@/lib/enterprise-workflow-templates";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";
import crypto from "crypto";
import { prospectRepository } from "@/domains/crm/repositories/ProspectRepository";

export class ProjectsCreateApiService {
    static async handlePOST(req: NextRequest) {
    }
}
const transactionService = new TransactionService(prisma);
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
async function projectCreateHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_id,
      user_id,
      assignee_id,
      project_name,
      client_name,
      client_id,
      budget,
      deadline,
      project_type,
      project_category,
      color,
      lead_id,
    } = body;

    if (!company_id || !project_name || !project_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const template = ENTERPRISE_TEMPLATES[project_type] ?? ENTERPRISE_TEMPLATES['Normal Production'];

    const projectStart = new Date();
    const defaultDays = DEFAULT_TIMELINE_DAYS[project_type] ?? 30;
    const projectEnd = deadline
      ? new Date(deadline)
      : new Date(projectStart.getTime() + defaultDays * 24 * 60 * 60 * 1000);

    const stageTimelines = distributeStageTimelines(projectStart, projectEnd, template.stages);

    const uniqueDepartments = [...new Set(
      template.stages.flatMap(s => s.objectives.map(o => o.department))
    )];

    const departmentAssigneeMap: Record<string, string | null> = {};
    await Promise.all(
      uniqueDepartments.map(async (dept) => {
        departmentAssigneeMap[dept] = await findBestAssignee(prisma, company_id, dept);
      })
    );

    let pilotProjectId = null;
    let requirementId = null;

    if (lead_id) {
      const prospect = await prospectRepository.findFirst({
        where: { id: lead_id },
        include: {
          requirements: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      if (prospect) {
        const pilotDetails = prospect.pilot_details as any;
        if (pilotDetails && pilotDetails.project_id) {
          pilotProjectId = pilotDetails.project_id;
        }
        if (prospect.requirements && prospect.requirements.length > 0) {
          requirementId = prospect.requirements[0].id;
        }
      }
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const result = await transactionService.runInTransaction(correlationId, async (tx) => {
        
        // Conflict detection: duplicate project name within the tenant
        const duplicate = await tx.project.findFirst({
            where: { company_id, project_name }
        });

        if (duplicate) {
            throw new DomainError(`Project with name "${project_name}" already exists`, ErrorCode.CONFLICT);
        }

        // 1. Create the project
        const newProject = await tx.project.create({
          data: {
            id: crypto.randomUUID(),
            company_id,
            client_id: client_id ?? null,
            client_name: client_name ?? null,
            project_name,
            project_type,
            project_category: project_category ?? null,
            budget: budget ? parseFloat(budget) : 0,
            deadline: projectEnd,
            color: color ?? 'bg-accent',
            status: 'active',
            progress: 0,
            pilot_project_id: pilotProjectId,
            updated_at: new Date(),
            requirements: requirementId ? { connect: { id: requirementId } } : undefined,
          },
        });

        // 2. Add creator as Project Manager
        const projectManagerId = assignee_id || user_id;
        if (projectManagerId) {
          await tx.projectMember.create({
            data: {
              id: crypto.randomUUID(),
              project_id: newProject.id,
              user_id: projectManagerId,
              role: 'Project Manager',
              company_id // Enforced missing company_id logic or implicit
            },
          });
        }

        // 3. Create stages + objectives
        const objectiveTitleToId: Record<string, string> = {};
        const pendingDependencies: { childId: string; dependsOnTitles: string[] }[] = [];

        for (let si = 0; si < template.stages.length; si++) {
          const stageDef = template.stages[si];
          const { start: stageStart, end: stageEnd } = stageTimelines[si];

          const createdStage = await tx.projectStage.create({
            data: {
              id: crypto.randomUUID(),
              project_id: newProject.id,
              name: stageDef.name,
              order: stageDef.order,
              status: si === 0 ? 'active' : 'pending',
              start_date: stageStart,
              end_date: stageEnd,
            },
          });

          const stageMs = stageEnd.getTime() - stageStart.getTime();

          for (const objDef of stageDef.objectives) {
            const dueDateMs = stageStart.getTime() + Math.round(objDef.offset_ratio * stageMs);
            const clampedDue = new Date(Math.min(dueDateMs, stageEnd.getTime()));

            const assigneeId = departmentAssigneeMap[objDef.department] ?? null;

            const createdObj = await tx.objective.create({
              data: {
                id: crypto.randomUUID(),
                project_id: newProject.id,
                stage_id: createdStage.id,
                title: objDef.title,
                description: objDef.description,
                department: objDef.department,
                priority: objDef.priority,
                estimated_hours: objDef.estimated_hours,
                checklist: objDef.checklist,
                status: 'Pending',
                due_date: clampedDue,
                assignee_id: assigneeId,
                updated_at: new Date(),
              },
            });

            objectiveTitleToId[objDef.title] = createdObj.id;

            if (objDef.depends_on && objDef.depends_on.length > 0) {
              pendingDependencies.push({
                childId: createdObj.id,
                dependsOnTitles: objDef.depends_on,
              });
            }
          }
        }

        // 4. Wire dependency chains
        for (const dep of pendingDependencies) {
          for (const parentTitle of dep.dependsOnTitles) {
            const parentId = objectiveTitleToId[parentTitle];
            if (parentId && parentId !== dep.childId) {
                // Check duplicate dependency manually to avoid try-catch inside transaction causing rollbacks
                const existingDep = await tx.objectiveDependency.findFirst({
                    where: { parent_id: parentId, child_id: dep.childId }
                });
                
                if (!existingDep) {
                  await tx.objectiveDependency.create({
                    data: {
                        id: crypto.randomUUID(),
                        parent_id: parentId,
                        child_id: dep.childId,
                        type: 'blocking',
                    },
                  });
                }
            }
          }
        }

        // 5. Create audit log
        if (user_id) {
          await tx.auditLog.create({
            data: {
              id: crypto.randomUUID(),
              company_id,
              user_id,
              action: 'PROJECT_CREATED',
              entity_type: 'Project',
              entity_id: newProject.id,
              after_state: {
                project_type,
                stages_count: template.stages.length,
                objectives_count: Object.keys(objectiveTitleToId).length,
                dependencies_count: pendingDependencies.reduce((acc, d) => acc + d.dependsOnTitles.length, 0),
                timeline_start: projectStart.toISOString(),
                timeline_end: projectEnd.toISOString(),
              },
            },
          });
        }

        return {
          project: newProject,
          workspace_summary: {
            stages: template.stages.length,
            objectives: Object.keys(objectiveTitleToId).length,
            dependencies: pendingDependencies.reduce((acc, d) => acc + d.dependsOnTitles.length, 0),
            timeline_days: Math.round((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)),
          },
        };
      },
      {
        timeout: 60000, 
      }, 
      {
        userId: user_id || 'system',
        tenantId: company_id,
        domain: 'project',
        service: 'project-create'
      }
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Project Creation API Error:', error);
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}