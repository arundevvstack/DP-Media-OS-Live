import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { AuditLog } from '@prisma/client';

export class AuditLogRepository implements IRepository<AuditLog> {
  async findById(id: string): Promise<AuditLog | null> {
    return await (prisma.auditLog as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<AuditLog[]> {
    return await (prisma.auditLog as any).findMany(params);
  }
  async save(entity: any): Promise<AuditLog> {
    if (entity.id) {
      return await (prisma.auditLog as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.auditLog as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.auditLog as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<AuditLog | null> { return (prisma.auditLog as any).findUnique(args); }
  async findFirst(args: any): Promise<AuditLog | null> { return (prisma.auditLog as any).findFirst(args); }
  async findMany(args: any): Promise<AuditLog[]> { return (prisma.auditLog as any).findMany(args); }
  async create(args: any): Promise<AuditLog> { return (prisma.auditLog as any).create(args); }
  async update(args: any): Promise<AuditLog> { return (prisma.auditLog as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.auditLog as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.auditLog as any).count(args); }
}

export const auditLogRepository = new AuditLogRepository();
