import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ProductionShot } from '@prisma/client';

export class ProductionShotRepository implements IRepository<ProductionShot> {
  async findById(id: string): Promise<ProductionShot | null> {
    return await (prisma.productionShot as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ProductionShot[]> {
    return await (prisma.productionShot as any).findMany(params);
  }
  async save(entity: any): Promise<ProductionShot> {
    if (entity.id) {
      return await (prisma.productionShot as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.productionShot as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.productionShot as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ProductionShot | null> { return (prisma.productionShot as any).findUnique(args); }
  async findFirst(args: any): Promise<ProductionShot | null> { return (prisma.productionShot as any).findFirst(args); }
  async findMany(args: any): Promise<ProductionShot[]> { return (prisma.productionShot as any).findMany(args); }
  async create(args: any): Promise<ProductionShot> { return (prisma.productionShot as any).create(args); }
  async update(args: any): Promise<ProductionShot> { return (prisma.productionShot as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.productionShot as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.productionShot as any).count(args); }
}

export const productionShotRepository = new ProductionShotRepository();
