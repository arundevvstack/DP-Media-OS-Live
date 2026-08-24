import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Company } from '@prisma/client';

export class CompanyRepository implements IRepository<Company> {
  async findById(id: string): Promise<Company | null> {
    return await (prisma.company as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Company[]> {
    return await (prisma.company as any).findMany(params);
  }
  async save(entity: any): Promise<Company> {
    if (entity.id) {
      return await (prisma.company as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.company as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.company as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Company | null> { return (prisma.company as any).findUnique(args); }
  async findFirst(args: any): Promise<Company | null> { return (prisma.company as any).findFirst(args); }
  async findMany(args: any): Promise<Company[]> { return (prisma.company as any).findMany(args); }
  async create(args: any): Promise<Company> { return (prisma.company as any).create(args); }
  async update(args: any): Promise<Company> { return (prisma.company as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.company as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.company as any).count(args); }
}

export const companyRepository = new CompanyRepository();
