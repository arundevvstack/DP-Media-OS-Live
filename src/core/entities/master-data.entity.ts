import { z } from "zod";
import { BaseEntitySchema } from "./base.entity";

export const MasterDataTypeEnum = z.enum([
  "JOB_GRADE",
  "CURRENCY",
  "TIMEZONE",
  "ASSET_CATEGORY",
  "VENDOR_CATEGORY",
  "EXPENSE_CATEGORY",
  "COMPETENCY",
  "APPROVAL_TEMPLATE",
  "CUSTOM_STATUS"
]);

export const MasterDataSchema = BaseEntitySchema.extend({
  type: MasterDataTypeEnum,
  code: z.string().min(1, "Code is required").toUpperCase(),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  parent_id: z.string().optional(), // For hierarchical master data
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  metadata: z.record(z.any()).default({}), // Dynamic properties depending on the type
});

export type MasterDataType = z.infer<typeof MasterDataTypeEnum>;
export type MasterDataEntity = z.infer<typeof MasterDataSchema>;
