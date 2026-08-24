const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/**/*.tsx');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find prisma.*.findUnique({ where: { id: ..., company_id } })
  // Actually, we can just replace .findUnique with .findFirst if we see company_id in the where clause,
  // but to be safe, let's just do a regex for prisma.project.findUnique
  content = content.replace(/prisma\.project\.findUnique\(\{\s*where:\s*\{\s*id:\s*projectId,\s*company_id\s*\},/g, 'prisma.project.findFirst({\n    where: { id: projectId, company_id },');
  
  // also handle the one in ai-coo/page.tsx
  content = content.replace(/prisma\.project\.findUnique\(\{\s*where:\s*\{\s*id:\s*projectId,\s*company_id\s*\}\s*\}\)/g, 'prisma.project.findFirst({\n    where: { id: projectId, company_id }\n  })');

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
    count++;
  }
});
console.log('Fixed count:', count);
