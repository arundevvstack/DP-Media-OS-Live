import prisma from '@/lib/prisma';

export class ResourceEngine {
  static async analyzeResources(projectId: string) {
    const members = await prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: { User: true }
    });

    return {
      total_crew: members.length,
      roles_utilized: Array.from(new Set(members.map(m => m.role))),
      idle_resources: 0
    };
  }
}
