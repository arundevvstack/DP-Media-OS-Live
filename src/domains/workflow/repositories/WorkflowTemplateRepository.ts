import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { WorkflowTemplate } from '@prisma/client';

export class WorkflowTemplateRepository implements IRepository<WorkflowTemplate> {
  async findById(id: string): Promise<WorkflowTemplate | null> {
    return await (prisma.workflowTemplate as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<WorkflowTemplate[]> {
    return await (prisma.workflowTemplate as any).findMany(params);
  }
  async save(entity: any): Promise<WorkflowTemplate> {
    if (entity.id) {
      return await (prisma.workflowTemplate as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.workflowTemplate as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.workflowTemplate as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<WorkflowTemplate | null> { return (prisma.workflowTemplate as any).findUnique(args); }
  async findFirst(args: any): Promise<WorkflowTemplate | null> { return (prisma.workflowTemplate as any).findFirst(args); }
  async findMany(args: any): Promise<WorkflowTemplate[]> { return (prisma.workflowTemplate as any).findMany(args); }
  async create(args: any): Promise<WorkflowTemplate> { return (prisma.workflowTemplate as any).create(args); }
  async update(args: any): Promise<WorkflowTemplate> { return (prisma.workflowTemplate as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.workflowTemplate as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.workflowTemplate as any).count(args); }
}

export const workflowTemplateRepository = new WorkflowTemplateRepository();
