const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '8b6f0d4c-a137-473f-ab5c-bc0b2e002e7b';
  
  // Delete mock projects
  const deletedProjects = await prisma.project.deleteMany({
    where: { 
      company_id: companyId,
      project_name: { in: ['Q4 Global Launch Campaign', 'Summer AI Lookbook'] }
    },
  });
  console.log('Deleted projects:', deletedProjects);

}
main().catch(console.error).finally(() => prisma.$disconnect());
