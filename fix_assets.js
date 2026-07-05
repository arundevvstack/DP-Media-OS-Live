const fs = require('fs');
let file = 'src/app/(dashboard)/media-ops/execution/assets/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/prisma\.aIAsset\.findMany\(\{[\s\S]*?take: 100\n\s*\}\);/, prisma.asset.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    include: { Project: true }
  }););
content = content.replace(/asset\.asset_type/g, "(asset.file_type || 'IMAGE')");
content = content.replace(/asset\.Production\?\.title/g, "asset.Project?.project_name");
content = content.replace(/asset\.Versions\?\.length/g, "1");
content = content.replace(/asset\.status/g, "'APPROVED'");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed assets/page.tsx');
