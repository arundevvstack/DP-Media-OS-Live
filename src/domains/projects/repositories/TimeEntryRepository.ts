import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { TimeEntry } from '@prisma/client';

export class TimeEntryRepository implements IRepository<TimeEntry> {
  async findById(id: string): Promise<TimeEntry | null> {
    return await (prisma.timeEntry as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<TimeEntry[]> {
    return await (prisma.timeEntry as any).findMany(params);
  }
  async save(entity: any): Promise<TimeEntry> {
    if (entity.id) {
      return await (prisma.timeEntry as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.timeEntry as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.timeEntry as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<TimeEntry | null> { return (prisma.timeEntry as any).findUnique(args); }
  async findFirst(args: any): Promise<TimeEntry | null> { return (prisma.timeEntry as any).findFirst(args); }
  async findMany(args: any): Promise<TimeEntry[]> { return (prisma.timeEntry as any).findMany(args); }
  async create(args: any): Promise<TimeEntry> { return (prisma.timeEntry as any).create(args); }
  async update(args: any): Promise<TimeEntry> { return (prisma.timeEntry as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.timeEntry as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.timeEntry as any).count(args); }
}

export const timeEntryRepository = new TimeEntryRepository();
