import { z } from "zod";
import { BaseEntitySchema } from "./base.entity";

export const OrgUnitTypeEnum = z.enum([
  "COMPANY",
  "BUSINESS_UNIT",
  "REGION",
  "COUNTRY",
  "STATE",
  "CITY",
  "BRANCH",
  "DIVISION",
  "DEPARTMENT",
  "TEAM",
  "COST_CENTER",
  "PROFIT_CENTER"
]);

export const OrgUnitSchema = BaseEntitySchema.extend({
  type: OrgUnitTypeEnum,
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  parent_id: z.string().nullable().optional(), // For hierarchy
  head_id: z.string().nullable().optional(), // UUID of the User heading this unit
  location_id: z.string().nullable().optional(), // Links to MasterData or specialized location table
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).default({}),
});

export type OrgUnitType = z.infer<typeof OrgUnitTypeEnum>;
export type OrgUnitEntity = z.infer<typeof OrgUnitSchema>;
