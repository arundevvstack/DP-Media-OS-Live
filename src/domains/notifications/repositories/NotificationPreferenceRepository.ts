import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { NotificationPreference } from '@prisma/client';

export class NotificationPreferenceRepository implements IRepository<NotificationPreference> {
  async findById(id: string): Promise<NotificationPreference | null> {
    return await (prisma.notificationPreference as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<NotificationPreference[]> {
    return await (prisma.notificationPreference as any).findMany(params);
  }
  async save(entity: any): Promise<NotificationPreference> {
    if (entity.id) {
      return await (prisma.notificationPreference as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.notificationPreference as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.notificationPreference as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<NotificationPreference | null> { return (prisma.notificationPreference as any).findUnique(args); }
  async findFirst(args: any): Promise<NotificationPreference | null> { return (prisma.notificationPreference as any).findFirst(args); }
  async findMany(args: any): Promise<NotificationPreference[]> { return (prisma.notificationPreference as any).findMany(args); }
  async create(args: any): Promise<NotificationPreference> { return (prisma.notificationPreference as any).create(args); }
  async update(args: any): Promise<NotificationPreference> { return (prisma.notificationPreference as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.notificationPreference as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.notificationPreference as any).count(args); }
}

export const notificationPreferenceRepository = new NotificationPreferenceRepository();
