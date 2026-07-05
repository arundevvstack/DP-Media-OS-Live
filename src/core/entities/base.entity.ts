import { z } from "zod";

export const BaseEntitySchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  tenant_id: z.string().min(1, "Tenant ID is required"),
  branch_id: z.string().optional(),
  owner_id: z.string().min(1, "Owner ID is required"),
  
  // Audit Fields
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable().optional(),
  created_by: z.string().min(1, "Creator ID is required"),
  updated_by: z.string().min(1, "Updater ID is required"),
  deleted_by: z.string().nullable().optional(),

  // Workflow & State
  status: z.string().default("DRAFT"),
  approval_state: z.string().optional(),

  // Extensibility
  tags: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({}),
  ai_metadata: z.record(z.any()).default({}),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
