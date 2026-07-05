import { z } from 'zod';
import { FormFieldSchema } from '../entities/platform/form.schema';
import { ColumnDefinitionSchema, DashboardWidgetConfigSchema } from '../entities/platform/layout.schema';
import { BusinessRuleSchema } from '../engines/platform/rules.engine';

export const ModuleEntitySchema = z.object({
  name: z.string(), // e.g. "WorkOrder"
  collectionName: z.string(), // e.g. "ops_work_orders"
  fields: z.array(FormFieldSchema),
  
  // What Universal Engines to attach automatically
  enableAudit: z.boolean().default(true),
  enableTimeline: z.boolean().default(true),
  enableComments: z.boolean().default(true),
  enableApproval: z.boolean().default(false),
});

export const ModuleDefinitionSchema = z.object({
  id: z.string(), // e.g. "facilities"
  title: z.string(), // e.g. "Facilities Management"
  description: z.string().optional(),
  icon: z.string().default('Box'),
  
  // Data Layer
  entities: z.array(ModuleEntitySchema),
  
  // Logic Layer
  rules: z.array(BusinessRuleSchema).optional(),
  
  // View Layer
  listViews: z.array(z.object({
    entity: z.string(),
    columns: z.array(ColumnDefinitionSchema)
  })).optional(),
  
  dashboardWidgets: z.array(DashboardWidgetConfigSchema).optional(),
  
  // Route Prefix (e.g. /dashboard/facilities)
  routePrefix: z.string(),
});

export type ModuleDefinition = z.infer<typeof ModuleDefinitionSchema>;
