import prisma from '@/lib/prisma';

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
