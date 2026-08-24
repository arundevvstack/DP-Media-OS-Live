import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { EmployeeDocument } from '@prisma/client';

export class EmployeeDocumentRepository implements IRepository<EmployeeDocument> {
  async findById(id: string): Promise<EmployeeDocument | null> {
    return await (prisma.employeeDocument as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<EmployeeDocument[]> {
    return await (prisma.employeeDocument as any).findMany(params);
  }
  async save(entity: any): Promise<EmployeeDocument> {
    if (entity.id) {
      return await (prisma.employeeDocument as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.employeeDocument as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.employeeDocument as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<EmployeeDocument | null> { return (prisma.employeeDocument as any).findUnique(args); }
  async findFirst(args: any): Promise<EmployeeDocument | null> { return (prisma.employeeDocument as any).findFirst(args); }
  async findMany(args: any): Promise<EmployeeDocument[]> { return (prisma.employeeDocument as any).findMany(args); }
  async create(args: any): Promise<EmployeeDocument> { return (prisma.employeeDocument as any).create(args); }
  async update(args: any): Promise<EmployeeDocument> { return (prisma.employeeDocument as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.employeeDocument as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.employeeDocument as any).count(args); }
}

export const employeeDocumentRepository = new EmployeeDocumentRepository();
