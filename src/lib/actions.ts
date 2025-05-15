
// @ts-nocheck
"use server";

import { CreateTaskSchema, type CreateTaskState } from "@/lib/schemas/task";
import { CreateEmployeeSchema, UpdateEmployeeSchema, type CreateEmployeeState, type UpdateEmployeeState } from "@/lib/schemas/employee";
import { LogSalaryPaymentSchema, type LogSalaryPaymentState, RecordSalaryAdvanceSchema, type RecordSalaryAdvanceState } from "@/lib/schemas/finance";
import {
    addEmployeeToStore,
    getEmployeesFromStore,
    getEmployeeByIdFromStore,
    updateEmployeeInStore,
    addTaskToStore,
    getTasksFromStore,
    getTasksForUserFromStore,
    addOrUpdateAttendanceRecordStore,
    getAttendanceRecordsFromStore,
    getAttendanceRecordsForUserFromStore,
    getTodaysAttendanceForUserFromStore,
    findEmployeeByUidOrEmail, // Kept for email lookup
    deleteEmployeeFromStore,
    addSalaryPaymentToStore,
    getSalaryPaymentsFromStore,
    addSalaryAdvanceToStore,
    getSalaryAdvancesFromStore,
} from "./data-store";
import type { EmployeeProfile, Task, AttendanceRecord, SalaryPayment, SalaryAdvance } from "./types";
import { format } from 'date-fns';
import { CURRENT_USER_DATA } from "./constants";


// --- Employee Actions ---
export async function handleCreateEmployee(
  prevState: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { message: "Unauthorized: Only admins can create employees.", errors: null, success: false };
  }

  const validatedFields = CreateEmployeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    team: formData.get("team"),
    roleInternal: formData.get("roleInternal"),
    baseSalary: formData.get("baseSalary"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the employee details.",
      success: false,
    };
  }

  try {
    const existingEmployeeByEmail = await findEmployeeByUidOrEmail('', validatedFields.data.email);
    if (existingEmployeeByEmail) {
        return {
            message: `An employee with email "${validatedFields.data.email}" already exists.`,
            errors: { email: ["Email already in use."] },
            success: false,
        };
    }
    await addEmployeeToStore(validatedFields.data);
    return {
      message: `Employee "${validatedFields.data.name}" created successfully!`,
      errors: null,
      success: true,
    };
  } catch (error) {
    console.error("Failed to create employee:", error);
    return {
      message: "An error occurred while creating the employee.",
      errors: { general: ["Server error, please try again."] },
      success: false,
    };
  }
}

export async function fetchEmployees(): Promise<EmployeeProfile[]> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
    console.warn("Unauthorized attempt to fetch all employees by non-admin.");
    return []; 
  }
  try {
    return await getEmployeesFromStore();
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
}

export async function fetchEmployeeById(id: string): Promise<EmployeeProfile | null> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
     console.warn(`Unauthorized attempt to fetch employee ${id}.`);
     return null; 
  }
  try {
    return await getEmployeeByIdFromStore(id);
  } catch (error) {
    console.error(`Failed to fetch employee with id ${id}:`, error);
    return null;
  }
}

export async function handleUpdateEmployee(
  employeeId: string,
  prevState: UpdateEmployeeState,
  formData: FormData
): Promise<UpdateEmployeeState> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { message: "Unauthorized: Only admins can update employees.", errors: null, success: false, employeeId };
  }

  const validatedFields = UpdateEmployeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    team: formData.get("team"),
    roleInternal: formData.get("roleInternal"),
    baseSalary: formData.get("baseSalary"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the employee details.",
      success: false,
      employeeId,
    };
  }

  try {
    const currentEmployee = await getEmployeeByIdFromStore(employeeId);
    if (currentEmployee && currentEmployee.email !== validatedFields.data.email) {
      const existingEmployeeByEmail = await findEmployeeByUidOrEmail('', validatedFields.data.email);
      if (existingEmployeeByEmail && existingEmployeeByEmail.id !== employeeId) {
          return {
              message: `An employee with email "${validatedFields.data.email}" already exists.`,
              errors: { email: ["Email already in use by another employee."] },
              success: false,
              employeeId,
          };
      }
    }

    const updatedEmployee = await updateEmployeeInStore(employeeId, validatedFields.data);
    if (!updatedEmployee) {
      return {
        message: "Employee not found or failed to update.",
        errors: { general: ["Update operation failed."] },
        success: false,
        employeeId,
      };
    }
    return {
      message: `Employee "${updatedEmployee.name}" updated successfully!`,
      errors: null,
      success: true,
      employeeId,
    };
  } catch (error) {
    console.error("Failed to update employee:", error);
    return {
      message: "An error occurred while updating the employee.",
      errors: { general: ["Server error, please try again."] },
      success: false,
      employeeId,
    };
  }
}

