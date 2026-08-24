import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Prospect } from '@prisma/client';

export class ProspectRepository implements IRepository<Prospect> {
  async findById(id: string): Promise<Prospect | null> {
    return await (prisma.prospect as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Prospect[]> {
    return await (prisma.prospect as any).findMany(params);
  }
  async save(entity: any): Promise<Prospect> {
    if (entity.id) {
      return await (prisma.prospect as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.prospect as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.prospect as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Prospect | null> { return (prisma.prospect as any).findUnique(args); }
  async findFirst(args: any): Promise<Prospect | null> { return (prisma.prospect as any).findFirst(args); }
  async findMany(args: any): Promise<Prospect[]> { return (prisma.prospect as any).findMany(args); }
  async create(args: any): Promise<Prospect> { return (prisma.prospect as any).create(args); }
  async update(args: any): Promise<Prospect> { return (prisma.prospect as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.prospect as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.prospect as any).count(args); }
}

export const prospectRepository = new ProspectRepository();
