import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Expense } from '@prisma/client';

export class ExpenseRepository implements IRepository<Expense> {
  async findById(id: string): Promise<Expense | null> {
    return await (prisma.expense as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Expense[]> {
    return await (prisma.expense as any).findMany(params);
  }
  async save(entity: any): Promise<Expense> {
    if (entity.id) {
      return await (prisma.expense as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.expense as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.expense as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Expense | null> { return (prisma.expense as any).findUnique(args); }
  async findFirst(args: any): Promise<Expense | null> { return (prisma.expense as any).findFirst(args); }
  async findMany(args: any): Promise<Expense[]> { return (prisma.expense as any).findMany(args); }
  async create(args: any): Promise<Expense> { return (prisma.expense as any).create(args); }
  async update(args: any): Promise<Expense> { return (prisma.expense as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.expense as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.expense as any).count(args); }
}

export const expenseRepository = new ExpenseRepository();
