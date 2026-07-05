import { z } from 'zod';
import { BaseEntitySchema } from '../base.entity';

/**
 * Media Operations: Production Project (Overrides Legacy Project)
 */
export const ProductionProjectSchema = BaseEntitySchema.extend({
  title: z.string().min(2),
  client_id: z.string().uuid(),
  
  status: z.enum(['PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'REVIEW', 'DELIVERED', 'ARCHIVED']).default('PRE_PRODUCTION'),
  
  budget: z.number().default(0),
  
  // Intelligence Meta
  ai_delay_probability: z.number().min(0).max(100).optional(),
});

export type ProductionProject = z.infer<typeof ProductionProjectSchema>;

/**
 * Media Operations: Creative Script / Brief
 */
export const ScriptSchema = BaseEntitySchema.extend({
  project_id: z.string().uuid(),
  title: z.string().min(2),
  content_markdown: z.string(),
  version: z.number().default(1),
  
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'LOCKED']).default('DRAFT'),
  
  // Link to Approval Engine
  approval_request_id: z.string().uuid().optional(),
});

export type Script = z.infer<typeof ScriptSchema>;

/**
 * Media Operations: Shoot Schedule / Call Sheet
 */
export const CallSheetSchema = BaseEntitySchema.extend({
  project_id: z.string().uuid(),
  shoot_date: z.date(),
  location_name: z.string(),
  location_gps: z.string().optional(),
  
  call_time: z.date(),
  wrap_time: z.date().optional(),
  
  status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
});

export type CallSheet = z.infer<typeof CallSheetSchema>;
