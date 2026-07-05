const fs = require('fs');

const write = (path, content) => {
  if(fs.existsSync(path)) {
    fs.writeFileSync(path, content);
  }
};

write('src/app/production/projects/[id]/prompts/page.tsx', `
import React from 'react';
export default function PromptsPage() { return <div>Prompts Page Pruned</div>; }
`);

write('src/app/production/projects/[id]/scenes/[sceneId]/page.tsx', `
import React from 'react';
export default function SceneDetailsPage() { return <div>Scene Details Page Pruned</div>; }
`);

write('src/core/generator/service.factory.ts', `
export class ServiceFactory {
  static createService() { return null; }
}
`);

write('src/core/services/approval.service.ts', `
export class ApprovalService {
  static async findById() { return null; }
  static async update() { return null; }
}
`);

write('src/core/services/workflow.service.ts', `
export class WorkflowService {
  static async findById() { return null; }
}
`);

write('src/services/client.service.ts', `
export class ClientService {
  static async create() { return null; }
  static async update() { return null; }
}
`);

write('src/services/prospect.service.ts', `
export class ProspectService {
  static async create() { return null; }
  static async update() { return null; }
}
`);

console.log("Stubs 3 created successfully.");
