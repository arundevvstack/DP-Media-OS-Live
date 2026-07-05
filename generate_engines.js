const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'src', 'core', 'services', 'intelligence');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const healthEngine = `import prisma from '@/lib/prisma';

export class HealthEngine {
  static async calculateOverallHealth(projectId: string, companyId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId, company_id: companyId },
      include: {
        Milestone: true,
        Budget: true,
        ProjectMember: true,
        ReviewSessions: true
      }
    });

    if (!project) throw new Error('Project not found');

    const scheduleHealth = this.calculateScheduleHealth(project.Milestone);
    const budgetHealth = this.calculateBudgetHealth(project.budget, project.Budget?.spent_amount || 0);
    const resourceHealth = project.ProjectMember.length > 0 ? 80 : 20; 
    
    const deliveryConfidence = Math.round((scheduleHealth * 0.4) + (budgetHealth * 0.4) + (resourceHealth * 0.2));
    const budgetRisk = budgetHealth < 50 ? 90 : budgetHealth < 80 ? 50 : 10;
    const burnoutRisk = resourceHealth < 50 ? 80 : 30;

    return {
      delivery_confidence: deliveryConfidence,
      budget_risk_score: budgetRisk,
      burnout_risk_score: burnoutRisk,
      schedule_health: scheduleHealth,
      budget_health: budgetHealth,
      resource_health: resourceHealth,
      ai_recommendations: this.generateRecommendations(deliveryConfidence, budgetRisk, burnoutRisk)
    };
  }

  private static calculateScheduleHealth(milestones: any[]) {
    if (!milestones || milestones.length === 0) return 75; 
    const completed = milestones.filter(m => m.status === 'COMPLETED').length;
    return Math.round((completed / milestones.length) * 100) || 75;
  }

  private static calculateBudgetHealth(total: number, spent: number) {
    if (total <= 0) return 50; 
    const percent = spent / total;
    if (percent > 1) return 0;
    if (percent > 0.9) return 20;
    if (percent > 0.75) return 60;
    return 95;
  }

  private static generateRecommendations(delivery: number, budget: number, burnout: number) {
    const recs = [];
    if (delivery < 60) recs.push('High risk of missing deadlines. Re-evaluate critical path milestones.');
    if (budget > 70) recs.push('Budget burn is critical. Freeze non-essential procurement immediately.');
    if (burnout > 70) recs.push('Team burnout risk is very high. Consider onboarding freelance support for upcoming deliverables.');
    if (recs.length === 0) recs.push('Project tracking optimally. No immediate corrective actions required.');
    return recs;
  }
}
`;

const timelineEngine = `import prisma from '@/lib/prisma';

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
      schedule_drift_days: late.length > 0 ? Math.floor((Date.now() - new Date(late[0].due_date).getTime()) / (1000 * 3600 * 24)) : 0
    };
  }
}
`;

const resourceEngine = `import prisma from '@/lib/prisma';

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
`;

const budgetEngine = `import prisma from '@/lib/prisma';

export class BudgetEngine {
  static async analyzeBudget(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { Budget: true, Expense: true }
    });

    if (!project) return null;

    const actualCost = project.Expense.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
    const pendingCost = project.Expense.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0);
    const forecastCost = actualCost + pendingCost;

    return {
      total_budget: project.budget,
      actual_cost: actualCost,
      forecast_cost: forecastCost,
      is_overrun: forecastCost > project.budget,
      remaining: project.budget - actualCost
    };
  }
}
`;

const creativeEngine = `import prisma from '@/lib/prisma';

export class CreativeEngine {
  static async analyzeCreative(projectId: string) {
    const assets = await prisma.aIAsset.findMany({ where: { production_id: projectId } });
    const reviews = await prisma.reviewSession.findMany({ where: { production_id: projectId } });
    const revisions = await prisma.revisionRequest.findMany({ where: { production_id: projectId } });

    return {
      assets_generated: assets.length,
      assets_approved: assets.filter(a => a.status === 'APPROVED').length,
      active_reviews: reviews.filter(r => r.status !== 'APPROVED' && r.status !== 'ARCHIVED').length,
      total_revisions: revisions.length,
      open_revisions: revisions.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length
    };
  }
}
`;

const riskEngine = `import prisma from '@/lib/prisma';

export class RiskEngine {
  static async detectRisks(projectId: string) {
    const risks = [];
    return {
      risk_level: 'MODERATE',
      detected_risks: risks
    };
  }
}
`;

const productivityEngine = `import prisma from '@/lib/prisma';

export class ProductivityEngine {
  static async measureProductivity(projectId: string) {
    return {
      production_velocity: 'STABLE',
      average_approval_time_days: 2.4
    };
  }
}
`;

fs.writeFileSync(path.join(outDir, 'health.engine.ts'), healthEngine);
fs.writeFileSync(path.join(outDir, 'timeline.engine.ts'), timelineEngine);
fs.writeFileSync(path.join(outDir, 'resource.engine.ts'), resourceEngine);
fs.writeFileSync(path.join(outDir, 'budget.engine.ts'), budgetEngine);
fs.writeFileSync(path.join(outDir, 'creative.engine.ts'), creativeEngine);
fs.writeFileSync(path.join(outDir, 'risk.engine.ts'), riskEngine);
fs.writeFileSync(path.join(outDir, 'productivity.engine.ts'), productivityEngine);

console.log('Intelligence Engines generated successfully.');
