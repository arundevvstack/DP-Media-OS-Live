import { z } from 'zod';
import { BaseEntitySchema } from '../base.entity';

/**
 * Operations: Work Order Entity
 */
export const WorkOrderSchema = BaseEntitySchema.extend({
  title: z.string().min(3),
  description: z.string().optional(),
  department_id: z.string().uuid(),
  assignee_id: z.string().uuid().optional(),
  
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  
  target_start_date: z.date().optional(),
  target_end_date: z.date().optional(),
  
  // Link to Universal Workflow
  workflow_execution_id: z.string().uuid().optional(),
  
  // Intelligence Meta
  ai_risk_score: z.number().min(0).max(100).optional(),
});

export type WorkOrder = z.infer<typeof WorkOrderSchema>;

/**
 * Operations: Asset / Equipment Entity
 */
export const AssetSchema = BaseEntitySchema.extend({
  name: z.string().min(2),
  asset_tag: z.string(),
  category: z.enum(['IT_EQUIPMENT', 'STUDIO_GEAR', 'VEHICLE', 'FURNITURE', 'OTHER']),
  
  purchase_date: z.date().optional(),
  purchase_cost: z.number().optional(),
  
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST']).default('AVAILABLE'),
  
  assigned_to_user_id: z.string().uuid().optional(),
  assigned_to_project_id: z.string().uuid().optional(),
  
  location_id: z.string().uuid().optional(),
  
  // Maintenance triggers
  next_maintenance_date: z.date().optional(),
});

export type Asset = z.infer<typeof AssetSchema>;
