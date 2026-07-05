import { z } from "zod";

export const EventSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string(),
  topic: z.string(), // e.g., "project.created", "invoice.paid"
  payload: z.record(z.any()), // The actual event data
  source: z.string(), // Which service fired this
  created_at: z.date(),
  idempotency_key: z.string().optional(),
});

export type DomainEvent = z.infer<typeof EventSchema>;
