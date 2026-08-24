import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ActivityLog } from '@prisma/client';

export class ActivityLogRepository implements IRepository<ActivityLog> {
  async findById(id: string): Promise<ActivityLog | null> {
    return await (prisma.activityLog as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ActivityLog[]> {
    return await (prisma.activityLog as any).findMany(params);
  }
  async save(entity: any): Promise<ActivityLog> {
    if (entity.id) {
      return await (prisma.activityLog as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.activityLog as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.activityLog as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ActivityLog | null> { return (prisma.activityLog as any).findUnique(args); }
  async findFirst(args: any): Promise<ActivityLog | null> { return (prisma.activityLog as any).findFirst(args); }
  async findMany(args: any): Promise<ActivityLog[]> { return (prisma.activityLog as any).findMany(args); }
  async create(args: any): Promise<ActivityLog> { return (prisma.activityLog as any).create(args); }
  async update(args: any): Promise<ActivityLog> { return (prisma.activityLog as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.activityLog as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.activityLog as any).count(args); }
}

export const activityLogRepository = new ActivityLogRepository();
