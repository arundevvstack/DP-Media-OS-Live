const fs = require('fs');

// Fix 1: Client components importing auth.ts
let clientsPage = fs.readFileSync('src/app/(dashboard)/clients/page.tsx', 'utf8');
clientsPage = clientsPage.replace(/import\s+\{.*\}\s+from\s+["']@\/lib\/auth["'];?/g, '/* import auth removed */');
fs.writeFileSync('src/app/(dashboard)/clients/page.tsx', clientsPage);

let projectsPage = fs.readFileSync('src/app/(dashboard)/projects/[projectId]/page.tsx', 'utf8');
projectsPage = projectsPage.replace(/import\s+\{.*\}\s+from\s+["']@\/lib\/auth["'];?/g, '/* import auth removed */');
fs.writeFileSync('src/app/(dashboard)/projects/[projectId]/page.tsx', projectsPage);

// Fix 2: event-bus import in route.ts
let sbRoute = fs.readFileSync('src/app/api/v1/media-ops/storyboard/[productionId]/approve/route.ts', 'utf8');
sbRoute = sbRoute.replace(/@\/core\/events\/event\.bus/g, '@/lib/event-bus');
fs.writeFileSync('src/app/api/v1/media-ops/storyboard/[productionId]/approve/route.ts', sbRoute);

// Fix 3 & 4: default prisma import
let callSheets = fs.readFileSync('src/app/api/v1/media-ops/productions/[id]/call-sheets/route.ts', 'utf8');
callSheets = callSheets.replace(/import\s+\{\s*prisma\s*\}\s+from\s+["']@\/lib\/prisma["']/g, 'import prisma from "@/lib/prisma"');
fs.writeFileSync('src/app/api/v1/media-ops/productions/[id]/call-sheets/route.ts', callSheets);

let crew = fs.readFileSync('src/app/api/v1/media-ops/productions/[id]/crew/route.ts', 'utf8');
crew = crew.replace(/import\s+\{\s*prisma\s*\}\s+from\s+["']@\/lib\/prisma["']/g, 'import prisma from "@/lib/prisma"');
fs.writeFileSync('src/app/api/v1/media-ops/productions/[id]/crew/route.ts', crew);

console.log('Fixed build errors');
