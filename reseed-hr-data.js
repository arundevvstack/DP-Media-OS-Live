const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: "Default Company", onboardingStatus: "completed", updatedAt: new Date() }
    });
  }

  await prisma.organizationUnit.deleteMany({ where: { company_id: company.id } });
  await prisma.designation.deleteMany({ where: { company_id: company.id } });
  await prisma.jobGrade.deleteMany({ where: { company_id: company.id } });
  await prisma.shift.deleteMany({ where: { company_id: company.id } });
  await prisma.payrollGroup.deleteMany({ where: { company_id: company.id } });
  await prisma.masterDataRecord.deleteMany({ where: { company_id: company.id, category: 'EMPLOYMENT_TYPE' } });

  const createMany = async (model, dataArr) => {
    for (const data of dataArr) {
      try {
        await model.create({ data });
      } catch (e) {}
    }
  };

  const branches = ['Tvm', 'Cochin', 'Chennai'];
  await createMany(prisma.organizationUnit, branches.map(name => ({ company_id: company.id, name, type: 'BRANCH' })));

  const departments = ['Production', 'Marketing', 'Sales', 'HR', 'Finance', 'AI'];
  await createMany(prisma.organizationUnit, departments.map(name => ({ company_id: company.id, name, type: 'DEPARTMENT' })));

  const teams = ['Production', 'Marketing', 'HR', 'Sales', 'AI'];
  await createMany(prisma.organizationUnit, teams.map(name => ({ company_id: company.id, name, type: 'TEAM' })));

  const designations = ['Producer', 'AI Artist', 'Editor', 'Junior Editor', 'DOP', 'Marketing Executive', 'Designer', 'HR Manager', 'Engineering', 'Fresher'];
  await createMany(prisma.designation, designations.map(name => ({ company_id: company.id, name })));

  const jobGrades = ['L Fresher', 'L Intermediate', 'L Expert', 'L Pro', 'L Director'];
  await createMany(prisma.jobGrade, jobGrades.map(name => ({ company_id: company.id, name })));

  const payrollGroups = ['Monthly Staff', 'Weekly Contractors', 'Hourly Part-Time'];
  await createMany(prisma.payrollGroup, payrollGroups.map(name => ({ company_id: company.id, name })));

  const employmentTypes = ['Full-Time', 'Part-Time', 'Contractor', 'Intern'];
  await createMany(prisma.masterDataRecord, employmentTypes.map(name => ({ company_id: company.id, name, category: 'EMPLOYMENT_TYPE' })));

  const shifts = ['Morning Shift', 'Evening Shift', 'Night Shift', 'General Shift'];
  await createMany(prisma.shift, shifts.map(name => ({ company_id: company.id, name })));

  console.log("Re-seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
