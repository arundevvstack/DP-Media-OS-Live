import { z } from "zod";
import { BaseEntitySchema } from "../base.entity";

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["START", "END", "ACTION", "CONDITION", "DECISION", "APPROVAL", "LOOP", "DELAY", "PARALLEL", "MERGE", "NOTIFICATION", "AUTOMATION", "AI", "WEBHOOK", "SUB_WORKFLOW"]),
  name: z.string(),
  config: z.record(z.any()).default({}),
});

export const WorkflowTransitionSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(), // Expression evaluated by the engine
});

export const WorkflowTemplateSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  version: z.number().default(1),
  category: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  transitions: z.array(WorkflowTransitionSchema),
  is_active: z.boolean().default(false),
});

export const WorkflowExecutionSchema = BaseEntitySchema.extend({
  template_id: z.string().uuid(),
  entity_type: z.string(), // e.g., "hr_leaves", "ops_work_orders"
  entity_id: z.string(),
  current_node_id: z.string(),
  context: z.record(z.any()), // Variables and state
  started_at: z.date(),
  completed_at: z.date().nullable(),
  status: z.enum(["RUNNING", "PAUSED", "COMPLETED", "FAILED", "CANCELLED"]),
  error_details: z.string().optional(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;
export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
