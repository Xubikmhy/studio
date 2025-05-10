import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ListChecks, Users, FileText, CalendarClock, Megaphone, Landmark, AlertTriangle } from 'lucide-react';

export const APP_NAME = "Gorkhali Offset Press";

export const TEAMS = [
  "Management Team",
  "Computer Team",
  "Printing Team",
  "Binding Team",
  "Marketing & Accounts Team",
] as const;

export type Team = typeof TEAMS[number];

export const TASK_STATUSES = ["To Do", "Ongoing", "Blocked", "Finished"] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_PRIORITIES = ["Normal", "Urgent"] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export type UserRole = 'admin' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  team: Team;
  role: UserRole;
  baseSalary: number;
  roleInternal?: string; // Added for consistency with EMPLOYEES_SAMPLE
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/attendance", label: "Attendance", icon: CalendarClock },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  // Admin Section
  { href: "/admin/employees", label: "Employees", icon: Users, adminOnly: true },
  { href: "/admin/finance", label: "Finance", icon: Landmark, adminOnly: true },
  { href: "/admin/reports", label: "Reports", icon: FileText, adminOnly: true },
];

export const EMPLOYEES_SAMPLE_BASE = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", team: TEAMS[1], roleInternal: "Designer", baseSalary: 60000 },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", team: TEAMS[2], roleInternal: "Printer Operator", baseSalary: 55000 },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", team: TEAMS[4], roleInternal: "Account Manager", baseSalary: 65000 },
  { id: "4", name: "Diana Prince", email: "diana@example.com", team: TEAMS[0], roleInternal: "Manager", baseSalary: 80000 },
];

export const EMPLOYEES_SAMPLE = EMPLOYEES_SAMPLE_BASE.map(emp => ({
  ...emp,
  avatar: `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/100/100`,
  role: emp.roleInternal, // Keep original role field for display in employee list
}));


export const EMPLOYEE_USER_DATA: UserProfile = {
  id: EMPLOYEES_SAMPLE[0].id,
  name: EMPLOYEES_SAMPLE[0].name,
  email: EMPLOYEES_SAMPLE[0].email,
  avatar: EMPLOYEES_SAMPLE[0].avatar,
  team: EMPLOYEES_SAMPLE[0].team,
  role: 'employee', // App role
  baseSalary: EMPLOYEES_SAMPLE[0].baseSalary,
  roleInternal: EMPLOYEES_SAMPLE[0].roleInternal,
};

export const ADMIN_USER_DATA: UserProfile = {
  id: EMPLOYEES_SAMPLE[3].id,
  name: EMPLOYEES_SAMPLE[3].name,
  email: EMPLOYEES_SAMPLE[3].email,
  avatar: EMPLOYEES_SAMPLE[3].avatar,
  team: EMPLOYEES_SAMPLE[3].team,
  role: 'admin', // App role
  baseSalary: EMPLOYEES_SAMPLE[3].baseSalary,
  roleInternal: EMPLOYEES_SAMPLE[3].roleInternal,
};

// *** SIMULATED CURRENT USER: Change this to ADMIN_USER_DATA to test admin view ***
export const CURRENT_USER_DATA: UserProfile = EMPLOYEE_USER_DATA;
// export const CURRENT_USER_DATA: UserProfile = ADMIN_USER_DATA;


// Placeholder Attendance Data - now with employeeId and employeeName
export const ALL_ATTENDANCE_RECORDS = [
  { id: "att1", employeeId: EMPLOYEES_SAMPLE[0].id, employeeName: EMPLOYEES_SAMPLE[0].name, date: "2024-07-28", checkIn: "09:03 AM", checkOut: "05:32 PM", totalHours: "8h 29m" },
  { id: "att2", employeeId: EMPLOYEES_SAMPLE[0].id, employeeName: EMPLOYEES_SAMPLE[0].name, date: "2024-07-27", checkIn: "08:58 AM", checkOut: "06:05 PM", totalHours: "9h 07m" },
  { id: "att3", employeeId: EMPLOYEES_SAMPLE[1].id, employeeName: EMPLOYEES_SAMPLE[1].name, date: "2024-07-28", checkIn: "09:15 AM", checkOut: "05:00 PM", totalHours: "7h 45m" },
  { id: "att4", employeeId: EMPLOYEES_SAMPLE[3].id, employeeName: EMPLOYEES_SAMPLE[3].name, date: "2024-07-28", checkIn: "08:45 AM", checkOut: "05:50 PM", totalHours: "9h 05m" },
];

// Placeholder Task Data
export const ALL_TASKS: Array<{ id: string; name: string; status: TaskStatus; team: Team; assignedTo: string; priority: TaskPriority }> = [
  { id: "1", name: "Design new brochure", status: "Ongoing", team: "Computer Team", assignedTo: EMPLOYEES_SAMPLE[0].name, priority: "Normal" }, // Alice
  { id: "2", name: "Print 1000 flyers", status: "Finished", team: "Printing Team", assignedTo: EMPLOYEES_SAMPLE[1].name, priority: "Normal" }, // Bob
  { id: "3", name: "Client meeting for new campaign", status: "Finished", team: "Marketing & Accounts Team", assignedTo: EMPLOYEES_SAMPLE[2].name, priority: "Normal" }, // Charlie
  { id: "4", name: "Update website homepage content", status: "Ongoing", team: "Computer Team", assignedTo: EMPLOYEES_SAMPLE[0].name, priority: "Urgent" }, // Alice
  { id: "5", name: "Fix binding machine (Model X123)", status: "To Do", team: "Binding Team", assignedTo: "David Lee", priority: "Urgent" }, // Unassigned to current sample, admin sees
  { id: "6", name: "Prepare monthly financial report", status: "Blocked", team: "Management Team", assignedTo: EMPLOYEES_SAMPLE[3].name, priority: "Normal" }, // Diana
  { id: "7", name: "Schedule Q4 planning meeting", status: "To Do", team: "Management Team", assignedTo: EMPLOYEES_SAMPLE[3].name, priority: "Normal" }, // Diana
];

// Urgent Task Icon (example, can be customized)
export const UrgentTaskIcon = AlertTriangle;
