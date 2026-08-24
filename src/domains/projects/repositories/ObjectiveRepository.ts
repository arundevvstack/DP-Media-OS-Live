import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Objective } from '@prisma/client';

export class ObjectiveRepository implements IRepository<Objective> {
  async findById(id: string): Promise<Objective | null> {
    return await (prisma.objective as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Objective[]> {
    return await (prisma.objective as any).findMany(params);
  }
  async save(entity: any): Promise<Objective> {
    if (entity.id) {
      return await (prisma.objective as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.objective as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.objective as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Objective | null> { return (prisma.objective as any).findUnique(args); }
  async findFirst(args: any): Promise<Objective | null> { return (prisma.objective as any).findFirst(args); }
  async findMany(args: any): Promise<Objective[]> { return (prisma.objective as any).findMany(args); }
  async create(args: any): Promise<Objective> { return (prisma.objective as any).create(args); }
  async update(args: any): Promise<Objective> { return (prisma.objective as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.objective as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.objective as any).count(args); }
}

export const objectiveRepository = new ObjectiveRepository();