export async function deleteEmployee(employeeId: string): Promise<{ success: boolean; message: string }> {
    const currentUser = await getCurrentAuthenticatedUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: "Unauthorized: Only admins can delete employees." };
    }
    if (currentUser.id === employeeId) {
      return { success: false, message: "Admins cannot delete their own account through this action."};
    }
    try {
        const success = await deleteEmployeeFromStore(employeeId);
        if (success) {
            return { success: true, message: "Employee deleted successfully." };
        }
        return { success: false, message: "Employee not found or already deleted." };
    } catch (error) {
        console.error("Failed to delete employee:", error);
        return { success: false, message: "An error occurred while deleting the employee." };
    }
}

// --- Task Actions ---
export async function handleCreateTask(
  prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser) {
    return { message: "Unauthorized: You must be logged in to create tasks.", errors: null, success: false };
  }

  const validatedFields = CreateTaskSchema.safeParse({
    taskName: formData.get("taskName"),
    description: formData.get("description"),
    team: formData.get("team"),
    assignedTo: formData.get("assignedTo"),
    status: formData.get("status"),
    priority: formData.get("priority"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the task details.",
      success: false,
    };
  }

  if (currentUser.role !== 'admin') {
    if (validatedFields.data.assignedTo !== currentUser.name || validatedFields.data.team !== currentUser.team) {
      return {
        message: "Employees can only create tasks for themselves within their own team.",
        errors: {
            assignedTo: validatedFields.data.assignedTo !== currentUser.name ? ["Cannot assign to other users."] : undefined,
            team: validatedFields.data.team !== currentUser.team ? ["Cannot assign to other teams."] : undefined,
         },
        success: false,
      };
    }
  }


  try {
    await addTaskToStore(validatedFields.data);
    return {
      message: `Task "${validatedFields.data.taskName}" created successfully!`,
      errors: null,
      success: true,
    };
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      message: "An error occurred while creating the task.",
      errors: { general: ["Server error, please try again."] },
      success: false,
    };
  }
}

export async function fetchTasks(): Promise<Task[]> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
    console.warn("Unauthorized attempt to fetch all tasks by non-admin.");
    return []; 
  }
  try {
    return await getTasksFromStore();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function fetchUserTasks(employeeIdForTasks: string): Promise<Task[]> {
  const currentUser = await getCurrentAuthenticatedUser();
   if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== employeeIdForTasks)) {
     console.warn(`Unauthorized attempt to fetch tasks for user ${employeeIdForTasks} by ${currentUser?.id}.`);
     return [];
   }
  try {
    const employee = await getEmployeeByIdFromStore(employeeIdForTasks);
    if (!employee) return [];
    return await getTasksForUserFromStore(employee.name);
  } catch (error) {
    console.error(`Failed to fetch tasks for user ${employeeIdForTasks}:`, error);
    return [];
  }
}

// --- Attendance Actions ---
export async function punchIn(): Promise<{ success: boolean; message: string; record?: AttendanceRecord | null }> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser) {
    return { success: false, message: "Unauthorized: You must be logged in." };
  }
  try {
    const record = await addOrUpdateAttendanceRecordStore(currentUser.id, currentUser.name, 'punch-in');
    if (record) {
      return { success: true, message: "Punched in successfully.", record };
    }
    return { success: false, message: "Already punched in today or punch-in error." };
  } catch (error) {
    console.error("Punch in error:", error);
    return { success: false, message: "Server error during punch in." };
  }
}

export async function punchOut(): Promise<{ success: boolean; message: string; record?: AttendanceRecord | null }> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser) {
    return { success: false, message: "Unauthorized: You must be logged in." };
  }
  try {
    const record = await addOrUpdateAttendanceRecordStore(currentUser.id, currentUser.name, 'punch-out');
     if (record && record.checkOut) {
      return { success: true, message: "Punched out successfully.", record };
    }
    return { success: false, message: "Not punched in or error during punch out." };
  } catch (error) {
    console.error("Punch out error:", error);
    return { success: false, message: "Server error during punch out." };
  }
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
     console.warn("Unauthorized attempt to fetch all attendance by non-admin.");
     return [];
  }
  try {
    return await getAttendanceRecordsFromStore();
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return [];
  }
}

