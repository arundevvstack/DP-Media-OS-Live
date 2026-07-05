import prisma from '@/lib/prisma';

export class TimelineEngine {
  static async analyzeTimeline(projectId: string) {
    const milestones = await prisma.milestone.findMany({
      where: { project_id: projectId },
      orderBy: { due_date: 'asc' }
    });

    const pending = milestones.filter(m => m.status !== 'COMPLETED');
    const late = pending.filter(m => m.due_date && new Date(m.due_date).getTime() < Date.now());
    
    return {
      total_milestones: milestones.length,
      upcoming: pending.length > 0 ? pending[0] : null,
      late_deliverables: late.length,
      schedule_drift_days: late.length > 0 ? Math.floor((Date.now() - new Date(late[0].due_date as Date).getTime()) / (1000 * 3600 * 24)) : 0
    };
  }
}
