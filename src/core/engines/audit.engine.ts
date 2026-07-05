import { BaseEntity } from "../entities/base.entity";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "APPROVE" | "REJECT";

export interface AuditContext {
  userId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditEngine {
  /**
   * Logs an action performed on any entity.
   */
  static async logAction(
    action: AuditAction,
    entityType: string,
    entityId: string,
    context: AuditContext,
    diff?: { before?: Partial<BaseEntity>; after?: Partial<BaseEntity> },
    reason?: string
  ) {
    const auditRecord = {
      id: crypto.randomUUID(),
      tenant_id: context.tenantId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      user_id: context.userId,
      diff: diff || {},
      reason,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      created_at: new Date(),
    };

    // In a real implementation, write this to Firestore collection `sys_audit_logs`
    
    
    // Example: await db.collection("sys_audit_logs").add(auditRecord);
    return auditRecord;
  }
}
