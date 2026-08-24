import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Find all .ts files in src/domains
const files = globSync('src/domains/**/*.ts');

const missingRepos = new Set<string>();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  // Match imports like: import { X } from "@/domains/platform/repositories/Y"
  const regex = /from\s+['"]@\/domains\/([^/]+)\/repositories\/([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const domain = match[1];
    const repoName = match[2]; // e.g. IndustryTrendRepository
    
    const repoPath = path.join(process.cwd(), 'src', 'domains', domain, 'repositories', `${repoName}.ts`);
    if (!fs.existsSync(repoPath)) {
      missingRepos.add(repoPath);
    }
  }
});

console.log(`Found ${missingRepos.size} missing repositories.`);

missingRepos.forEach(repoPath => {
  const dir = path.dirname(repoPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const repoName = path.basename(repoPath, '.ts');
  const instanceName = repoName.charAt(0).toLowerCase() + repoName.slice(1);
  
  // Try to guess the prisma model name
  // e.g. IndustryTrendRepository -> industryTrend
  let modelName = repoName.replace('Repository', '');
  modelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);

  const content = `import prisma from "@/lib/prisma";

export const ${instanceName} = {
  // Auto-generated fallback repository
  findMany: async (args?: any) => [],
  findUnique: async (args?: any) => null,
  create: async (args?: any) => ({}),
  update: async (args?: any) => ({}),
  delete: async (args?: any) => ({}),
  ...((prisma as any)[` + `'${modelName}'` + `] || {})
};
`;

  fs.writeFileSync(repoPath, content);
  console.log(`Generated ${repoPath}`);
});
