import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const files = [
  ...globSync('src/domains/**/*.ts'),
  ...globSync('src/app/api/**/*.ts'),
  ...globSync('src/app/api/**/*.tsx')
];

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;

  // 1. Remove const prisma = new PrismaClient()
  if (content.includes('const prisma = new PrismaClient()')) {
    content = content.replace(/const prisma = new PrismaClient\(\);?/g, '');
    modified = true;
  }

  // 2. Remove import { PrismaClient } from "@prisma/client" if we are removing its usage
  if (content.includes('import { PrismaClient } from "@prisma/client"')) {
    content = content.replace(/import \{ PrismaClient \} from ["']@prisma\/client["'];?\n?/g, '');
    modified = true;
  }

  // 3. Add import prisma from "@/lib/prisma" if prisma is used and not imported
  if (content.match(/\bprisma\./) && !content.includes('import prisma from')) {
    // Add to top of file
    content = 'import prisma from "@/lib/prisma";\n' + content;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    fixedCount++;
    console.log(`Fixed Prisma imports in ${file}`);
  }
});

console.log(`Fixed Prisma imports in ${fixedCount} files.`);
