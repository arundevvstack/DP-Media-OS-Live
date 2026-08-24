import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { AIOperationalMemory } from '@prisma/client';

export class AIOperationalMemoryRepository implements IRepository<AIOperationalMemory> {
  async findById(id: string): Promise<AIOperationalMemory | null> {
    return await (prisma.aIOperationalMemory as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<AIOperationalMemory[]> {
    return await (prisma.aIOperationalMemory as any).findMany(params);
  }
  async save(entity: any): Promise<AIOperationalMemory> {
    if (entity.id) {
      return await (prisma.aIOperationalMemory as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.aIOperationalMemory as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.aIOperationalMemory as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<AIOperationalMemory | null> { return (prisma.aIOperationalMemory as any).findUnique(args); }
  async findFirst(args: any): Promise<AIOperationalMemory | null> { return (prisma.aIOperationalMemory as any).findFirst(args); }
  async findMany(args: any): Promise<AIOperationalMemory[]> { return (prisma.aIOperationalMemory as any).findMany(args); }
  async create(args: any): Promise<AIOperationalMemory> { return (prisma.aIOperationalMemory as any).create(args); }
  async update(args: any): Promise<AIOperationalMemory> { return (prisma.aIOperationalMemory as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.aIOperationalMemory as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.aIOperationalMemory as any).count(args); }
}

export const aIOperationalMemoryRepository = new AIOperationalMemoryRepository();
