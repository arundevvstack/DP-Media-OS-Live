import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Budget } from '@prisma/client';

export class BudgetRepository implements IRepository<Budget> {
  async findById(id: string): Promise<Budget | null> {
    return await (prisma.budget as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Budget[]> {
    return await (prisma.budget as any).findMany(params);
  }
  async save(entity: any): Promise<Budget> {
    if (entity.id) {
      return await (prisma.budget as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.budget as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.budget as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Budget | null> { return (prisma.budget as any).findUnique(args); }
  async findFirst(args: any): Promise<Budget | null> { return (prisma.budget as any).findFirst(args); }
  async findMany(args: any): Promise<Budget[]> { return (prisma.budget as any).findMany(args); }
  async create(args: any): Promise<Budget> { return (prisma.budget as any).create(args); }
  async update(args: any): Promise<Budget> { return (prisma.budget as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.budget as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.budget as any).count(args); }
}

export const budgetRepository = new BudgetRepository();
