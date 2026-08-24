import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ApprovalRequest } from '@prisma/client';

export class ApprovalRequestRepository implements IRepository<ApprovalRequest> {
  async findById(id: string): Promise<ApprovalRequest | null> {
    return await (prisma.approvalRequest as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ApprovalRequest[]> {
    return await (prisma.approvalRequest as any).findMany(params);
  }
  async save(entity: any): Promise<ApprovalRequest> {
    if (entity.id) {
      return await (prisma.approvalRequest as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.approvalRequest as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.approvalRequest as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ApprovalRequest | null> { return (prisma.approvalRequest as any).findUnique(args); }
  async findFirst(args: any): Promise<ApprovalRequest | null> { return (prisma.approvalRequest as any).findFirst(args); }
  async findMany(args: any): Promise<ApprovalRequest[]> { return (prisma.approvalRequest as any).findMany(args); }
  async create(args: any): Promise<ApprovalRequest> { return (prisma.approvalRequest as any).create(args); }
  async update(args: any): Promise<ApprovalRequest> { return (prisma.approvalRequest as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.approvalRequest as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.approvalRequest as any).count(args); }
}

export const approvalRequestRepository = new ApprovalRequestRepository();
