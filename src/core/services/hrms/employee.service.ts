
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class EmployeeService {
  static async getEmployees() { return []; }
}
