
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
    addOrUpdateGoogleUserAsEmployee,
    findEmployeeByUidOrEmail,
    deleteEmployeeFromStore,
    addSalaryPaymentToStore,
    getSalaryPaymentsFromStore,
    addSalaryAdvanceToStore,
    getSalaryAdvancesFromStore,
} from "./data-store"; // Ensure this path is correct
import type { EmployeeProfile, Task, AttendanceRecord, SalaryPayment, SalaryAdvance } from "./types";
import { format } from 'date-fns';
import { CURRENT_USER_DATA } from "./constants"; // For isAdmin checks and default user values


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

    // TODO: Here you would typically set a session cookie or token for the user
    // For now, we're just creating/updating the employee record.

    return { 
      success: true, 
      message: existingEmployee ? "Welcome back!" : "Account created successfully!", 
      employee: employeeProfile,
      redirectTo: "/dashboard" // Or based on role
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
  // TODO: Add admin role check here if only admins can create employees
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
    // Check if email already exists
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
  // TODO: Add admin role check here if only admins can fetch all employees
  try {
    return await getEmployeesFromStore();
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return []; 
  }
}

export async function fetchEmployeeById(id: string): Promise<EmployeeProfile | null> {
  // TODO: Add admin role check or check if user is fetching their own profile
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
  // TODO: Add admin role check here
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
      // Check if new email is already taken by another employee
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
    // TODO: Add admin role check here
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
  // No specific admin check needed here, as employees can create tasks for themselves.
  // If admin assigns to others, that's handled by form values.
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
   // TODO: Add admin role check here if only admins can fetch all tasks
  try {
    return await getTasksFromStore();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function fetchUserTasks(userName: string): Promise<Task[]> {
  // No specific admin check needed if users fetch their own tasks.
  // Ensure 'userName' matches the authenticated user if not admin.
  try {
    return await getTasksForUserFromStore(userName);
  } catch (error) {
    console.error(`Failed to fetch tasks for user ${userName}:`, error);
    return [];
  }
}

// --- Attendance Actions ---
// For punchIn and punchOut, employeeId and employeeName should ideally come from the authenticated user session.
// For now, CURRENT_USER_DATA is used in the component calling these.
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
  // TODO: Add admin role check here
  try {
    return await getAttendanceRecordsFromStore();
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return [];
  }
}

export async function fetchUserAttendanceRecords(employeeId: string): Promise<AttendanceRecord[]> {
   // Ensure 'employeeId' matches the authenticated user if not admin.
  try {
    return await getAttendanceRecordsForUserFromStore(employeeId);
  } catch (error) {
    console.error(`Failed to fetch attendance for user ${employeeId}:`, error);
    return [];
  }
}

export async function fetchTodaysUserAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    // Ensure 'employeeId' matches the authenticated user.
    try {
        return await getTodaysAttendanceForUserFromStore(employeeId);
    } catch (error) {
        console.error(`Failed to fetch today's attendance for user ${employeeId}:`, error);
        return null;
    }
}

// --- Finance Actions ---
export async function fetchSalaryPayments(): Promise<SalaryPayment[]> {
    // TODO: Add admin role check here
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
  // TODO: Add admin role check here
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
    // TODO: Add admin role check here
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
  // TODO: Add admin role check here
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

// Helper function to get current authenticated user (placeholder)
// In a real app, this would involve reading session cookies or tokens
// and verifying them, then fetching user data from your database.
async function getCurrentAuthenticatedUser(): Promise<EmployeeProfile | null> {
  // This is a placeholder. Replace with actual authentication logic.
  // For example, you might decode a JWT from a cookie.
  // const session = await getSession(); // Fictional function
  // if (session?.user?.id) {
  //   return await getEmployeeByIdFromStore(session.user.id);
  // }
  // For now, returning CURRENT_USER_DATA to maintain existing behavior where applicable
  // but this needs to be replaced.
  // To avoid breaking server actions that don't rely on it directly yet, we'll just log.
  console.warn("getCurrentAuthenticatedUser is a placeholder and needs to be implemented with real auth.");
  return CURRENT_USER_DATA; // This is NOT secure for production and is only for local dev continuity.
}

// Example of how an action might be protected:
export async function adminOnlyActionExample() {
  const user = await getCurrentAuthenticatedUser();
  if (!user || user.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required.");
  }
  // Proceed with admin-specific logic
  console.log("Admin action executed by:", user.name);
  return { success: true, message: "Admin action completed." };
}
