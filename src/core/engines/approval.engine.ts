import { ApprovalRequest, ApprovalPolicy } from "../entities/engines/approval.entity";
import { EventBus } from "./event.bus";

export class UniversalApprovalEngine {
  
  static async requestApproval(policy: ApprovalPolicy, entityType: string, entityId: string, contextPayload: any) {
    

    // Based on the policy (Sequential, Parallel), generate the requests
    // For Sequential, generate the first request. For Parallel, generate all requests.

    // Example Parallel Generation:
    const requests: ApprovalRequest[] = policy.rules.map(rule => {
      return {
        id: crypto.randomUUID(),
        tenant_id: policy.tenant_id,
        owner_id: policy.owner_id,
        entity_type: entityType,
        entity_id: entityId,
        policy_id: policy.id,
        approver_id: rule.user_id || "DYNAMIC_RESOLUTION", // Usually resolved via Role/Dept
        status: "PENDING",
        responded_at: null,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: "system",
        updated_by: "system",
        tags: [],
        labels: [],
        custom_fields: {},
        ai_metadata: {}
      } as ApprovalRequest; // Cast to bypass strict BaseEntity fields missing in this mock
    });

    // Fire events for Notifications
    for (const req of requests) {
      await EventBus.publish({
        id: crypto.randomUUID(),
        tenant_id: policy.tenant_id,
        topic: "approval.requested",
        payload: { approval_id: req.id, approver_id: req.approver_id, entity_type: entityType, entity_id: entityId },
        source: "ApprovalEngine",
        created_at: new Date()
      });
    }

    return requests;
  }

  static async processResponse(requestId: string, responderId: string, status: "APPROVED" | "REJECTED", comments?: string) {
    

    // Fire Event
    await EventBus.publish({
      id: crypto.randomUUID(),
      tenant_id: "tenant", // Fetch from DB
      topic: status === "APPROVED" ? "approval.approved" : "approval.rejected",
      payload: { approval_id: requestId, responder_id: responderId, comments },
      source: "ApprovalEngine",
      created_at: new Date()
    });

    // If part of a Workflow, the WorkflowEngine will be listening to "approval.approved" to resume the execution.
  }
}
