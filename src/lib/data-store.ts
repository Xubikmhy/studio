
'use server';

import type { EmployeeProfile, Task, AttendanceRecord, TaskStatus, Team, UserRole } from '@/lib/types'; // Assuming types are in a central place
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_ATTENDANCE_RECORDS, TEAMS } from '@/lib/constants'; // Using renamed initial data
import type { UpdateEmployeeFormValues } from './schemas/employee';

// --- In-memory "database" ---
let dbEmployees: EmployeeProfile[] = INITIAL_EMPLOYEES.map(emp => ({
    ...emp,
    avatar: emp.avatar || `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/100/100`,
    role: emp.role || (emp.id === '4' ? 'admin' : 'employee') as UserRole,
    roleInternal: emp.roleInternal || emp.role,
    uid: emp.uid || `firebase-uid-${emp.id}-${Math.random().toString(36).substring(7)}`, // Ensure UID
}));

let dbTasks: Task[] = [...INITIAL_TASKS];
let dbAttendance: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];

// --- Employee Store Functions ---
export async function getEmployeesFromStore(): Promise<EmployeeProfile[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbEmployees));
}

export async function getEmployeeByIdFromStore(id: string): Promise<EmployeeProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  const employee = dbEmployees.find(emp => emp.id === id);
  return employee ? JSON.parse(JSON.stringify(employee)) : null;
}

export async function findEmployeeByUidOrEmail(uid: string, email: string | null): Promise<EmployeeProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const employee = dbEmployees.find(emp => emp.uid === uid || (email && emp.email === email));
  return employee ? JSON.parse(JSON.stringify(employee)) : null;
}

// Updated to handle manual employee creation, ensuring all fields are present
export async function addEmployeeToStore(
  employeeData: Omit<EmployeeProfile, 'id' | 'avatar' | 'role' | 'uid'> & { roleInternal: string }
): Promise<EmployeeProfile> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newEmployee: EmployeeProfile = {
    id: String(Date.now()), // Simple internal ID generation
    uid: `manual-uid-${String(Date.now())}`, // Placeholder UID for manually added users
    name: employeeData.name,
    email: employeeData.email,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(employeeData.name)}/100/100`,
    team: employeeData.team,
    roleInternal: employeeData.roleInternal,
    // Assign 'admin' role if team is 'Management Team' and roleInternal is 'Manager', otherwise 'employee'
    role: (employeeData.team === "Management Team" && employeeData.roleInternal.toLowerCase().includes("manager")) ? 'admin' : 'employee',
    baseSalary: employeeData.baseSalary,
  };
  dbEmployees.push(newEmployee);
  return JSON.parse(JSON.stringify(newEmployee));
}

export async function updateEmployeeInStore(id: string, data: UpdateEmployeeFormValues): Promise<EmployeeProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const employeeIndex = dbEmployees.findIndex(emp => emp.id === id);
  if (employeeIndex === -1) {
    return null;
  }
  // Update only the fields present in UpdateEmployeeFormValues
  dbEmployees[employeeIndex] = {
    ...dbEmployees[employeeIndex], // Keep existing fields like id, uid, avatar, role
    name: data.name,
    email: data.email,
    team: data.team,
    roleInternal: data.roleInternal,
    baseSalary: data.baseSalary,
    // Potentially re-evaluate role if team/roleInternal changes, or keep existing role
    // For now, keep existing role unless specific logic is added to change it upon edit
  };
  return JSON.parse(JSON.stringify(dbEmployees[employeeIndex]));
}


// Specifically for adding/updating users from Google Sign-In
export async function addOrUpdateGoogleUserAsEmployee(googleUserData: {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}): Promise<EmployeeProfile> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let employee = dbEmployees.find(emp => emp.uid === googleUserData.uid || (googleUserData.email && emp.email === googleUserData.email));

  if (employee) {
    // Update existing employee details if necessary
    if (googleUserData.name) employee.name = googleUserData.name;
    if (googleUserData.email) employee.email = googleUserData.email; // UID should be primary link
    if (googleUserData.avatar) employee.avatar = googleUserData.avatar;
    // Ensure UID is set if matched by email
    if (!employee.uid) employee.uid = googleUserData.uid;

  } else {
    // Add as new employee with default values
    const newInternalId = String(Date.now());
    employee = {
      id: newInternalId,
      uid: googleUserData.uid,
      name: googleUserData.name || "New User",
      email: googleUserData.email || `user-${newInternalId}@example.com`,
      avatar: googleUserData.avatar || `https://picsum.photos/seed/${encodeURIComponent(googleUserData.name || 'New User')}/100/100`,
      team: "Unassigned" as Team, // Default team
      roleInternal: "Employee", // Default role title
      role: 'employee', // Default app role
      baseSalary: 30000, // Default salary
    };
    dbEmployees.push(employee);
  }
  return JSON.parse(JSON.stringify(employee));
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
  employeeId: string, // This should be the internal ID (EmployeeProfile.id)
  employeeName: string,
  type: 'punch-in' | 'punch-out'
): Promise<AttendanceRecord | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  let record = dbAttendance.find(r => r.employeeId === employeeId && r.date === today && !r.checkOut);

  if (type === 'punch-in') {
    if (record && record.checkIn) { // check if already punched in and not punched out
      return null; 
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
  } else { 
    if (!record || !record.checkIn) { 
      return null; 
    }
    record.checkOut = currentTime;
    
    const checkInTime = new Date(`${today} ${record.checkIn}`);
    const checkOutTime = new Date(`${today} ${record.checkOut}`);
    if (!isNaN(checkInTime.getTime()) && !isNaN(checkOutTime.getTime())) {
        let diffMs = checkOutTime.getTime() - checkInTime.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; 

        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        record.totalHours = `${diffHrs}h ${diffMins}m`;
    } else {
        record.totalHours = "Error";
    }
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

export async function deleteEmployeeFromStore(employeeId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const employeeToDelete = dbEmployees.find(emp => emp.id === employeeId);
  
  if (!employeeToDelete) {
    return false; // Employee not found
  }
  const employeeNameToFilterTasks = employeeToDelete.name; // Get name before deletion

  const initialLength = dbEmployees.length;
  dbEmployees = dbEmployees.filter(emp => emp.id !== employeeId);
  
  // Also remove related tasks and attendance for the deleted employee
  dbTasks = dbTasks.filter(task => task.assignedTo !== employeeNameToFilterTasks);
  dbAttendance = dbAttendance.filter(att => att.employeeId !== employeeId);
  
  return dbEmployees.length < initialLength;
}
