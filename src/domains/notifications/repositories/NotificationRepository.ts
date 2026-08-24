import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Notification } from '@prisma/client';

export class NotificationRepository implements IRepository<Notification> {
  async findById(id: string): Promise<Notification | null> {
    return await (prisma.notification as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Notification[]> {
    return await (prisma.notification as any).findMany(params);
  }
  async save(entity: any): Promise<Notification> {
    if (entity.id) {
      return await (prisma.notification as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.notification as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.notification as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Notification | null> { return (prisma.notification as any).findUnique(args); }
  async findFirst(args: any): Promise<Notification | null> { return (prisma.notification as any).findFirst(args); }
  async findMany(args: any): Promise<Notification[]> { return (prisma.notification as any).findMany(args); }
  async create(args: any): Promise<Notification> { return (prisma.notification as any).create(args); }
  async update(args: any): Promise<Notification> { return (prisma.notification as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.notification as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.notification as any).count(args); }
}

export const notificationRepository = new NotificationRepository();
