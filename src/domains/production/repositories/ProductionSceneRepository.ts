import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ProductionScene } from '@prisma/client';

export class ProductionSceneRepository implements IRepository<ProductionScene> {
  async findById(id: string): Promise<ProductionScene | null> {
    return await (prisma.productionScene as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ProductionScene[]> {
    return await (prisma.productionScene as any).findMany(params);
  }
  async save(entity: any): Promise<ProductionScene> {
    if (entity.id) {
      return await (prisma.productionScene as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.productionScene as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.productionScene as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ProductionScene | null> { return (prisma.productionScene as any).findUnique(args); }
  async findFirst(args: any): Promise<ProductionScene | null> { return (prisma.productionScene as any).findFirst(args); }
  async findMany(args: any): Promise<ProductionScene[]> { return (prisma.productionScene as any).findMany(args); }
  async create(args: any): Promise<ProductionScene> { return (prisma.productionScene as any).create(args); }
  async update(args: any): Promise<ProductionScene> { return (prisma.productionScene as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.productionScene as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.productionScene as any).count(args); }
}

export const productionSceneRepository = new ProductionSceneRepository();
