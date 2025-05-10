
'use server';

import type { EmployeeProfile, Task, AttendanceRecord, SalaryPayment, SalaryAdvance, Team, UserRole } from '@/lib/types'; 
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_ATTENDANCE_RECORDS, TEAMS } from '@/lib/constants'; 
import type { UpdateEmployeeFormValues } from './schemas/employee';
import type { LogSalaryPaymentFormValues, RecordSalaryAdvanceFormValues } from './schemas/finance';
import { format } from 'date-fns';

// --- In-memory "database" ---
let dbEmployees: EmployeeProfile[] = INITIAL_EMPLOYEES.map(emp => ({
    ...emp,
    avatar: emp.avatar || `https://picsum.photos/seed/${encodeURIComponent(emp.name)}/100/100`,
    role: emp.role || (emp.id === '4' ? 'admin' : 'employee') as UserRole,
    roleInternal: emp.roleInternal || emp.role,
    uid: emp.uid || `firebase-uid-${emp.id}-${Math.random().toString(36).substring(7)}`, 
}));

let dbTasks: Task[] = [...INITIAL_TASKS];
let dbAttendance: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];
let dbSalaryPayments: SalaryPayment[] = [ // Initial placeholder data
    { id: "sp1", employeeId: INITIAL_EMPLOYEES[0].id, employeeName: INITIAL_EMPLOYEES[0].name, amount: 60000, paymentDate: "2024-07-30", notes: "July Salary" },
    { id: "sp2", employeeId: INITIAL_EMPLOYEES[1].id, employeeName: INITIAL_EMPLOYEES[1].name, amount: 55000, paymentDate: "2024-07-30", notes: "July Salary" },
];
let dbSalaryAdvances: SalaryAdvance[] = [ // Initial placeholder data
    { id: "sa1", employeeId: INITIAL_EMPLOYEES[2].id, employeeName: INITIAL_EMPLOYEES[2].name, amount: 5000, advanceDate: "2024-07-15", reason: "Medical Emergency", status: "Pending" },
];


// --- Employee Store Functions ---
export async function getEmployeesFromStore(): Promise<EmployeeProfile[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(dbEmployees));
}

export async function getEmployeeByIdFromStore(id: string): Promise<EmployeeProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 50)); 
  const employee = dbEmployees.find(emp => emp.id === id);
  return employee ? JSON.parse(JSON.stringify(employee)) : null;
}

export async function findEmployeeByUidOrEmail(uid: string, email: string | null): Promise<EmployeeProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const employee = dbEmployees.find(emp => emp.uid === uid || (email && emp.email === email));
  return employee ? JSON.parse(JSON.stringify(employee)) : null;
}

export async function addEmployeeToStore(
  employeeData: Omit<EmployeeProfile, 'id' | 'avatar' | 'role' | 'uid'> & { roleInternal: string }
): Promise<EmployeeProfile> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newEmployee: EmployeeProfile = {
    id: String(Date.now()), 
    uid: `manual-uid-${String(Date.now())}`, 
    name: employeeData.name,
    email: employeeData.email,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(employeeData.name)}/100/100`,
    team: employeeData.team,
    roleInternal: employeeData.roleInternal,
    role: (employeeData.team === "Management Team" && employeeData.roleInternal.toLowerCase().includes("manager")) ? 'admin' : 'employee',
    baseSalary: employeeData.baseSalary,
  };
  dbEmployees.push(newEmployee);
  return JSON.parse(JSON.stringify(newEmployee));
}

export async function updateEmployeeInStore(id: string, data: UpdateEmployeeFormValues): Promise<EmployeeProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); 
  const employeeIndex = dbEmployees.findIndex(emp => emp.id === id);
  if (employeeIndex === -1) {
    return null;
  }
  dbEmployees[employeeIndex] = {
    ...dbEmployees[employeeIndex], 
    name: data.name,
    email: data.email,
    team: data.team,
    roleInternal: data.roleInternal,
    baseSalary: data.baseSalary,
  };
  return JSON.parse(JSON.stringify(dbEmployees[employeeIndex]));
}

export async function addOrUpdateGoogleUserAsEmployee(googleUserData: {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}): Promise<EmployeeProfile> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let employee = dbEmployees.find(emp => emp.uid === googleUserData.uid || (googleUserData.email && emp.email === googleUserData.email));

  if (employee) {
    if (googleUserData.name) employee.name = googleUserData.name;
    if (googleUserData.email) employee.email = googleUserData.email; 
    if (googleUserData.avatar) employee.avatar = googleUserData.avatar;
    if (!employee.uid) employee.uid = googleUserData.uid;

  } else {
    const newInternalId = String(Date.now());
    employee = {
      id: newInternalId,
      uid: googleUserData.uid,
      name: googleUserData.name || "New User",
      email: googleUserData.email || `user-${newInternalId}@example.com`,
      avatar: googleUserData.avatar || `https://picsum.photos/seed/${encodeURIComponent(googleUserData.name || 'New User')}/100/100`,
      team: "Unassigned" as Team, 
      roleInternal: "Employee", 
      role: 'employee', 
      baseSalary: 30000, 
    };
    dbEmployees.push(employee);
  }
  return JSON.parse(JSON.stringify(employee));
}

