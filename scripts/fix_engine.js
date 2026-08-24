const fs = require('fs');

['src/lib/financial-engine.ts', 'src/lib/workflow-engine.ts'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = 'import prisma from "@/lib/prisma";\n' + c.replace(/const prisma = new PrismaClient\(\);?/g, '');
  fs.writeFileSync(f, c);
});
