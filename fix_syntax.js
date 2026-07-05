const fs = require('fs');

const filesToFix = [
  'src/app/(dashboard)/projects/[projectId]/production/page.tsx',
  'src/app/(dashboard)/projects/[projectId]/reports/page.tsx',
  'src/app/api/v1/intelligence/reports/export/route.ts',
  'src/app/api/v1/search/route.ts',
  'src/components/shared/GlobalSearch.tsx',
  'src/core/services/intelligence/automation.engine.ts',
  'src/app/(dashboard)/executive/page.tsx',
  'src/app/(dashboard)/projects/[projectId]/page.tsx',
  'src/app/(dashboard)/projects/[projectId]/ai-coo/page.tsx',
  'src/app/(dashboard)/projects/[projectId]/pre-production/page.tsx',
  'src/app/(dashboard)/projects/[projectId]/post-production/page.tsx',
  'src/app/(dashboard)/projects/[projectId]/finance/page.tsx'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace \` with `
    content = content.replace(/\\`/g, '`');
    
    // Replace \${ with ${
    content = content.replace(/\\\$\{/g, '${');
    
    // In export/route.ts, replace \\n with \n
    if (file.includes('export')) {
      content = content.replace(/\\\\n/g, '\\n');
    }

    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
