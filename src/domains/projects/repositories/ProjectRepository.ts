import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Project } from '@prisma/client';

export class ProjectRepository implements IRepository<Project> {
  async findById(id: string): Promise<Project | null> {
    return await (prisma.project as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Project[]> {
    return await (prisma.project as any).findMany(params);
  }
  async save(entity: any): Promise<Project> {
    if (entity.id) {
      return await (prisma.project as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.project as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.project as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Project | null> { return (prisma.project as any).findUnique(args); }
  async findFirst(args: any): Promise<Project | null> { return (prisma.project as any).findFirst(args); }
  async findMany(args: any): Promise<Project[]> { return (prisma.project as any).findMany(args); }
  async create(args: any): Promise<Project> { return (prisma.project as any).create(args); }
  async update(args: any): Promise<Project> { return (prisma.project as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.project as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.project as any).count(args); }
}

export const projectRepository = new ProjectRepository();
