import type { LucideIcon } from 'lucide-react';

export const TEAMS_CONST = [
  "Management Team",
  "Computer Team",
  "Printing Team",
  "Binding Team",
  "Marketing & Accounts Team",
] as const;

export type Team = typeof TEAMS_CONST[number];

export const TASK_STATUSES_CONST = ["To Do", "Ongoing", "Blocked", "Finished"] as const;
export type TaskStatus = typeof TASK_STATUSES_CONST[number];

export const TASK_PRIORITIES_CONST = ["Normal", "Urgent"] as const;
export type TaskPriority = typeof TASK_PRIORITIES_CONST[number];

export type UserRole = 'admin' | 'employee';

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  team: Team;
  role: UserRole; // App-level role (admin/employee)
  roleInternal: string; // Job title like "Designer", "Manager"
  baseSalary: number;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  team: Team;
  assignedTo: string; // Employee name for simplicity, could be employeeId
  priority: TaskPriority;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:MM AM/PM
  checkOut: string | null; // HH:MM AM/PM
  totalHours: string | null; // e.g., "8h 30m"
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

// Placeholder for Finance types if needed later
export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  advanceDate: string; // YYYY-MM-DD
  reason?: string;
  status: "Pending" | "Approved" | "Repaid" | "Partially Repaid" | "Rejected";
}