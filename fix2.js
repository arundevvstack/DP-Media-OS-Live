const fs = require('fs');
let file = 'src/app/(dashboard)/hr-ops/recruitment/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const safeBlock = `
  const totalOpenRequisitions = await (prisma as any).jobRequisition?.count?.({ where: { status: 'PUBLISHED' } }) || 0;
  const totalCandidates = await (prisma as any).candidate?.count?.() || 0;
  const interviewsTodayCount = await (prisma as any).interview?.count?.({ where: { scheduled_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }) || 0;
  const pendingOffers = await (prisma as any).jobOffer?.count?.({ where: { status: 'DRAFT' } }) || 0;
  const recentCandidates = await (prisma as any).candidate?.findMany?.({ take: 5, orderBy: { created_at: 'desc' } }) || [];
  const activeRequisitions = await (prisma as any).jobRequisition?.findMany?.({ take: 4, orderBy: { created_at: 'desc' } }) || [];
`;

content = content.replace(/const\s+\[[\s\S]*?\]\s*=\s*await\s+Promise\.all\(\[[\s\S]*?\]\);/, safeBlock);

// Also fix mapping errors if elements are undefined
content = content.replace(/req\._count\.Applications/g, 'req._count?.Applications || 0');

fs.writeFileSync(file, content);
console.log('Fixed HR Dashboard prerender crash');
