import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { SalaryStructure } from '@prisma/client';

export class SalaryStructureRepository implements IRepository<SalaryStructure> {
  async findById(id: string): Promise<SalaryStructure | null> {
    return await (prisma.salaryStructure as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<SalaryStructure[]> {
    return await (prisma.salaryStructure as any).findMany(params);
  }
  async save(entity: any): Promise<SalaryStructure> {
    if (entity.id) {
      return await (prisma.salaryStructure as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.salaryStructure as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.salaryStructure as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<SalaryStructure | null> { return (prisma.salaryStructure as any).findUnique(args); }
  async findFirst(args: any): Promise<SalaryStructure | null> { return (prisma.salaryStructure as any).findFirst(args); }
  async findMany(args: any): Promise<SalaryStructure[]> { return (prisma.salaryStructure as any).findMany(args); }
  async create(args: any): Promise<SalaryStructure> { return (prisma.salaryStructure as any).create(args); }
  async update(args: any): Promise<SalaryStructure> { return (prisma.salaryStructure as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.salaryStructure as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.salaryStructure as any).count(args); }
}

export const salaryStructureRepository = new SalaryStructureRepository();
