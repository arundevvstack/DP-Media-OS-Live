import { WorkflowTemplate, WorkflowExecution, WorkflowNode } from "../entities/engines/workflow.entity";
import { EventBus } from "./event.bus";

export class UniversalWorkflowEngine {
  
  /**
   * Starts a new workflow execution from a template
   */
  static async start(template: WorkflowTemplate, entityType: string, entityId: string, initialContext: any = {}): Promise<WorkflowExecution> {
    const startNode = template.nodes.find(n => n.type === "START");
    if (!startNode) throw new Error("WorkflowTemplate must have a START node");

    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      tenant_id: template.tenant_id,
      owner_id: template.owner_id,
      template_id: template.id,
      entity_type: entityType,
      entity_id: entityId,
      current_node_id: startNode.id,
      context: initialContext,
      status: "RUNNING",
      started_at: new Date(),
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "system",
      updated_by: "system",
      tags: [],
      labels: [],
      custom_fields: {},
      ai_metadata: {}
    };

    
    
    // In production, save to db
    // await db.collection("sys_workflow_executions").doc(execution.id).set(execution);

    // Fire Event
    await EventBus.publish({
      id: crypto.randomUUID(),
      tenant_id: execution.tenant_id,
      topic: "workflow.started",
      payload: { execution_id: execution.id, template_id: template.id },
      source: "WorkflowEngine",
      created_at: new Date()
    });

    // Immediately try to process the first step
    await this.processNext(execution, template);

    return execution;
  }

  /**
   * Processes the current node and transitions to the next if applicable
   */
  static async processNext(execution: WorkflowExecution, template: WorkflowTemplate) {
    if (execution.status !== "RUNNING") return;

    const currentNode = template.nodes.find(n => n.id === execution.current_node_id);
    if (!currentNode) {
      execution.status = "FAILED";
      execution.error_details = "Current node not found in template";
      return;
    }

    // Step 1: Execute Node Logic based on Type
    try {
      await this.executeNodeLogic(currentNode, execution);
    } catch (error: any) {
      execution.status = "FAILED";
      execution.error_details = error.message;
      return;
    }

    // If node is an Approval or Delay, the workflow pauses until external input
    if (["APPROVAL", "DELAY", "DECISION"].includes(currentNode.type)) {
      execution.status = "PAUSED";
      return; // Execution stops here until resumed externally
    }

    if (currentNode.type === "END") {
      execution.status = "COMPLETED";
      execution.completed_at = new Date();
      await EventBus.publish({
        id: crypto.randomUUID(),
        tenant_id: execution.tenant_id,
        topic: "workflow.completed",
        payload: { execution_id: execution.id },
        source: "WorkflowEngine",
        created_at: new Date()
      });
      return;
    }

    // Step 2: Find Next Node
    const transition = template.transitions.find(t => t.source === currentNode.id);
    if (transition) {
      execution.current_node_id = transition.target;
      execution.updated_at = new Date();
      // Recursively process next
      await this.processNext(execution, template);
    } else {
      // Dead end without END node
      execution.status = "FAILED";
      execution.error_details = "No valid transition found from current node";
    }
  }

  private static async executeNodeLogic(node: WorkflowNode, execution: WorkflowExecution) {
    

    switch (node.type) {
      case "ACTION":
        // e.g. update record status
        break;
      case "NOTIFICATION":
        // Fire notification event
        break;
      case "AUTOMATION":
        // Trigger webhook or internal function
        break;
      case "AI":
        // Call AI processing layer
        break;
    }
  }

  /**
   * Resumes a paused workflow (e.g., after an Approval is granted)
   */
  static async resume(executionId: string, payload: any) {
    
    // Load execution & template, update context with payload, set status to RUNNING
    // Find transition and processNext()
  }
}
