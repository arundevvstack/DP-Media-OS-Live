import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { BankAccount } from '@prisma/client';

export class BankAccountRepository implements IRepository<BankAccount> {
  async findById(id: string): Promise<BankAccount | null> {
    return await (prisma.bankAccount as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<BankAccount[]> {
    return await (prisma.bankAccount as any).findMany(params);
  }
  async save(entity: any): Promise<BankAccount> {
    if (entity.id) {
      return await (prisma.bankAccount as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.bankAccount as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.bankAccount as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<BankAccount | null> { return (prisma.bankAccount as any).findUnique(args); }
  async findFirst(args: any): Promise<BankAccount | null> { return (prisma.bankAccount as any).findFirst(args); }
  async findMany(args: any): Promise<BankAccount[]> { return (prisma.bankAccount as any).findMany(args); }
  async create(args: any): Promise<BankAccount> { return (prisma.bankAccount as any).create(args); }
  async update(args: any): Promise<BankAccount> { return (prisma.bankAccount as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.bankAccount as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.bankAccount as any).count(args); }
}

export const bankAccountRepository = new BankAccountRepository();
