import { z } from 'zod';
import { BaseEntitySchema } from '../base.entity';
import { RuleConditionSchema } from '../../engines/platform/rules.engine';

export const FormFieldTypeSchema = z.enum([
  'TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 
  'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 
  'FILE_UPLOAD', 'RICH_TEXT', 'SIGNATURE', 'AI_GENERATED',
  'FORMULA'
]);

export const FormFieldSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // The key used in the data payload (e.g., 'invoice_amount')
  label: z.string(), // UI Label
  type: FormFieldTypeSchema,
  
  // Validation
  required: z.boolean().default(false),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
  
  // Configuration
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  placeholder: z.string().optional(),
  default_value: z.any().optional(),
  formula: z.string().optional(), // For calculated fields
  
  // Visibility & State (Powered by BusinessRulesEngine logic)
  visible_if: z.array(RuleConditionSchema).optional(),
  disabled_if: z.array(RuleConditionSchema).optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

export const FormSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  columns: z.number().min(1).max(4).default(1),
});

export type FormSection = z.infer<typeof FormSectionSchema>;

export const DynamicFormSchema = BaseEntitySchema.extend({
  title: z.string(),
  description: z.string().optional(),
  target_entity_type: z.string(), // What database table does this save to?
  
  sections: z.array(FormSectionSchema),
  
  // Layout Options
  layout: z.enum(['STANDARD', 'TABS', 'WIZARD']).default('STANDARD'),
  
  // Platform capabilities
  is_published: z.boolean().default(false),
  version: z.number().default(1),
});

export type DynamicForm = z.infer<typeof DynamicFormSchema>;
