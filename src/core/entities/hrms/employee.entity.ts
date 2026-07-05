import { z } from 'zod';
import { BaseEntitySchema } from '../base.entity';

/**
 * HRMS: Employee Master Entity
 * Inherits BaseEntity to guarantee Tenant Isolation and Audit capability.
 */
export const EmployeeSchema = BaseEntitySchema.extend({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  
  // Organization Mapping
  department_id: z.string().optional(),
  team_id: z.string().optional(),
  designation_id: z.string().optional(),
  manager_id: z.string().optional(),
  
  // Lifecycle
  status: z.enum(['ONBOARDING', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']).default('ONBOARDING'),
  join_date: z.date().optional(),
  termination_date: z.date().optional(),
  
  // Compensation Stubs
  job_grade: z.string().optional(),
  payroll_group_id: z.string().optional(),
  
  // Intelligence Layer Metadata
  ai_health_score: z.number().min(0).max(100).optional(),
  ai_burnout_risk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

/**
 * HRMS: Leave Request Entity
 */
export const LeaveRequestSchema = BaseEntitySchema.extend({
  employee_id: z.string().uuid(),
  leave_type: z.enum(['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID']),
  start_date: z.date(),
  end_date: z.date(),
  reason: z.string().min(10),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).default('PENDING'),
  
  // Connected to Universal Engines
  approval_request_id: z.string().uuid().optional(),
  workflow_execution_id: z.string().uuid().optional(),
});

export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;

/**
 * HRMS: Attendance Record Entity
 */
export const AttendanceRecordSchema = BaseEntitySchema.extend({
  employee_id: z.string().uuid(),
  date: z.date(),
  check_in_time: z.date().optional(),
  check_out_time: z.date().optional(),
  location_gps: z.string().optional(), // For GPS Ready check-ins
  is_biometric: z.boolean().default(false),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'HOLIDAY']).default('PRESENT'),
  
  // Intelligence Metadata
  ai_anomaly_flag: z.boolean().default(false), // e.g. checked in from suspicious IP/GPS
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
