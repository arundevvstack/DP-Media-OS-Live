import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { OperationalTelemetry } from '@prisma/client';

export class OperationalTelemetryRepository implements IRepository<OperationalTelemetry> {
  async findById(id: string): Promise<OperationalTelemetry | null> {
    return await (prisma.operationalTelemetry as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<OperationalTelemetry[]> {
    return await (prisma.operationalTelemetry as any).findMany(params);
  }
  async save(entity: any): Promise<OperationalTelemetry> {
    if (entity.id) {
      return await (prisma.operationalTelemetry as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.operationalTelemetry as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.operationalTelemetry as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<OperationalTelemetry | null> { return (prisma.operationalTelemetry as any).findUnique(args); }
  async findFirst(args: any): Promise<OperationalTelemetry | null> { return (prisma.operationalTelemetry as any).findFirst(args); }
  async findMany(args: any): Promise<OperationalTelemetry[]> { return (prisma.operationalTelemetry as any).findMany(args); }
  async create(args: any): Promise<OperationalTelemetry> { return (prisma.operationalTelemetry as any).create(args); }
  async update(args: any): Promise<OperationalTelemetry> { return (prisma.operationalTelemetry as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.operationalTelemetry as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.operationalTelemetry as any).count(args); }
}

export const operationalTelemetryRepository = new OperationalTelemetryRepository();
