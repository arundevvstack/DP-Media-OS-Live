const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.$queryRawUnsafe('SELECT id, "fullName", emp_code FROM "User"');
  console.log(users);
  await prisma.$disconnect();
}
run();
