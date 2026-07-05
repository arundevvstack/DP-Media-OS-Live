// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { ArrowLeft, Save } from "lucide-react";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OrganizationUnit } from '@prisma/client';
import { employeeService } from '@/core/services/hrms/employee.service';

async function getDepartments(companyId: string) {
  return await prisma.organizationUnit.findMany({
    where: { company_id: companyId, type: 'DEPARTMENT', is_active: true },
    orderBy: { name: 'asc' }
  });
}

export default async function AddEmployeePage() {
  const defaultCompany = await prisma.company.findFirst();
  if (!defaultCompany) {
    return <div className="p-8">Please configure a company first.</div>;
  }

  const departments = await getDepartments(defaultCompany.id);

  async function createEmployee(formData: FormData) {
    'use server';
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const organization_unit_id = formData.get('departmentId') as string;
    const role_id = formData.get('role') as string;

    // Hardcode company for now
    const company = await prisma.company.findFirst();
    if (!company) return;

    await prisma.user.create({
      data: {
        fullName,
        email,
        organization_unit_id: organization_unit_id || null,
        role_id,
        company_id: company.id,
        status: 'active',
        department: 'Assigned',
        availability: 'available',
      }
    });

    redirect('/hr-ops/hr/employees');
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr-ops/hr/employees" className="p-2 border border-border bg-card rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Employee</h1>
          <p className="text-muted-foreground mt-1">Create a new employee profile and assign them to a department.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form action={createEmployee} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Jane Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. jane@company.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="departmentId" className="text-sm font-medium">Department</label>
              <select
                id="departmentId"
                name="departmentId"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Department...</option>
                {departments.map((dept: OrganizationUnit) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">System Role</label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Link href="/hr-ops/hr/employees" className="px-4 py-2 border border-border bg-card rounded-md text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              <Save className="h-4 w-4" />
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
