import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { EmployeeAttendance } from '@prisma/client';

export class EmployeeAttendanceRepository implements IRepository<EmployeeAttendance> {
  async findById(id: string): Promise<EmployeeAttendance | null> {
    return await (prisma.employeeAttendance as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<EmployeeAttendance[]> {
    return await (prisma.employeeAttendance as any).findMany(params);
  }
  async save(entity: any): Promise<EmployeeAttendance> {
    if (entity.id) {
      return await (prisma.employeeAttendance as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.employeeAttendance as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.employeeAttendance as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<EmployeeAttendance | null> { return (prisma.employeeAttendance as any).findUnique(args); }
  async findFirst(args: any): Promise<EmployeeAttendance | null> { return (prisma.employeeAttendance as any).findFirst(args); }
  async findMany(args: any): Promise<EmployeeAttendance[]> { return (prisma.employeeAttendance as any).findMany(args); }
  async create(args: any): Promise<EmployeeAttendance> { return (prisma.employeeAttendance as any).create(args); }
  async update(args: any): Promise<EmployeeAttendance> { return (prisma.employeeAttendance as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.employeeAttendance as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.employeeAttendance as any).count(args); }
}

export const employeeAttendanceRepository = new EmployeeAttendanceRepository();
