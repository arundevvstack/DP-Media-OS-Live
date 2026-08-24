import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ApiKey } from '@prisma/client';

export class ApiKeyRepository implements IRepository<ApiKey> {
  async findById(id: string): Promise<ApiKey | null> {
    return await (prisma.apiKey as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ApiKey[]> {
    return await (prisma.apiKey as any).findMany(params);
  }
  async save(entity: any): Promise<ApiKey> {
    if (entity.id) {
      return await (prisma.apiKey as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.apiKey as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.apiKey as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ApiKey | null> { return (prisma.apiKey as any).findUnique(args); }
  async findFirst(args: any): Promise<ApiKey | null> { return (prisma.apiKey as any).findFirst(args); }
  async findMany(args: any): Promise<ApiKey[]> { return (prisma.apiKey as any).findMany(args); }
  async create(args: any): Promise<ApiKey> { return (prisma.apiKey as any).create(args); }
  async update(args: any): Promise<ApiKey> { return (prisma.apiKey as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.apiKey as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.apiKey as any).count(args); }
}

export const apiKeyRepository = new ApiKeyRepository();
