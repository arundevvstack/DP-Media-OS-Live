const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: "Default Company", onboardingStatus: "completed", updatedAt: new Date() }
    });
  }

  const createIgnore = async (model, data) => {
    try {
      await model.create({ data });
    } catch (e) {
      // Ignore if exists or error
    }
  };

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  for (const name of departments) await createIgnore(prisma.organizationUnit, { company_id: company.id, name, type: 'DEPARTMENT' });

  const branches = ['New York', 'London', 'Tokyo', 'Remote'];
  for (const name of branches) await createIgnore(prisma.organizationUnit, { company_id: company.id, name, type: 'BRANCH' });

  const teams = ['Frontend', 'Backend', 'DevOps', 'Design', 'QA'];
  for (const name of teams) await createIgnore(prisma.organizationUnit, { company_id: company.id, name, type: 'TEAM' });

  const designations = ['Software Engineer', 'Senior Engineer', 'Product Manager', 'Designer', 'HR Manager'];
  for (const name of designations) await createIgnore(prisma.designation, { company_id: company.id, name });

  const jobGrades = ['L1', 'L2', 'L3', 'L4', 'L5'];
  for (const name of jobGrades) await createIgnore(prisma.jobGrade, { company_id: company.id, name });

  const shifts = ['Morning Shift', 'Evening Shift', 'Night Shift', 'General Shift'];
  for (const name of shifts) await createIgnore(prisma.shift, { company_id: company.id, name });

  const payrollGroups = ['Monthly Staff', 'Weekly Contractors', 'Hourly Part-Time'];
  for (const name of payrollGroups) await createIgnore(prisma.payrollGroup, { company_id: company.id, name });

  const employmentTypes = ['Full-Time', 'Part-Time', 'Contractor', 'Intern'];
  for (const name of employmentTypes) await createIgnore(prisma.masterDataRecord, { company_id: company.id, name, category: 'EMPLOYMENT_TYPE' });

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