export async function fetchUserAttendanceRecords(employeeId: string): Promise<AttendanceRecord[]> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== employeeId)) {
      console.warn(`Unauthorized attempt to fetch attendance for ${employeeId} by non-admin/non-owner.`);
      return [];
  }
  try {
    return await getAttendanceRecordsForUserFromStore(employeeId);
  } catch (error) {
    console.error(`Failed to fetch attendance for user ${employeeId}:`, error);
    return [];
  }
}

export async function fetchTodaysUserAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    const currentUser = await getCurrentAuthenticatedUser();
    if (!currentUser || currentUser.id !== employeeId ) { 
        console.warn(`Attempt to fetch today's attendance for ${employeeId} by unauthorized user ${currentUser?.id}.`);
        return null;
    }
    try {
        return await getTodaysAttendanceForUserFromStore(employeeId);
    } catch (error) {
        console.error(`Failed to fetch today's attendance for user ${employeeId}:`, error);
        return null;
    }
}

// --- Finance Actions ---
export async function fetchSalaryPayments(): Promise<SalaryPayment[]> {
    const currentUser = await getCurrentAuthenticatedUser();
    if (!currentUser || currentUser.role !== 'admin') {
       console.warn("Unauthorized attempt to fetch salary payments by non-admin.");
       return [];
    }
    try {
        return await getSalaryPaymentsFromStore();
    } catch (error) {
        console.error("Failed to fetch salary payments:", error);
        return [];
    }
}

export async function handleLogSalaryPayment(
  prevState: LogSalaryPaymentState,
  formData: FormData
): Promise<LogSalaryPaymentState> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { message: "Unauthorized: Only admins can log salary payments.", errors: null, success: false };
  }
  const paymentDate = formData.get("paymentDate");
  const validatedFields = LogSalaryPaymentSchema.safeParse({
    employeeId: formData.get("employeeId"),
    amount: formData.get("amount"),
    paymentDate: paymentDate ? new Date(paymentDate as string) : undefined,
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the payment details.",
      success: false,
    };
  }

  try {
    await addSalaryPaymentToStore(validatedFields.data);
    return {
      message: `Salary payment logged successfully!`,
      errors: null,
      success: true,
    };
  } catch (error) {
    console.error("Failed to log salary payment:", error);
    return {
      message: (error as Error).message || "An error occurred while logging the payment.",
      errors: { general: ["Server error, please try again."] },
      success: false,
    };
  }
}

export async function fetchSalaryAdvances(): Promise<SalaryAdvance[]> {
    const currentUser = await getCurrentAuthenticatedUser();
    if (!currentUser || currentUser.role !== 'admin') {
       console.warn("Unauthorized attempt to fetch salary advances by non-admin.");
       return [];
    }
    try {
        return await getSalaryAdvancesFromStore();
    } catch (error) {
        console.error("Failed to fetch salary advances:", error);
        return [];
    }
}

export async function handleRecordSalaryAdvance(
  prevState: RecordSalaryAdvanceState,
  formData: FormData
): Promise<RecordSalaryAdvanceState> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { message: "Unauthorized: Only admins can record salary advances.", errors: null, success: false };
  }
  const advanceDate = formData.get("advanceDate");
  const validatedFields = RecordSalaryAdvanceSchema.safeParse({
    employeeId: formData.get("employeeId"),
    amount: formData.get("amount"),
    advanceDate: advanceDate ? new Date(advanceDate as string) : undefined,
    reason: formData.get("reason"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the advance details.",
      success: false,
    };
  }

  try {
    await addSalaryAdvanceToStore(validatedFields.data);
    return {
      message: `Salary advance recorded successfully!`,
      errors: null,
      success: true,
    };
  } catch (error) {
    console.error("Failed to record salary advance:", error);
    return {
      message: (error as Error).message || "An error occurred while recording the advance.",
      errors: { general: ["Server error, please try again."] },
      success: false,
    };
  }
}


async function getCurrentAuthenticatedUser(): Promise<EmployeeProfile | null> {
  if (CURRENT_USER_DATA && CURRENT_USER_DATA.id) {
    try {
      const userFromDb = await getEmployeeByIdFromStore(CURRENT_USER_DATA.id);
      if (userFromDb) {
        return userFromDb;
      }
      return CURRENT_USER_DATA; 
    } catch (e) {
      return CURRENT_USER_DATA; 
    }
  }
  return null;
}


export async function adminOnlyActionExample() {
  const user = await getCurrentAuthenticatedUser();
  if (!user || user.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required.");
  }
  console.log("Admin action executed by:", user.name);
  return { success: true, message: "Admin action completed." };
}
