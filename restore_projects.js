const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function restoreProjects() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log("No company found");
    return;
  }
  const company_id = company.id;
  console.log("Restoring projects for company:", company_id);

  // 3. Seed Fake Projects
  const healthyProject = await prisma.project.create({
      data: {
          id: crypto.randomUUID(),
          company_id,
          project_name: 'Q4 Global Launch Campaign',
          status: 'active'
      }
  });

  const atRiskProject = await prisma.project.create({
      data: {
          id: crypto.randomUUID(),
          company_id,
          project_name: 'Summer AI Lookbook',
          status: 'active'
      }
  });

  console.log("Projects restored successfully!");
  await prisma.$disconnect();
}

restoreProjects();
