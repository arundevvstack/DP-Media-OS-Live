const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes("import { prisma } from '@/lib/prisma'")) {
      content = content.replace(/import\s+\{\s*prisma\s*\}\s+from\s+['"]@\/lib\/prisma['"]/g, "import prisma from '@/lib/prisma'");
      changed = true;
    }
    
    if (content.includes('import { getCompanyId, requireAuth } from "@/lib/auth"')) {
      content = content.replace(/import\s+\{\s*getCompanyId,\s*requireAuth\s*\}\s+from\s+['"]@\/lib\/auth['"]/g, "import { getCompanyId, getUserDetails } from '@/lib/auth'");
      changed = true;
    }

    if (content.includes("import { requireAuth } from '@/lib/auth'") || content.includes('import { requireAuth } from "@/lib/auth"')) {
      content = content.replace(/import\s+\{\s*requireAuth\s*\}\s+from\s+['"]@\/lib\/auth['"]/g, "import { getUserDetails } from '@/lib/auth'");
      changed = true;
    }

    if (content.includes("await requireAuth()")) {
      content = content.replace(/await requireAuth\(\)/g, "await getUserDetails()");
      content = content.replace(/const\s+\{\s*company_id\s*\}\s*=\s*await\s+getUserDetails\(\)/g, "const { companyId: company_id } = await getUserDetails()");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
