import fs from 'fs';
import path from 'path';

const domains = {
  identity: ['User', 'Company', 'ApiKey', 'WebhookEndpoint'],
  crm: ['Client', 'Prospect', 'MarketLead', 'MarketOpportunity'],
  projects: ['Project', 'Objective', 'Asset', 'Deliverable', 'TimeEntry'],
  production: ['ProductionAIJob', 'ProductionScene', 'ProductionShot', 'ProductionAssetVersion'],
  finance: ['Budget', 'Expense', 'Invoice', 'BankAccount'],
  hrm: ['EmployeeDocument', 'EmployeeAttendance', 'SalaryStructure'],
  ai: ['AIGenerationJob', 'AIOperationalMemory'],
  workflow: ['WorkflowTemplate', 'ApprovalChain', 'ApprovalRequest'],
  notifications: ['Notification', 'NotificationPreference'],
  platform: ['AuditLog', 'ActivityLog', 'OperationalTelemetry', 'InfrastructureIncident'],
};

const baseDir = path.join(__dirname, '../src/domains');

const subdirs = ['application', 'domain', 'infrastructure', 'repositories', 'services', 'validators', 'dto', 'events', 'errors'];

function generate() {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  for (const [domain, models] of Object.entries(domains)) {
    const domainDir = path.join(baseDir, domain);
    
    // Create subdirectories
    for (const subdir of subdirs) {
      const dirPath = path.join(domainDir, subdir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    // Create Repositories and Services for each model
    for (const model of models) {
      const repoPath = path.join(domainDir, 'repositories', `${model}Repository.ts`);
      const delegateName = model.charAt(0).toLowerCase() + model.slice(1);
      
      const repoContent = `import prisma from '@/lib/prisma';
import { IRepository } from '@/core/repositories/IRepository';
import { ${model} } from '@prisma/client';

export class ${model}Repository implements IRepository<${model}> {
  async findById(id: string): Promise<${model} | null> {
    return await (prisma.${delegateName} as any).findUnique({ where: { id } });
  }
  async findAll(params?: any): Promise<${model}[]> {
    return await (prisma.${delegateName} as any).findMany(params);
  }
  async save(entity: any): Promise<${model}> {
    if (entity.id) {
      return await (prisma.${delegateName} as any).update({ where: { id: entity.id }, data: entity });
    }
    return await (prisma.${delegateName} as any).create({ data: entity });
  }
  async delete(id: string): Promise<boolean> {
    await (prisma.${delegateName} as any).delete({ where: { id } });
    return true;
  }
  
  // Proxy Prisma methods to ease Strangler Fig migration without breaking types
  async findUnique(args: any): Promise<${model} | null> { return (prisma.${delegateName} as any).findUnique(args); }
  async findFirst(args: any): Promise<${model} | null> { return (prisma.${delegateName} as any).findFirst(args); }
  async findMany(args: any): Promise<${model}[]> { return (prisma.${delegateName} as any).findMany(args); }
  async create(args: any): Promise<${model}> { return (prisma.${delegateName} as any).create(args); }
  async update(args: any): Promise<${model}> { return (prisma.${delegateName} as any).update(args); }
  async deleteMany(args: any): Promise<any> { return (prisma.${delegateName} as any).deleteMany(args); }
  async count(args: any): Promise<number> { return (prisma.${delegateName} as any).count(args); }
}

export const ${delegateName}Repository = new ${model}Repository();
`;
      fs.writeFileSync(repoPath, repoContent);

      const servicePath = path.join(domainDir, 'services', `${model}Service.ts`);
      const serviceContent = `import { BaseService } from '@/core/services/BaseService';
import { ${model}Repository, ${delegateName}Repository } from '../repositories/${model}Repository';

export class ${model}Service extends BaseService {
  constructor(private readonly repository: ${model}Repository = ${delegateName}Repository) {
    super();
  }
  // Add domain logic here
}

export const ${delegateName}Service = new ${model}Service();
`;
      fs.writeFileSync(servicePath, serviceContent);
    }
  }

  console.log('DDD Scaffold generated successfully.');
}

generate();
