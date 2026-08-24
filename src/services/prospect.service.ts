import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';

const transactionService = new TransactionService(prisma);

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
  }, userId?: string, correlationId: string = crypto.randomUUID()) {
    return transactionService.runInTransaction(correlationId, async (tx) => {
      // Conflict detection for duplicate leads
      const existingProspect = await tx.prospect.findFirst({
        where: { company_id: data.company_id, company_name: data.company_name }
      });

      if (existingProspect) {
        throw new DomainError('Duplicate lead with the same company name exists', ErrorCode.CONFLICT);
      }

      return tx.prospect.create({
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
    }, undefined, {
      tenantId: data.company_id,
      userId,
      domain: 'crm',
      service: 'prospect-creation'
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
  }>, companyId?: string, userId?: string, correlationId: string = crypto.randomUUID()) {
    return transactionService.runInTransaction(correlationId, async (tx) => {
      const existingProspect = await tx.prospect.findFirst({
        where: { id }
      });
      
      if (!existingProspect) {
         throw new DomainError('Lead not found', ErrorCode.NOT_FOUND);
      }

      return tx.prospect.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
    }, undefined, {
      tenantId: companyId || 'unknown',
      userId,
      domain: 'crm',
      service: 'prospect-update',
      prospectId: id
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
