import { BaseEntity } from "../entities/base.entity";

export type PermissionAction = "read" | "create" | "update" | "delete" | "approve" | "export";

export interface UserContext {
  userId: string;
  tenantId: string;
  roles: string[];
  departmentIds?: string[];
  isSuperAdmin?: boolean;
}

export class PermissionEngine {
  /**
   * Universal check if a user has permission to perform an action on a specific resource type.
   */
  static can(user: UserContext, action: PermissionAction, resource: string): boolean {
    if (user.isSuperAdmin) return true;
    
    // In a real implementation, this would query the `sys_permissions` table
    // or evaluate against an in-memory RBAC matrix loaded for the tenant.
    
    return false; // Default deny
  }

  /**
   * ABAC (Attribute-Based Access Control) check against a specific record.
   * e.g., "User can edit Project IF User is the Owner OR User is in the same department."
   */
  static canAccessRecord(user: UserContext, action: PermissionAction, record: BaseEntity): boolean {
    if (user.isSuperAdmin) return true;
    if (user.tenantId !== record.tenant_id) return false; // Strict tenant boundary

    // Owner always has access (assuming action is permitted for owners)
    if (record.owner_id === user.userId) return true;

    // Additional logic for department-level access or specific ABAC rules would go here.

    return false;
  }
}
