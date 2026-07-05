const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function restore() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log("No company found");
    return;
  }

  // Restore Clients
  console.log("Restoring clients...");
  await prisma.client.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        company_id: company.id,
        name: 'Acme Corporation',
        industry: 'Technology',
        email: 'hello@acme.com',
        contact_person: 'John Doe'
      },
      {
        id: crypto.randomUUID(),
        company_id: company.id,
        name: 'Globex Inc',
        industry: 'Manufacturing',
        email: 'sales@globex.com',
        contact_person: 'Jane Smith'
      },
      {
        id: crypto.randomUUID(),
        company_id: company.id,
        name: 'Initech',
        industry: 'Software',
        email: 'info@initech.com',
        contact_person: 'Peter Gibbons'
      }
    ]
  });

  console.log("Done restoring data!");
  await prisma.$disconnect();
}

restore();
