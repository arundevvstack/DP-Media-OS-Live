const fs = require('fs');

const write = (path, content) => {
  fs.writeFileSync(path, content);
};

write('src/core/services/master-data.service.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class MasterDataService {
  static async seed() { return; }
}
`);

write('src/core/services/media/production.service.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ProductionService {
  static async getProductionJobs() { return []; }
}
`);

write('src/core/services/notification.service.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class NotificationService {
  static async sendNotification(data: any) { return null; }
}
`);

write('src/core/services/operations/work-order.service.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class WorkOrderService {
  static async createWorkOrder(data: any) { return null; }
}
`);

write('src/lib/ai-router.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class AIRouter {
  static async route(req: any) { return null; }
}
`);

write('src/lib/event-bus.ts', `
export class EventBus {
  static emit(event: string, payload: any) { }
}
`);

write('src/lib/production/assistant/ContextBuilder.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export interface AssistantContextParams { projectId: string; sceneId?: string | null; shotId?: string | null; assetId?: string | null; }
export class ContextBuilder {
  static async buildSystemPrompt(params: AssistantContextParams): Promise<string> {
    return "You are an AI assistant.";
  }
}
`);

write('src/lib/production/intelligence/GraphEngine.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class GraphEngine {
  static async universalSearch(projectId: string, query: string) { return []; }
  static async buildProjectGraph(projectId: string) { return []; }
  static async getStatistics(projectId: string) {
    return { sceneCount: 0, shotCount: 0, assetCount: 0, approvalRate: 100, memoryCount: 0 };
  }
}
`);

console.log("Stubs created successfully.");
