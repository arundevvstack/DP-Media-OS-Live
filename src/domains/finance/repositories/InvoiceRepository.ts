import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { Invoice } from '@prisma/client';

export class InvoiceRepository implements IRepository<Invoice> {
  async findById(id: string): Promise<Invoice | null> {
    return await (prisma.invoice as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<Invoice[]> {
    return await (prisma.invoice as any).findMany(params);
  }
  async save(entity: any): Promise<Invoice> {
    if (entity.id) {
      return await (prisma.invoice as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.invoice as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.invoice as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<Invoice | null> { return (prisma.invoice as any).findUnique(args); }
  async findFirst(args: any): Promise<Invoice | null> { return (prisma.invoice as any).findFirst(args); }
  async findMany(args: any): Promise<Invoice[]> { return (prisma.invoice as any).findMany(args); }
  async create(args: any): Promise<Invoice> { return (prisma.invoice as any).create(args); }
  async update(args: any): Promise<Invoice> { return (prisma.invoice as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.invoice as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.invoice as any).count(args); }
}

export const invoiceRepository = new InvoiceRepository();
