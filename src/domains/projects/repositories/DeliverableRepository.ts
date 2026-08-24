import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Deliverable } from '@prisma/client';

export class DeliverableRepository implements IRepository<Deliverable> {
  async findById(id: string): Promise<Deliverable | null> {
    return await (prisma.deliverable as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Deliverable[]> {
    return await (prisma.deliverable as any).findMany(params);
  }
  async save(entity: any): Promise<Deliverable> {
    if (entity.id) {
      return await (prisma.deliverable as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.deliverable as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.deliverable as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Deliverable | null> { return (prisma.deliverable as any).findUnique(args); }
  async findFirst(args: any): Promise<Deliverable | null> { return (prisma.deliverable as any).findFirst(args); }
  async findMany(args: any): Promise<Deliverable[]> { return (prisma.deliverable as any).findMany(args); }
  async create(args: any): Promise<Deliverable> { return (prisma.deliverable as any).create(args); }
  async update(args: any): Promise<Deliverable> { return (prisma.deliverable as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.deliverable as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.deliverable as any).count(args); }
}

export const deliverableRepository = new DeliverableRepository();
