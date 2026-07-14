import prisma from '@/lib/prisma';
import { ProjectTemplate } from '@/lib/workflow/template-engine';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import crypto from 'crypto';
import { TransactionService, DomainError, ErrorCode } from '@/lib/transaction';

// Initialize Supabase Admin client using service role key
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transactionService = new TransactionService(prisma);

export const clientService = {
  async create(data: {
    company_id: string;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    industry?: string;
    billing_address?: string;
    gstin?: string;
  }, userId?: string, correlationId: string = crypto.randomUUID()) {
    return transactionService.runInTransaction(correlationId, async (tx) => {
      // Conflict detection for duplicate clients
      const existingClient = await tx.client.findFirst({
        where: { company_id: data.company_id, name: data.name }
      });
      if (existingClient) {
        throw new DomainError('Duplicate client with the same name exists', ErrorCode.CONFLICT);
      }

      return tx.client.create({
        data: {
          id: crypto.randomUUID(),
          company_id: data.company_id,
          name: data.name,
          contact_person: data.contact_person,
          email: data.email,
          phone: data.phone,
          industry: data.industry,
          billing_address: data.billing_address,
          gstin: data.gstin,
        },
      });
    }, undefined, {
      tenantId: data.company_id,
      userId,
      domain: 'crm',
      service: 'client-creation'
    });
  },

  async onboard(data: {
    company_id: string;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    industry?: string;
    billing_address?: string;
    gstin?: string;
    service_vertical?: string;
    sub_vertical?: string;
    template?: ProjectTemplate;
    userId?: string;
    userName?: string;
  }, correlationId: string = crypto.randomUUID()) {
    return transactionService.runInTransaction(correlationId, async (tx) => {
      // Conflict detection for duplicate clients
      const existingClient = await tx.client.findFirst({
        where: { company_id: data.company_id, name: data.name }
      });
      if (existingClient) {
        throw new DomainError('Duplicate client with the same name exists', ErrorCode.CONFLICT);
      }

      // 1. Create Client record
      const client = await tx.client.create({
        data: {
          id: crypto.randomUUID(),
          company_id: data.company_id,
          name: data.name,
          contact_person: data.contact_person,
          email: data.email,
          phone: data.phone,
          industry: data.industry,
          billing_address: data.billing_address,
          gstin: data.gstin,
          service_vertical: data.service_vertical || 'General Production',
          sub_vertical: data.sub_vertical || '',
        },
      });

      // 2. Generate Client Portal user in Supabase Auth
      let portalUserId: string | null = null;
      if (data.email) {
        try {
          const tempPassword = `PartnerPass${Math.floor(100000 + Math.random() * 900000)}!`;
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { role: 'CLIENT', full_name: data.contact_person || data.name }
          });

          if (authError) {
            console.error("Supabase Auth admin createUser failed:", authError);
            // Non-blocking in transaction if user already exists
          } else if (authUser?.user) {
            portalUserId = authUser.user.id;
            
            // Register Client Portal User profile in the public.User table
            const clientRole = await tx.role.findFirst({
              where: { name: 'CLIENT' }
            });

            await tx.user.upsert({
              where: { id: portalUserId },
              update: {
                company_id: data.company_id,
                role_id: clientRole?.id || 'CLIENT',
                fullName: data.contact_person || data.name,
                status: 'approved',
                onboarding_status: 'completed',
                department: 'Client'
              },
              create: {
                id: portalUserId,
                email: data.email,
                company_id: data.company_id,
                role_id: clientRole?.id || 'CLIENT',
                fullName: data.contact_person || data.name,
                status: 'approved',
                onboarding_status: 'completed',
                department: 'Client'
              }
            });
          }
        } catch (authErr) {
          console.error("Error creating portal auth user:", authErr);
        }
      }

      // 6. Create finance ledger (represented by default BankAccount and ActivityLog "Ledger Initialized")
      const bankAccountName = `${data.name} Ledger Account`;
      await tx.bankAccount.create({
        data: {
          id: crypto.randomUUID(),
          company_id: data.company_id,
          name: bankAccountName,
          type: 'Bank',
          balance: 0,
        }
      });

      // 7. Log audit activity events
      const logUser = data.userId || 'system';
      const logUserName = data.userName || 'AI Operating Layer';
      
      const logs = [
        { action: 'CLIENT_ONBOARDED', details: `Client "${data.name}" onboarded successfully.` },
        { action: 'PORTAL_ACCESS_CREATED', details: portalUserId ? 'Portal Access Created' : 'Portal Access Setup Skipped (no email)' },
        { action: 'FINANCE_LEDGER_INITIALIZED', details: 'Finance Ledger Initialized' }
      ];

      await tx.activityLog.createMany({
        data: logs.map(log => ({
          id: crypto.randomUUID(),
          company_id: data.company_id,
          user_id: logUser,
          user_name: logUserName,
          action: log.action,
          details: log.details,
        }))
      });

      // 8. Send onboarding notification
      await tx.notification.create({
        data: {
          id: crypto.randomUUID(),
          company_id: data.company_id,
          user_id: logUser,
          title: 'Client Onboarded',
          message: `Onboarding completed for "${data.name}". Finance ledger initialized.`,
          is_read: false,
        }
      });

      return {
        client,
        portalUserId
      };
    }, undefined, {
      tenantId: data.company_id,
      userId: data.userId,
      domain: 'crm',
      service: 'client-onboarding'
    });
  },

  async getById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        projects: true,
        invoices: true,
        prospects: true,
      },
    });
  },

  async getByCompany(company_id: string) {
    return prisma.client.findMany({
      where: { company_id },
      orderBy: { created_at: 'desc' },
    });
  },
};
