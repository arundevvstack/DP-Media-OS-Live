import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const prospectService = {
  async create(data: {
    id?: string;
    company_id: string;
    company_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    service_vertical?: string;
    sub_vertical?: string;
    industry?: string;
    deal_value?: number;
    stage?: string;
    notes?: string;
    assignee_id?: string;
    project_type?: string;
  }) {
    return prisma.prospect.create({
      data: {
        id: data.id || crypto.randomUUID(),
        company_id: data.company_id,
        company_name: data.company_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        service_vertical: data.service_vertical,
        sub_vertical: data.sub_vertical,
        industry: data.industry,
        deal_value: data.deal_value ?? 0,
        stage: data.stage ?? 'new_lead',
        notes: data.notes,
        assignee_id: data.assignee_id,
        project_type: data.project_type ?? 'Normal Production',
        updated_at: new Date(),
      },
    });
  },

  async update(id: string, data: Partial<{
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    whatsapp: string;
    service_vertical: string;
    sub_vertical: string;
    industry: string;
    deal_value: number;
    stage: string;
    notes: string;
    assignee_id: string;
    project_type: string;
    is_converted: boolean;
    converted_client_id: string;
  }>) {
    return prisma.prospect.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  },

  async getById(id: string) {
    return prisma.prospect.findUnique({
      where: { id },
      include: {
        Company: true,
        User: true,
      },
    });
  },

  async getByCompany(company_id: string) {
    return prisma.prospect.findMany({
      where: { company_id },
      orderBy: { created_at: 'desc' },
    });
  },
};