export async function deleteEmployeeFromStore(employeeId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const employeeToDelete = dbEmployees.find(emp => emp.id === employeeId);
  
  if (!employeeToDelete) {
    return false; 
  }
  const employeeNameToFilterTasks = employeeToDelete.name; 

  const initialLength = dbEmployees.length;
  dbEmployees = dbEmployees.filter(emp => emp.id !== employeeId);
  
  dbTasks = dbTasks.filter(task => task.assignedTo !== employeeNameToFilterTasks);
  dbAttendance = dbAttendance.filter(att => att.employeeId !== employeeId);
  dbSalaryPayments = dbSalaryPayments.filter(sp => sp.employeeId !== employeeId);
  dbSalaryAdvances = dbSalaryAdvances.filter(sa => sa.employeeId !== employeeId);
  
  return dbEmployees.length < initialLength;
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
    id: String(Date.now()), 
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
  const today = new Date().toISOString().split('T')[0]; 
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  let record = dbAttendance.find(r => r.employeeId === employeeId && r.date === today && !r.checkOut);

  if (type === 'punch-in') {
    if (record && record.checkIn) { 
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

// --- Finance Store Functions ---
export async function getSalaryPaymentsFromStore(): Promise<SalaryPayment[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(dbSalaryPayments));
}

export async function addSalaryPaymentToStore(paymentData: LogSalaryPaymentFormValues): Promise<SalaryPayment> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const employee = await getEmployeeByIdFromStore(paymentData.employeeId);
    if (!employee) {
        throw new Error("Employee not found for salary payment.");
    }
    const newPayment: SalaryPayment = {
        id: String(Date.now()),
        employeeId: paymentData.employeeId,
        employeeName: employee.name,
        amount: paymentData.amount,
        paymentDate: format(paymentData.paymentDate, "yyyy-MM-dd"),
        notes: paymentData.notes,
    };
    dbSalaryPayments.push(newPayment);
    return JSON.parse(JSON.stringify(newPayment));
}

export async function getSalaryAdvancesFromStore(): Promise<SalaryAdvance[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(dbSalaryAdvances));
}

export async function addSalaryAdvanceToStore(advanceData: RecordSalaryAdvanceFormValues): Promise<SalaryAdvance> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const employee = await getEmployeeByIdFromStore(advanceData.employeeId);
    if (!employee) {
        throw new Error("Employee not found for salary advance.");
    }
    const newAdvance: SalaryAdvance = {
        id: String(Date.now()),
        employeeId: advanceData.employeeId,
        employeeName: employee.name,
        amount: advanceData.amount,
        advanceDate: format(advanceData.advanceDate, "yyyy-MM-dd"),
        reason: advanceData.reason,
        status: "Pending", // Default status
    };
    dbSalaryAdvances.push(newAdvance);
    return JSON.parse(JSON.stringify(newAdvance));
}
