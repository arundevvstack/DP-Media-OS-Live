const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{ts,tsx}');

const auditData = {
  hardcoded: [],
  unused: [],
  security: [],
  performance: [],
  models: {},
  routes: {
    total: 0,
    api: 0,
    page: 0
  }
};

const patterns = {
  mathRandom: /Math\.random/g,
  todo: /TODO/g,
  fixme: /FIXME/g,
  tsIgnore: /@ts-ignore/g,
  tsNocheck: /@ts-nocheck/g,
  consoleLog: /console\.log/g,
  consoleError: /console\.error/g,
  dummy: /dummy/gi,
  mock: /mock/gi,
  fake: /fake/gi,
  sample: /sample/gi
};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const isApiRoute = file.includes('/api/') && file.endsWith('route.ts');
  const isPageRoute = file.endsWith('page.tsx');

  if (isApiRoute) {
    auditData.routes.api++;
    auditData.routes.total++;
    // Security check: simple check for auth usage in API
    if (!content.includes('requireAuth') && !content.includes('getServerSession') && !content.includes('Demo') && !content.includes('webhook')) {
      auditData.security.push({
        file,
        reason: 'Potential missing authentication / authorization',
        status: 'WARN'
      });
    }
  }
  
  if (isPageRoute) {
    auditData.routes.page++;
    auditData.routes.total++;
  }

  // Performance check: N+1 query simple regex (await prisma inside map or for loop)
  if (/(\.map\(|for \().*await prisma/s.test(content)) {
    auditData.performance.push({
      file,
      reason: 'Potential N+1 Query (await inside loop)',
      status: 'FAIL'
    });
  }

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    Object.entries(patterns).forEach(([key, regex]) => {
      if (regex.test(line)) {
        auditData.hardcoded.push({
          file,
          line: index + 1,
          reason: `Found ${key}`,
          replacement: 'Requires refactor to database-driven logic',
          status: 'FAIL'
        });
      }
    });
  });
});

fs.writeFileSync('audit_results.json', JSON.stringify(auditData, null, 2));
console.log(`Audit complete. Found ${auditData.hardcoded.length} hardcoded items, ${auditData.security.length} security warnings.`);
