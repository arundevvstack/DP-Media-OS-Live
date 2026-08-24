import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { MarketLead } from '@prisma/client';

export class MarketLeadRepository implements IRepository<MarketLead> {
  async findById(id: string): Promise<MarketLead | null> {
    return await (prisma.marketLead as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<MarketLead[]> {
    return await (prisma.marketLead as any).findMany(params);
  }
  async save(entity: any): Promise<MarketLead> {
    if (entity.id) {
      return await (prisma.marketLead as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.marketLead as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.marketLead as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<MarketLead | null> { return (prisma.marketLead as any).findUnique(args); }
  async findFirst(args: any): Promise<MarketLead | null> { return (prisma.marketLead as any).findFirst(args); }
  async findMany(args: any): Promise<MarketLead[]> { return (prisma.marketLead as any).findMany(args); }
  async create(args: any): Promise<MarketLead> { return (prisma.marketLead as any).create(args); }
  async update(args: any): Promise<MarketLead> { return (prisma.marketLead as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.marketLead as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.marketLead as any).count(args); }
}

export const marketLeadRepository = new MarketLeadRepository();
