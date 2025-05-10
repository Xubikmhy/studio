import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ListChecks, Users, FileText, CalendarClock, Megaphone, Landmark, AlertTriangle } from 'lucide-react';
import type { EmployeeProfile, Task, AttendanceRecord, NavItem, Team, UserRole, TaskStatus, TaskPriority } from './types';
import { TEAMS_CONST, TASK_STATUSES_CONST, TASK_PRIORITIES_CONST } from './types';

export const APP_NAME = "Gorkhali Offset Press";

// Re-export from types.ts or define here if preferred
export const TEAMS = TEAMS_CONST;
export const TASK_STATUSES = TASK_STATUSES_CONST;
export const TASK_PRIORITIES = TASK_PRIORITIES_CONST;


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

// Base data for initializing the data store
export const INITIAL_EMPLOYEES_BASE: Omit<EmployeeProfile, 'avatar' | 'role'>[] = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", team: TEAMS[1], roleInternal: "Designer", baseSalary: 60000 },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", team: TEAMS[2], roleInternal: "Printer Operator", baseSalary: 55000 },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", team: TEAMS[4], roleInternal: "Account Manager", baseSalary: 65000 },
  { id: "4", name: "Diana Prince", email: "diana@example.com", team: TEAMS[0], roleInternal: "Manager", baseSalary: 80000 },
];

export const INITIAL_EMPLOYEES: EmployeeProfile[] = INITIAL_EMPLOYEES_BASE.map(emp => ({
  ...emp,
  avatar: `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/100/100`,
  role: emp.id === "4" ? 'admin' : 'employee', // Diana (id 4) is admin
}));


export const EMPLOYEE_USER_DATA: EmployeeProfile = INITIAL_EMPLOYEES.find(emp => emp.id === '1')!; // Alice
export const ADMIN_USER_DATA: EmployeeProfile = INITIAL_EMPLOYEES.find(emp => emp.id === '4')!; // Diana

// *** SIMULATED CURRENT USER: Change this to ADMIN_USER_DATA to test admin view ***
// export const CURRENT_USER_DATA: EmployeeProfile = EMPLOYEE_USER_DATA;
export const CURRENT_USER_DATA: EmployeeProfile = ADMIN_USER_DATA;


// Placeholder Initial Attendance Data
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: "att1", employeeId: INITIAL_EMPLOYEES[0].id, employeeName: INITIAL_EMPLOYEES[0].name, date: "2024-07-28", checkIn: "09:03 AM", checkOut: "05:32 PM", totalHours: "8h 29m" },
  { id: "att2", employeeId: INITIAL_EMPLOYEES[0].id, employeeName: INITIAL_EMPLOYEES[0].name, date: "2024-07-27", checkIn: "08:58 AM", checkOut: "06:05 PM", totalHours: "9h 07m" },
  { id: "att3", employeeId: INITIAL_EMPLOYEES[1].id, employeeName: INITIAL_EMPLOYEES[1].name, date: "2024-07-28", checkIn: "09:15 AM", checkOut: "05:00 PM", totalHours: "7h 45m" },
  { id: "att4", employeeId: INITIAL_EMPLOYEES[3].id, employeeName: INITIAL_EMPLOYEES[3].name, date: "2024-07-28", checkIn: "08:45 AM", checkOut: "05:50 PM", totalHours: "9h 05m" },
];

// Placeholder Initial Task Data
export const INITIAL_TASKS: Task[] = [
  { id: "1", name: "Design new brochure", description: "Create a new trifold brochure for the upcoming marketing campaign.", status: "Ongoing", team: "Computer Team", assignedTo: INITIAL_EMPLOYEES[0].name, priority: "Normal" },
  { id: "2", name: "Print 1000 flyers", description: "Print 1000 A5 flyers for 'Summer Sale'.", status: "Finished", team: "Printing Team", assignedTo: INITIAL_EMPLOYEES[1].name, priority: "Normal" },
  { id: "3", name: "Client meeting for new campaign", description: "Discuss requirements for the Q4 campaign with XYZ Corp.", status: "Finished", team: "Marketing & Accounts Team", assignedTo: INITIAL_EMPLOYEES[2].name, priority: "Normal" },
  { id: "4", name: "Update website homepage content", description: "Revamp the hero section and add new testimonials.", status: "Ongoing", team: "Computer Team", assignedTo: INITIAL_EMPLOYEES[0].name, priority: "Urgent" },
  { id: "5", name: "Fix binding machine (Model X123)", description: "The machine is jamming on thicker paper stock.", status: "To Do", team: "Binding Team", assignedTo: "David Lee", priority: "Urgent" }, // Unassigned to current sample, admin sees
  { id: "6", name: "Prepare monthly financial report", description: "Compile and review financial statements for July.", status: "Blocked", team: "Management Team", assignedTo: INITIAL_EMPLOYEES[3].name, priority: "Normal" },
  { id: "7", name: "Schedule Q4 planning meeting", description: "Coordinate with department heads for the quarterly planning session.", status: "To Do", team: "Management Team", assignedTo: INITIAL_EMPLOYEES[3].name, priority: "Normal" },
];

export const UrgentTaskIcon = AlertTriangle;