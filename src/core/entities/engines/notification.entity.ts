import { z } from "zod";
import { BaseEntitySchema } from "../base.entity";

export const NotificationSchema = BaseEntitySchema.extend({
  user_id: z.string(), // Recipient
  title: z.string(),
  body: z.string(),
  channels: z.array(z.enum(["IN_APP", "EMAIL", "SMS", "WHATSAPP", "SLACK", "TEAMS", "PUSH"])),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  action_url: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  read_at: z.date().nullable(),
  delivery_status: z.record(z.enum(["PENDING", "SENT", "FAILED", "DELIVERED"])),
});

export const NotificationPreferenceSchema = BaseEntitySchema.extend({
  user_id: z.string(),
  muted_channels: z.array(z.string()),
  digest_mode: z.boolean().default(false),
  digest_frequency: z.enum(["DAILY", "WEEKLY"]).optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
