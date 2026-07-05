import { z } from "zod";
import { BaseEntitySchema } from "../base.entity";

export const CommentSchema = BaseEntitySchema.extend({
  entity_type: z.string(), // The object being commented on
  entity_id: z.string(),
  parent_id: z.string().optional(), // For threaded replies
  content: z.string().min(1),
  is_internal: z.boolean().default(false), // Private note vs public comment
  attachments: z.array(z.string()).default([]), // Document IDs
  mentions: z.array(z.string()).default([]), // User IDs mentioned
  reactions: z.record(z.array(z.string())).default({}), // e.g., { "thumbs_up": ["user1", "user2"] }
});

export type Comment = z.infer<typeof CommentSchema>;
