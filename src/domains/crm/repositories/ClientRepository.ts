import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Client } from '@prisma/client';

export class ClientRepository implements IRepository<Client> {
  async findById(id: string): Promise<Client | null> {
    return await (prisma.client as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Client[]> {
    return await (prisma.client as any).findMany(params);
  }
  async save(entity: any): Promise<Client> {
    if (entity.id) {
      return await (prisma.client as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.client as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.client as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Client | null> { return (prisma.client as any).findUnique(args); }
  async findFirst(args: any): Promise<Client | null> { return (prisma.client as any).findFirst(args); }
  async findMany(args: any): Promise<Client[]> { return (prisma.client as any).findMany(args); }
  async create(args: any): Promise<Client> { return (prisma.client as any).create(args); }
  async update(args: any): Promise<Client> { return (prisma.client as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.client as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.client as any).count(args); }
}

export const clientRepository = new ClientRepository();
