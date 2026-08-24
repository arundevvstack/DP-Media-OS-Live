import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const files = [
  ...globSync('src/**/*.ts'),
  ...globSync('src/**/*.tsx')
];

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;

  // Add import prisma from "@/lib/prisma" if TransactionService(prisma) is used and not imported
  if (content.includes('new TransactionService(prisma)') && !content.includes('import prisma from')) {
    // Add to top of file
    content = 'import prisma from "@/lib/prisma";\n' + content;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    fixedCount++;
    console.log(`Fixed Prisma import in ${file}`);
  }
});

console.log(`Fixed Prisma imports in ${fixedCount} files.`);
