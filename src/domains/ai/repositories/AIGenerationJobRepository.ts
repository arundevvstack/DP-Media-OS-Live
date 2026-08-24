import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { AIGenerationJob } from '@prisma/client';

export class AIGenerationJobRepository implements IRepository<AIGenerationJob> {
  async findById(id: string): Promise<AIGenerationJob | null> {
    return await (prisma.aIGenerationJob as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<AIGenerationJob[]> {
    return await (prisma.aIGenerationJob as any).findMany(params);
  }
  async save(entity: any): Promise<AIGenerationJob> {
    if (entity.id) {
      return await (prisma.aIGenerationJob as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.aIGenerationJob as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.aIGenerationJob as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<AIGenerationJob | null> { return (prisma.aIGenerationJob as any).findUnique(args); }
  async findFirst(args: any): Promise<AIGenerationJob | null> { return (prisma.aIGenerationJob as any).findFirst(args); }
  async findMany(args: any): Promise<AIGenerationJob[]> { return (prisma.aIGenerationJob as any).findMany(args); }
  async create(args: any): Promise<AIGenerationJob> { return (prisma.aIGenerationJob as any).create(args); }
  async update(args: any): Promise<AIGenerationJob> { return (prisma.aIGenerationJob as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.aIGenerationJob as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.aIGenerationJob as any).count(args); }
}

export const aIGenerationJobRepository = new AIGenerationJobRepository();
