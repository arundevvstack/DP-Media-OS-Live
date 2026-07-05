const fs = require('fs');

const write = (path, content) => {
  if(fs.existsSync(path)) {
    fs.writeFileSync(path, content);
  }
};

write('src/app/production/projects/[id]/scenes/[sceneId]/shots/[shotId]/studio/page.tsx', `
import React from 'react';
export default function StudioPage() { return <div>Studio Page Pruned (Legacy Data Missing)</div>; }
`);

write('src/app/production/projects/[id]/scenes/page.tsx', `
import React from 'react';
export default function ScenesPage() { return <div>Scenes Page Pruned</div>; }
`);

write('src/app/production/projects/[id]/script/page.tsx', `
import React from 'react';
export default function ScriptPage() { return <div>Script Page Pruned</div>; }
`);

write('src/app/production/projects/[id]/shot-list/page.tsx', `
import React from 'react';
export default function ShotListPage() { return <div>Shot List Page Pruned</div>; }
`);

write('src/app/production/projects/[id]/storyboard/page.tsx', `
import React from 'react';
export default function StoryboardPage() { return <div>Storyboard Page Pruned</div>; }
`);

write('src/core/ai/provider-manager.ts', `
export class AIProviderManager {
  static getAdapter() { return null; }
  static getDecryptedCredentials() { return null; }
}
`);

write('src/core/generator/api.generator.ts', `
export class APIGenerator {
  static generate() { return null; }
}
`);

write('src/core/services/base.service.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class BaseService<T = any> {
  protected model: string;
  constructor(model: string) { this.model = model; }
}
`);

write('src/core/services/hrms/employee.service.ts', `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class EmployeeService {
  static async getEmployees() { return []; }
}
`);

write('src/core/services/intelligence/automation.engine.ts', `
export class AutomationEngine {
  static async trigger() { return null; }
}
`);

write('src/core/services/intelligence/health.engine.ts', `
export class HealthEngine {
  static async calculate() { return null; }
}
`);

console.log("Stubs created successfully.");
