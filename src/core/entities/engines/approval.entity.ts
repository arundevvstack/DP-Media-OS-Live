import { z } from "zod";
import { BaseEntitySchema } from "../base.entity";

export const ApprovalPolicySchema = BaseEntitySchema.extend({
  entity_type: z.string(),
  name: z.string(),
  rules: z.array(z.object({
    role_id: z.string().optional(),
    department_id: z.string().optional(),
    user_id: z.string().optional(),
    condition: z.string().optional(), // Evaluated condition (e.g., "amount > 1000")
  })),
  type: z.enum(["SEQUENTIAL", "PARALLEL", "CONDITIONAL"]),
  is_active: z.boolean().default(true),
});

export const ApprovalRequestSchema = BaseEntitySchema.extend({
  entity_type: z.string(),
  entity_id: z.string(),
  workflow_execution_id: z.string().optional(),
  policy_id: z.string().optional(),
  approver_id: z.string(), // Who is requested to approve
  proxy_approver_id: z.string().optional(), // If delegated
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "ESCALATED", "CANCELLED"]),
  comments: z.string().optional(),
  responded_at: z.date().nullable(),
  deadline: z.date().optional(),
});

export type ApprovalPolicy = z.infer<typeof ApprovalPolicySchema>;
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
