
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
    addOrUpdateGoogleUserAsEmployee,
    findEmployeeByUidOrEmail,
    deleteEmployeeFromStore,
} from "./data-store";
import type { EmployeeProfile, Task, AttendanceRecord } from "./types";

// --- Google Sign-In Action ---
interface GoogleSignInResult {
  success: boolean;
  message: string;
  employee?: EmployeeProfile | null;
  redirectTo?: string;
}

export async function processGoogleSignIn(userData: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}): Promise<GoogleSignInResult> {
  if (!userData.uid || !userData.email) {
    return { success: false, message: "Google Sign-In failed: Missing UID or Email." };
  }

  try {
    const existingEmployee = await findEmployeeByUidOrEmail(userData.uid, userData.email);
    
    const employeeData = {
      uid: userData.uid,
      name: userData.displayName,
      email: userData.email,
      avatar: userData.photoURL,
    };

    const employeeProfile = await addOrUpdateGoogleUserAsEmployee(employeeData);

    // In a real app, you would set up a session here and CURRENT_USER_DATA would be dynamic.
    // For this example, we just confirm the operation.
    return { 
      success: true, 
      message: existingEmployee ? "Welcome back!" : "Account created successfully!", 
      employee: employeeProfile,
      redirectTo: "/dashboard" 
    };
  } catch (error) {
    console.error("Error processing Google Sign-In:", error);
    return { success: false, message: "Server error during Google Sign-In." };
  }
}


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
    // Check if employee with this email already exists (excluding UID check for manual adds)
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
  try {
    return await getEmployeesFromStore();
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return []; 
  }
}

export async function deleteEmployee(employeeId: string): Promise<{ success: boolean; message: string }> {
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
