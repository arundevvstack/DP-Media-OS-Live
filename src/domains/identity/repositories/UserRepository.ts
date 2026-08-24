import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { User } from '@prisma/client';

export class UserRepository implements IRepository<User> {
  async findById(id: string): Promise<User | null> {
    return await (prisma.user as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<User[]> {
    return await (prisma.user as any).findMany(params);
  }
  async save(entity: any): Promise<User> {
    if (entity.id) {
      return await (prisma.user as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.user as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.user as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<User | null> { return (prisma.user as any).findUnique(args); }
  async findFirst(args: any): Promise<User | null> { return (prisma.user as any).findFirst(args); }
  async findMany(args: any): Promise<User[]> { return (prisma.user as any).findMany(args); }
  async create(args: any): Promise<User> { return (prisma.user as any).create(args); }
  async update(args: any): Promise<User> { return (prisma.user as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.user as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.user as any).count(args); }
}

export const userRepository = new UserRepository();
