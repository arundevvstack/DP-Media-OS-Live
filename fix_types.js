const fs = require('fs');

// 1. search/route.ts
let search = fs.readFileSync('src/app/api/v1/search/route.ts', 'utf8');
search = search.replace(/{ title: { contains: query, mode: 'insensitive' } }/g, "{ project_name: { contains: query, mode: 'insensitive' } }");
search = search.replace(/p\.title/g, 'p.project_name');
// Remove description from Project search
search = search.replace(/{ description: { contains: query, mode: 'insensitive' } }/g, "/* no desc */");
// Fix user fullName
search = search.replace(/{ first_name: { contains: query, mode: 'insensitive' } },\s*{ last_name: { contains: query, mode: 'insensitive' } }/g, "{ fullName: { contains: query, mode: 'insensitive' } }");
search = search.replace(/`\$\{u\.first_name\} \$\{u\.last_name\}`/g, 'u.fullName');
search = search.replace(/u\.job_title/g, 'u.department');

// Fix Storyboard
search = search.replace(/prisma\.storyboard\.findMany\(\{[\s\S]*?take: 5\n\s*\}\)/, `prisma.storyboard.findMany({ where: { name: { contains: query, mode: 'insensitive' } }, take: 5 })`);
search = search.replace(/s\.title/g, 's.name').replace(/s\.project_id/g, 's.production_id');

// Fix AIAsset
search = search.replace(/prisma\.aIAsset\.findMany\(\{[\s\S]*?take: 5\n\s*\}\)/, `prisma.aIAsset.findMany({ where: { name: { contains: query, mode: 'insensitive' } }, take: 5 })`);
search = search.replace(/a\.title/g, 'a.name');

fs.writeFileSync('src/app/api/v1/search/route.ts', search);

// 2. health.engine.ts
let health = fs.readFileSync('src/core/services/intelligence/health.engine.ts', 'utf8');
health = health.replace(/project\.Budget\?\.spent_amount/g, 'project.Budget?.utilized_budget');
fs.writeFileSync('src/core/services/intelligence/health.engine.ts', health);

// 3. automation.engine.ts
let auto = fs.readFileSync('src/core/services/intelligence/automation.engine.ts', 'utf8');
auto = auto.replace(/type: eventType,/g, "topic: eventType,\n      source: 'automation_engine',\n      tenant_id: companyId,");
fs.writeFileSync('src/core/services/intelligence/automation.engine.ts', auto);

// 4. risk.engine.ts
let risk = fs.readFileSync('src/core/services/intelligence/risk.engine.ts', 'utf8');
risk = risk.replace(/const risks = \[\];/g, "const risks: string[] = [];");
fs.writeFileSync('src/core/services/intelligence/risk.engine.ts', risk);

// 5. timeline.engine.ts
let time = fs.readFileSync('src/core/services/intelligence/timeline.engine.ts', 'utf8');
time = time.replace(/new Date\(late\[0\]\.due_date\)/g, "new Date(late[0].due_date as Date)");
fs.writeFileSync('src/core/services/intelligence/timeline.engine.ts', time);

console.log("Types fixed!");
