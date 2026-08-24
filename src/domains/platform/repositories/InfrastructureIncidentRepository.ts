import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { InfrastructureIncident } from '@prisma/client';

export class InfrastructureIncidentRepository implements IRepository<InfrastructureIncident> {
  async findById(id: string): Promise<InfrastructureIncident | null> {
    return await (prisma.infrastructureIncident as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<InfrastructureIncident[]> {
    return await (prisma.infrastructureIncident as any).findMany(params);
  }
  async save(entity: any): Promise<InfrastructureIncident> {
    if (entity.id) {
      return await (prisma.infrastructureIncident as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.infrastructureIncident as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.infrastructureIncident as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<InfrastructureIncident | null> { return (prisma.infrastructureIncident as any).findUnique(args); }
  async findFirst(args: any): Promise<InfrastructureIncident | null> { return (prisma.infrastructureIncident as any).findFirst(args); }
  async findMany(args: any): Promise<InfrastructureIncident[]> { return (prisma.infrastructureIncident as any).findMany(args); }
  async create(args: any): Promise<InfrastructureIncident> { return (prisma.infrastructureIncident as any).create(args); }
  async update(args: any): Promise<InfrastructureIncident> { return (prisma.infrastructureIncident as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.infrastructureIncident as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.infrastructureIncident as any).count(args); }
}

export const infrastructureIncidentRepository = new InfrastructureIncidentRepository();
