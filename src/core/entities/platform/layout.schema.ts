import { z } from 'zod';
import { BaseEntitySchema } from '../base.entity';
import { RuleConditionSchema } from '../../engines/platform/rules.engine';

// --- DYNAMIC LAYOUT ENGINE ---

export const ColumnDefinitionSchema = z.object({
  field: z.string(),
  label: z.string(),
  sortable: z.boolean().default(true),
  filterable: z.boolean().default(true),
  width: z.string().optional(), // e.g., '200px' or 'flex-1'
  format: z.enum(['TEXT', 'CURRENCY', 'DATE', 'DATETIME', 'BADGE', 'AVATAR', 'PROGRESS']).default('TEXT'),
});

export const DynamicViewSchema = BaseEntitySchema.extend({
  name: z.string(),
  entity_type: z.string(), // e.g., 'hrms_employees'
  
  view_type: z.enum(['TABLE', 'KANBAN', 'CALENDAR', 'TIMELINE', 'GRID', 'TREE']).default('TABLE'),
  
  // Table Configuration
  columns: z.array(ColumnDefinitionSchema).optional(),
  
  // Kanban Configuration
  group_by_field: z.string().optional(),
  
  // Universal Filters mapped to BusinessRules Engine
  default_filters: z.array(RuleConditionSchema).optional(),
  
  is_default: z.boolean().default(false),
  role_access: z.array(z.string()).optional(), // Which roles can see this view?
});

export type DynamicView = z.infer<typeof DynamicViewSchema>;

// --- DASHBOARD BUILDER ENGINE ---

export const WidgetTypeSchema = z.enum([
  'KPI_CARD', 'BAR_CHART', 'LINE_CHART', 'PIE_CHART', 
  'DATA_TABLE', 'ACTIVITY_FEED', 'HEATMAP'
]);

export const DashboardWidgetConfigSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: WidgetTypeSchema,
  
  // Data Source Binding
  source_entity: z.string(),
  aggregation_type: z.enum(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']).optional(),
  aggregation_field: z.string().optional(),
  
  // Grid Placement (x, y, w, h)
  layout_x: z.number().default(0),
  layout_y: z.number().default(0),
  layout_w: z.number().default(1),
  layout_h: z.number().default(1),
  
  filters: z.array(RuleConditionSchema).optional(),
});

export const DashboardSchema = BaseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
  
  widgets: z.array(DashboardWidgetConfigSchema),
  
  role_access: z.array(z.string()).optional(),
  is_personal: z.boolean().default(false), // Personal dashboard vs Corporate dashboard
});

export type Dashboard = z.infer<typeof DashboardSchema>;
