import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { MarketOpportunity } from '@prisma/client';

export class MarketOpportunityRepository implements IRepository<MarketOpportunity> {
  async findById(id: string): Promise<MarketOpportunity | null> {
    return await (prisma.marketOpportunity as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<MarketOpportunity[]> {
    return await (prisma.marketOpportunity as any).findMany(params);
  }
  async save(entity: any): Promise<MarketOpportunity> {
    if (entity.id) {
      return await (prisma.marketOpportunity as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.marketOpportunity as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.marketOpportunity as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<MarketOpportunity | null> { return (prisma.marketOpportunity as any).findUnique(args); }
  async findFirst(args: any): Promise<MarketOpportunity | null> { return (prisma.marketOpportunity as any).findFirst(args); }
  async findMany(args: any): Promise<MarketOpportunity[]> { return (prisma.marketOpportunity as any).findMany(args); }
  async create(args: any): Promise<MarketOpportunity> { return (prisma.marketOpportunity as any).create(args); }
  async update(args: any): Promise<MarketOpportunity> { return (prisma.marketOpportunity as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.marketOpportunity as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.marketOpportunity as any).count(args); }
}

export const marketOpportunityRepository = new MarketOpportunityRepository();
