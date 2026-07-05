
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class MasterDataService {
  static async seed() { return; }
}
export const masterDataService = new MasterDataService();
