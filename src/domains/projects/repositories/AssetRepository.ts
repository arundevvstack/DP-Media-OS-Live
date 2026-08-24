import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Asset } from '@prisma/client';

export class AssetRepository implements IRepository<Asset> {
  async findById(id: string): Promise<Asset | null> {
    return await (prisma.asset as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Asset[]> {
    return await (prisma.asset as any).findMany(params);
  }
  async save(entity: any): Promise<Asset> {
    if (entity.id) {
      return await (prisma.asset as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.asset as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.asset as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Asset | null> { return (prisma.asset as any).findUnique(args); }
  async findFirst(args: any): Promise<Asset | null> { return (prisma.asset as any).findFirst(args); }
  async findMany(args: any): Promise<Asset[]> { return (prisma.asset as any).findMany(args); }
  async create(args: any): Promise<Asset> { return (prisma.asset as any).create(args); }
  async update(args: any): Promise<Asset> { return (prisma.asset as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.asset as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.asset as any).count(args); }
}

export const assetRepository = new AssetRepository();
