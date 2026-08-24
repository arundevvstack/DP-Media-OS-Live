import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ProductionAIJob } from '@prisma/client';

export class ProductionAIJobRepository implements IRepository<ProductionAIJob> {
  async findById(id: string): Promise<ProductionAIJob | null> {
    return await (prisma.productionAIJob as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ProductionAIJob[]> {
    return await (prisma.productionAIJob as any).findMany(params);
  }
  async save(entity: any): Promise<ProductionAIJob> {
    if (entity.id) {
      return await (prisma.productionAIJob as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.productionAIJob as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.productionAIJob as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ProductionAIJob | null> { return (prisma.productionAIJob as any).findUnique(args); }
  async findFirst(args: any): Promise<ProductionAIJob | null> { return (prisma.productionAIJob as any).findFirst(args); }
  async findMany(args: any): Promise<ProductionAIJob[]> { return (prisma.productionAIJob as any).findMany(args); }
  async create(args: any): Promise<ProductionAIJob> { return (prisma.productionAIJob as any).create(args); }
  async update(args: any): Promise<ProductionAIJob> { return (prisma.productionAIJob as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.productionAIJob as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.productionAIJob as any).count(args); }
}

export const productionAIJobRepository = new ProductionAIJobRepository();
