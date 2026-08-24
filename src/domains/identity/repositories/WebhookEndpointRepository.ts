import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { WebhookEndpoint } from '@prisma/client';

export class WebhookEndpointRepository implements IRepository<WebhookEndpoint> {
  async findById(id: string): Promise<WebhookEndpoint | null> {
    return await (prisma.webhookEndpoint as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<WebhookEndpoint[]> {
    return await (prisma.webhookEndpoint as any).findMany(params);
  }
  async save(entity: any): Promise<WebhookEndpoint> {
    if (entity.id) {
      return await (prisma.webhookEndpoint as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.webhookEndpoint as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.webhookEndpoint as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<WebhookEndpoint | null> { return (prisma.webhookEndpoint as any).findUnique(args); }
  async findFirst(args: any): Promise<WebhookEndpoint | null> { return (prisma.webhookEndpoint as any).findFirst(args); }
  async findMany(args: any): Promise<WebhookEndpoint[]> { return (prisma.webhookEndpoint as any).findMany(args); }
  async create(args: any): Promise<WebhookEndpoint> { return (prisma.webhookEndpoint as any).create(args); }
  async update(args: any): Promise<WebhookEndpoint> { return (prisma.webhookEndpoint as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.webhookEndpoint as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.webhookEndpoint as any).count(args); }
}

export const webhookEndpointRepository = new WebhookEndpointRepository();
