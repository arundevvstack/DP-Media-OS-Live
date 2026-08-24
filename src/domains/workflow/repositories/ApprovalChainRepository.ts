import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ApprovalChain } from '@prisma/client';

export class ApprovalChainRepository implements IRepository<ApprovalChain> {
  async findById(id: string): Promise<ApprovalChain | null> {
    return await (prisma.approvalChain as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<ApprovalChain[]> {
    return await (prisma.approvalChain as any).findMany(params);
  }
  async save(entity: any): Promise<ApprovalChain> {
    if (entity.id) {
      return await (prisma.approvalChain as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.approvalChain as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.approvalChain as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<ApprovalChain | null> { return (prisma.approvalChain as any).findUnique(args); }
  async findFirst(args: any): Promise<ApprovalChain | null> { return (prisma.approvalChain as any).findFirst(args); }
  async findMany(args: any): Promise<ApprovalChain[]> { return (prisma.approvalChain as any).findMany(args); }
  async create(args: any): Promise<ApprovalChain> { return (prisma.approvalChain as any).create(args); }
  async update(args: any): Promise<ApprovalChain> { return (prisma.approvalChain as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.approvalChain as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.approvalChain as any).count(args); }
}

export const approvalChainRepository = new ApprovalChainRepository();
