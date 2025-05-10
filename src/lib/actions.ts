// @ts-nocheck
"use server";

import { CreateTaskSchema, type CreateTaskState } from "@/lib/schemas/task"; 
import { CreateEmployeeSchema, type CreateEmployeeState } from "@/lib/schemas/employee";
import { 
    addEmployeeToStore, 
    getEmployeesFromStore,
    addTaskToStore,
    getTasksFromStore,
    getTasksForUserFromStore,
    addOrUpdateAttendanceRecordStore,
    getAttendanceRecordsFromStore,
    getAttendanceRecordsForUserFromStore,
    getTodaysAttendanceForUserFromStore,
} from "./data-store";
import type { EmployeeProfile, Task, AttendanceRecord } from "./types";

// --- Employee Actions ---
export async function handleCreateEmployee(
  prevState: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  const validatedFields = CreateEmployeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    team: formData.get("team"),
    roleInternal: formData.get("roleInternal"),
    baseSalary: formData.get("baseSalary"), // Zod schema handles coercion
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the employee details.",
      success: false,
    };
  }

  try {
    // roleInternal is now correctly part of validatedFields.data
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
  try {
    return await getEmployeesFromStore();
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return []; // Return empty array on error
  }
}

// --- Task Actions ---
export async function handleCreateTask(
  prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
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
   try {
    return await getTasksFromStore();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function fetchUserTasks(userName: string): Promise<Task[]> {
  try {
    return await getTasksForUserFromStore(userName);
  } catch (error) {
    console.error(`Failed to fetch tasks for user ${userName}:`, error);
    return [];
  }
}


// --- Attendance Actions ---
export async function punchIn(employeeId: string, employeeName: string): Promise<{ success: boolean; message: string; record?: AttendanceRecord | null }> {
  try {
    const record = await addOrUpdateAttendanceRecordStore(employeeId, employeeName, 'punch-in');
    if (record) {
      return { success: true, message: "Punched in successfully.", record };
    }
    return { success: false, message: "Already punched in today or error." };
  } catch (error) {
    console.error("Punch in error:", error);
    return { success: false, message: "Server error during punch in." };
  }
}

export async function punchOut(employeeId: string, employeeName: string): Promise<{ success: boolean; message: string; record?: AttendanceRecord | null }> {
  try {
    const record = await addOrUpdateAttendanceRecordStore(employeeId, employeeName, 'punch-out');
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
  try {
    return await getAttendanceRecordsFromStore();
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return [];
  }
}

export async function fetchUserAttendanceRecords(employeeId: string): Promise<AttendanceRecord[]> {
   try {
    return await getAttendanceRecordsForUserFromStore(employeeId);
  } catch (error) {
    console.error(`Failed to fetch attendance for user ${employeeId}:`, error);
    return [];
  }
}

export async function fetchTodaysUserAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    try {
        return await getTodaysAttendanceForUserFromStore(employeeId);
    } catch (error) {
        console.error(`Failed to fetch today's attendance for user ${employeeId}:`, error);
        return null;
    }
}