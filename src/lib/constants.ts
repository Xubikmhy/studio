import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ListChecks, Users, FileText, CalendarClock, Megaphone, Landmark } from 'lucide-react';

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

export const DEFAULT_USER_IMAGE = "https://picsum.photos/100/100";

// Placeholder for user data - can be expanded for profile page
export const DEFAULT_USER_DATA = {
  name: "Guest User",
  email: "guest@gorkhalioffsetpress.com",
  avatar: DEFAULT_USER_IMAGE,
  team: TEAMS[0], // Example team
  role: "Employee", // Example role
  baseSalary: 50000, // Example base salary
};

export const EMPLOYEES_SAMPLE = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", team: TEAMS[1], role: "Designer", baseSalary: 60000 },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", team: TEAMS[2], role: "Printer Operator", baseSalary: 55000 },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", team: TEAMS[4], role: "Account Manager", baseSalary: 65000 },
  { id: "4", name: "Diana Prince", email: "diana@example.com", team: TEAMS[0], role: "Manager", baseSalary: 80000 },
];
