'use server';

import type { EmployeeProfile, Task, AttendanceRecord, TaskStatus, Team, UserRole } from '@/lib/types'; // Assuming types are in a central place
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_ATTENDANCE_RECORDS } from '@/lib/constants'; // Using renamed initial data

// --- In-memory "database" ---
let dbEmployees: EmployeeProfile[] = INITIAL_EMPLOYEES.map(emp => ({
    ...emp,
    // Ensure avatar and consistent role field for newly added employees as well
    avatar: emp.avatar || `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/100/100`,
    role: emp.role || (emp.id === '4' ? 'admin' : 'employee') as UserRole, // Example logic for role based on initial data
    roleInternal: emp.roleInternal || emp.role,
}));

let dbTasks: Task[] = [...INITIAL_TASKS];
let dbAttendance: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];

// --- Employee Store Functions ---
export async function getEmployeesFromStore(): Promise<EmployeeProfile[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbEmployees)); // Return a copy to prevent direct mutation
}

export async function addEmployeeToStore(employeeData: Omit<EmployeeProfile, 'id' | 'avatar' | 'role'> & { roleInternal: string }): Promise<EmployeeProfile> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newEmployee: EmployeeProfile = {
    id: String(Date.now()), // Simple ID generation
    ...employeeData,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(employeeData.name)}/100/100`,
    // Determine app role based on some logic, e.g., if roleInternal is 'Manager' or similar
    // For simplicity, new employees are 'employee'. Could be enhanced.
    role: employeeData.team === "Management Team" ? 'admin' : 'employee', 
    roleInternal: employeeData.roleInternal, // This now comes from the form
  };
  dbEmployees.push(newEmployee);
  return JSON.parse(JSON.stringify(newEmployee));
}

// --- Task Store Functions ---
export async function getTasksFromStore(): Promise<Task[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbTasks));
}

export async function getTasksForUserFromStore(userName: string): Promise<Task[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbTasks.filter(task => task.assignedTo === userName)));
}

export async function addTaskToStore(taskData: Omit<Task, 'id'>): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newTask: Task = {
    id: String(Date.now()), // Simple ID generation
    ...taskData,
  };
  dbTasks.push(newTask);
  return JSON.parse(JSON.stringify(newTask));
}

// --- Attendance Store Functions ---
export async function getAttendanceRecordsFromStore(): Promise<AttendanceRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbAttendance));
}

export async function getAttendanceRecordsForUserFromStore(employeeId: string): Promise<AttendanceRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbAttendance.filter(record => record.employeeId === employeeId)));
}

export async function addOrUpdateAttendanceRecordStore(
  employeeId: string,
  employeeName: string,
  type: 'punch-in' | 'punch-out'
): Promise<AttendanceRecord | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  let record = dbAttendance.find(r => r.employeeId === employeeId && r.date === today && !r.checkOut);

  if (type === 'punch-in') {
    if (record) { // Already punched in today and not punched out
      return null; // Or handle as an error/warning
    }
    const newRecord: AttendanceRecord = {
      id: String(Date.now()),
      employeeId,
      employeeName,
      date: today,
      checkIn: currentTime,
      checkOut: null,
      totalHours: null,
    };
    dbAttendance.push(newRecord);
    return JSON.parse(JSON.stringify(newRecord));
  } else { // punch-out
    if (!record || !record.checkIn) { // Not punched in or record invalid
      return null; // Or handle as an error/warning
    }
    record.checkOut = currentTime;
    
    // Calculate total hours
    const checkInTime = new Date(`${today} ${record.checkIn}`);
    const checkOutTime = new Date(`${today} ${record.checkOut}`);
    if (!isNaN(checkInTime.getTime()) && !isNaN(checkOutTime.getTime())) {
        let diffMs = checkOutTime.getTime() - checkInTime.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle overnight if necessary, though less likely for this app

        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        record.totalHours = `${diffHrs}h ${diffMins}m`;
    } else {
        record.totalHours = "Error";
    }
    // Update the record in dbAttendance
    dbAttendance = dbAttendance.map(r => r.id === record!.id ? record! : r);
    return JSON.parse(JSON.stringify(record));
  }
}

export async function getTodaysAttendanceForUserFromStore(employeeId: string): Promise<AttendanceRecord | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const today = new Date().toISOString().split('T')[0];
    const record = dbAttendance.find(r => r.employeeId === employeeId && r.date === today);
    return record ? JSON.parse(JSON.stringify(record)) : null;
}