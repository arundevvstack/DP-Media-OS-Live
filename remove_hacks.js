const fs = require('fs');

// 1. Restore pure prisma.ts
let prismaContent = `import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma
export { prisma }
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
`;
fs.writeFileSync('src/lib/prisma.ts', prismaContent);

// 2. Remove ts-nocheck from all broken files
const files = [
  'src/lib/ai-router.ts',
  'src/lib/health-engine.ts',
  'src/lib/production/intelligence/GraphEngine.ts',
  'src/lib/production/assistant/ContextBuilder.ts',
  'src/lib/production/providers/JobDispatcher.ts',
  'src/lib/production/providers/ProviderManager.ts',
  'src/core/services/intelligence/automation.engine.ts',
  'src/core/services/intelligence/creative.engine.ts',
  'src/core/services/intelligence/health.engine.ts',
  'src/core/services/master-data.service.ts',
  'src/core/services/media/production.service.ts',
  'src/core/services/notification.service.ts',
  'src/core/services/operations/work-order.service.ts'
];
let count = 0;
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.startsWith('// @ts-nocheck')) {
      content = content.replace('// @ts-nocheck\n', '');
      fs.writeFileSync(f, content);
      count++;
    }
  }
});
console.log('Removed hacks and ts-nocheck from ' + count + ' files.');
