"use server";

import prisma from "@/lib/prisma";

export async function getDepartmentsAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];

  return prisma.organizationUnit.findMany({
    where: {
      company_id: company.id,
      type: 'DEPARTMENT',
      is_active: true,
    },
    orderBy: { name: 'asc' },
  });
}

// Additional Actions for Onboarding Wizard
export async function getDesignationsAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.designation.findMany({ where: { company_id: company.id, is_active: true }, orderBy: { name: 'asc' } });
}

export async function getBranchesAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.organizationUnit.findMany({ where: { company_id: company.id, type: 'BRANCH', is_active: true }, orderBy: { name: 'asc' } });
}

export async function getTeamsAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.organizationUnit.findMany({ where: { company_id: company.id, type: 'TEAM', is_active: true }, orderBy: { name: 'asc' } });
}

export async function getJobGradesAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.jobGrade.findMany({ where: { company_id: company.id, is_active: true }, orderBy: { name: 'asc' } });
}

export async function getShiftsAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.shift.findMany({ where: { company_id: company.id, is_active: true }, orderBy: { name: 'asc' } });
}

export async function getPayrollGroupsAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.payrollGroup.findMany({ where: { company_id: company.id, is_active: true }, orderBy: { name: 'asc' } });
}

export async function getEmploymentTypesAction() {
  const company = await prisma.company.findFirst();
  if (!company) return [];
  return prisma.masterDataRecord.findMany({
    where: { company_id: company.id, category: 'EMPLOYMENT_TYPE', is_active: true },
    orderBy: { name: 'asc' }
  });
}


export async function addEmployeeAction(data: { fullName: string; email: string; department: string }) {
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error("No default company found");
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      company_id: company.id,
      email: data.email,
      fullName: data.fullName,
      department: data.department,
      status: "active",
      onboarding_status: "in_progress",
      availability: "available",
      productivity_score: 100,
      role_id: "STAFF"
    }
  });

  // Create activity log
  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      action: "EMPLOYEE_CREATED",
      user_id: newUser.id,
      user_name: newUser.fullName,
      company_id: company.id,
      details: JSON.stringify({
        department: data.department,
        status: "onboarding_started"
      })
    }
  });

  return { success: true, user: newUser };
}
