import { z } from 'zod';

// --- SCHEMA DEFINITIONS ---

export const RuleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN', 'IS_NULL', 'IS_NOT_NULL']),
  value: z.any(),
});

export type RuleCondition = z.infer<typeof RuleConditionSchema>;

export const RuleActionSchema = z.object({
  type: z.enum(['SET_FIELD', 'TRIGGER_WORKFLOW', 'SEND_NOTIFICATION', 'ASSIGN_USER', 'REQUIRE_APPROVAL']),
  target: z.string(),
  payload: z.any().optional(),
});

export type RuleAction = z.infer<typeof RuleActionSchema>;

export const BusinessRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  entity_type: z.string(), // e.g., 'WorkOrder', 'Invoice'
  conditions: z.array(RuleConditionSchema),
  condition_logic: z.enum(['AND', 'OR']).default('AND'),
  actions: z.array(RuleActionSchema),
  is_active: z.boolean().default(true),
  priority: z.number().default(0),
});

export type BusinessRule = z.infer<typeof BusinessRuleSchema>;

// --- ENGINE IMPLEMENTATION ---

export class BusinessRulesEngine {
  
  /**
   * Evaluates a single condition against a provided context (record).
   */
  private static evaluateCondition(condition: RuleCondition, context: Record<string, any>): boolean {
    const contextValue = context[condition.field];

    switch (condition.operator) {
      case 'EQUALS': return contextValue === condition.value;
      case 'NOT_EQUALS': return contextValue !== condition.value;
      case 'GREATER_THAN': return contextValue > condition.value;
      case 'LESS_THAN': return contextValue < condition.value;
      case 'CONTAINS': return String(contextValue).includes(String(condition.value));
      case 'IN': return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'IS_NULL': return contextValue === null || contextValue === undefined;
      case 'IS_NOT_NULL': return contextValue !== null && contextValue !== undefined;
      default: return false;
    }
  }

  /**
   * Evaluates a full rule against a context.
   */
  public static evaluateRule(rule: BusinessRule, context: Record<string, any>): boolean {
    if (!rule.is_active || rule.conditions.length === 0) return false;

    if (rule.condition_logic === 'AND') {
      return rule.conditions.every(cond => this.evaluateCondition(cond, context));
    } else {
      return rule.conditions.some(cond => this.evaluateCondition(cond, context));
    }
  }

  /**
   * Executes a set of rules against an entity and returns the actions that must be triggered.
   * This is called by BaseService during create/update operations.
   */
  public static processRules(rules: BusinessRule[], context: Record<string, any>): RuleAction[] {
    const triggeredActions: RuleAction[] = [];
    
    // Sort by priority (higher first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.evaluateRule(rule, context)) {
        triggeredActions.push(...rule.actions);
      }
    }

    return triggeredActions;
  }
}
