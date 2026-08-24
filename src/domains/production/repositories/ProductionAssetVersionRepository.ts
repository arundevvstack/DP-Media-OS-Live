import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ProductionAssetVersion } from '@prisma/client';

export class ProductionAssetVersionRepository implements IRepository<ProductionAssetVersion> {
  async findById(id: string): Promise<ProductionAssetVersion | null> {
    return await (prisma.productionAssetVersion as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ProductionAssetVersion[]> {
    return await (prisma.productionAssetVersion as any).findMany(params);
  }
  async save(entity: any): Promise<ProductionAssetVersion> {
    if (entity.id) {
      return await (prisma.productionAssetVersion as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.productionAssetVersion as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.productionAssetVersion as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ProductionAssetVersion | null> { return (prisma.productionAssetVersion as any).findUnique(args); }
  async findFirst(args: any): Promise<ProductionAssetVersion | null> { return (prisma.productionAssetVersion as any).findFirst(args); }
  async findMany(args: any): Promise<ProductionAssetVersion[]> { return (prisma.productionAssetVersion as any).findMany(args); }
  async create(args: any): Promise<ProductionAssetVersion> { return (prisma.productionAssetVersion as any).create(args); }
  async update(args: any): Promise<ProductionAssetVersion> { return (prisma.productionAssetVersion as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.productionAssetVersion as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.productionAssetVersion as any).count(args); }
}

export const productionAssetVersionRepository = new ProductionAssetVersionRepository();
