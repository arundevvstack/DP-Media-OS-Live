
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ProductionService {
  static async getProductionJobs() { return []; }
}
