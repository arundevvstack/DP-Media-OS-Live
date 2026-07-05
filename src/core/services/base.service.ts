
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class BaseService<T = any> {
  protected model: string;
  constructor(model: string) { this.model = model; }
}
