import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log("No company found");
    return;
  }
  console.log("Company:", company.id);

  const settings = await prisma.companySettings.findUnique({
    where: { company_id: company.id }
  });
  console.log("Settings before:", settings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
