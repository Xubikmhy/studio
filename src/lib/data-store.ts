
'use server';

import type { EmployeeProfile, Task, AttendanceRecord, SalaryPayment, SalaryAdvance, Team, UserRole, TaskStatus, TaskPriority } from '@/lib/types'; 
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_ATTENDANCE_RECORDS } from '@/lib/constants'; 
import type { UpdateEmployeeFormValues } from './schemas/employee';
import type { LogSalaryPaymentFormValues, RecordSalaryAdvanceFormValues } from './schemas/finance';
import { format } from 'date-fns';
import { adminDb, AdminTimestamp } from './firebase/admin'; // Updated import path

const EMPLOYEES_COLLECTION = 'employees';
const TASKS_COLLECTION = 'tasks';
const ATTENDANCE_COLLECTION = 'attendanceRecords';
const SALARY_PAYMENTS_COLLECTION = 'salaryPayments';
const SALARY_ADVANCES_COLLECTION = 'salaryAdvances';

// --- Seeding Functions ---
async function seedInitialData<T extends { id: string }>(collectionName: string, initialData: T[]): Promise<void> {
  if (!adminDb) {
    console.warn("Admin DB not initialized. Skipping seeding for collection:", collectionName);
    return;
  }
  try {
    const collectionRef = adminDb.collection(collectionName);
    const snapshot = await collectionRef.limit(1).get();
    
    if (snapshot.empty) {
      // console.log(`Collection '${collectionName}' is empty. Seeding initial data...`);
      const batch = adminDb.batch();
      initialData.forEach(item => {
        const { id, ...itemData } = item; // Destructure id from item
        const docRef = collectionRef.doc(id); // Use predefined ID for seeding consistency
        batch.set(docRef, itemData);
      });
      await batch.commit();
      // console.log(`Initial data for '${collectionName}' seeded.`);
    } else {
      // console.log(`Collection '${collectionName}' already has data. Skipping seeding.`);
    }
  } catch (error) {
    console.error(`Error seeding data for collection ${collectionName}:`, error);
  }
}

// Initialize seeding (runs once if db not initialized before this point)
if (adminDb) {
    const seedPromises = [
        seedInitialData<EmployeeProfile>(EMPLOYEES_COLLECTION, INITIAL_EMPLOYEES),
        seedInitialData<Task>(TASKS_COLLECTION, INITIAL_TASKS),
        seedInitialData<AttendanceRecord>(ATTENDANCE_COLLECTION, INITIAL_ATTENDANCE_RECORDS),
        // seedInitialData<SalaryPayment>(SALARY_PAYMENTS_COLLECTION, []), // Example: Add initial payments if any
        // seedInitialData<SalaryAdvance>(SALARY_ADVANCES_COLLECTION, []), // Example: Add initial advances if any
    ];
    Promise.all(seedPromises).catch(console.error);
}


// --- Helper to convert Firestore doc to local type ---
function docToDataType<T extends { id: string }>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

// --- Employee Store Functions ---
export async function getEmployeesFromStore(): Promise<EmployeeProfile[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getEmployeesFromStore");
  const snapshot = await adminDb.collection(EMPLOYEES_COLLECTION).get();
  return snapshot.docs.map(doc => docToDataType<EmployeeProfile>(doc));
}

export async function getEmployeeByIdFromStore(id: string): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for getEmployeeByIdFromStore");
  const docRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  return docSnap.exists ? docToDataType<EmployeeProfile>(docSnap) : null;
}

export async function findEmployeeByUidOrEmail(uid: string, email: string | null): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for findEmployeeByUidOrEmail");
  let querySnapshot;
  if (uid) {
    querySnapshot = await adminDb.collection(EMPLOYEES_COLLECTION).where('uid', '==', uid).limit(1).get();
    if (!querySnapshot.empty) return docToDataType<EmployeeProfile>(querySnapshot.docs[0]);
  }
  if (email) {
    querySnapshot = await adminDb.collection(EMPLOYEES_COLLECTION).where('email', '==', email).limit(1).get();
    if (!querySnapshot.empty) return docToDataType<EmployeeProfile>(querySnapshot.docs[0]);
  }
  return null;
}

export async function addEmployeeToStore(
  employeeData: Omit<EmployeeProfile, 'id' | 'avatar' | 'role' | 'uid'> & { roleInternal: string }
): Promise<EmployeeProfile> {
  if (!adminDb) throw new Error("Admin DB not initialized for addEmployeeToStore");
  
  const newDocRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(); // Firestore generates ID
  const newEmployee: EmployeeProfile = {
    id: newDocRef.id, 
    uid: `manual-uid-${newDocRef.id}-${Math.random().toString(36).substring(7)}`,
    name: employeeData.name,
    email: employeeData.email,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(employeeData.name)}/100/100`,
    team: employeeData.team,
    roleInternal: employeeData.roleInternal,
    role: (employeeData.team === "Management Team" && employeeData.roleInternal.toLowerCase().includes("manager")) ? 'admin' : 'employee',
    baseSalary: employeeData.baseSalary,
  };
  await newDocRef.set(newEmployee);
  return newEmployee;
}

export async function updateEmployeeInStore(id: string, data: UpdateEmployeeFormValues): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for updateEmployeeInStore");
  const docRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(id);
  const currentDoc = await docRef.get();
  if (!currentDoc.exists) return null;

  const existingData = currentDoc.data() as EmployeeProfile;
  const updateData = {
    ...existingData,
    name: data.name,
    email: data.email,
    team: data.team,
    roleInternal: data.roleInternal,
    baseSalary: data.baseSalary,
    // Automatically determine role based on team and roleInternal if needed, or keep existing role
    role: (data.team === "Management Team" && data.roleInternal.toLowerCase().includes("manager")) ? 'admin' : existingData.role || 'employee',
  };
  await docRef.update(updateData);
  return { id, ...updateData };
}

export async function addOrUpdateGoogleUserAsEmployee(googleUserData: {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}): Promise<EmployeeProfile> {
  if (!adminDb) throw new Error("Admin DB not initialized for addOrUpdateGoogleUserAsEmployee");
  const employeesRef = adminDb.collection(EMPLOYEES_COLLECTION);
  let query = employeesRef.where('uid', '==', googleUserData.uid);
  let snapshot = await query.get();

  if (snapshot.empty && googleUserData.email) {
    query = employeesRef.where('email', '==', googleUserData.email);
    snapshot = await query.get();
  }

  if (!snapshot.empty) { 
    const doc = snapshot.docs[0];
    const updateData: Partial<EmployeeProfile> = {
      name: googleUserData.name || doc.data().name,
      email: googleUserData.email || doc.data().email,
      avatar: googleUserData.avatar || doc.data().avatar,
      uid: googleUserData.uid, 
    };
    await doc.ref.update(updateData);
    return { id: doc.id, ...doc.data(), ...updateData } as EmployeeProfile;
  } else { 
    const newDocRef = employeesRef.doc();
    const newEmployee: EmployeeProfile = {
      id: newDocRef.id,
      uid: googleUserData.uid,
      name: googleUserData.name || "New User",
      email: googleUserData.email || `user-${newDocRef.id}@example.com`,
      avatar: googleUserData.avatar || `https://picsum.photos/seed/${encodeURIComponent(googleUserData.name || 'New User')}/100/100`,
      team: "Unassigned" as Team,
      roleInternal: "Employee",
      role: 'employee',
      baseSalary: 30000, // Default base salary
    };
    await newDocRef.set(newEmployee);
    return newEmployee;
  }
}

export async function deleteEmployeeFromStore(employeeId: string): Promise<boolean> {
  if (!adminDb) throw new Error("Admin DB not initialized for deleteEmployeeFromStore");
  const employeeDocRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(employeeId);
  const employeeDoc = await employeeDocRef.get();
  if (!employeeDoc.exists) return false;

  const employeeName = (employeeDoc.data() as EmployeeProfile).name;

  const batch = adminDb.batch();
  batch.delete(employeeDocRef);

  const tasksSnapshot = await adminDb.collection(TASKS_COLLECTION).where('assignedTo', '==', employeeName).get();
  tasksSnapshot.forEach(doc => batch.delete(doc.ref));

  const attendanceSnapshot = await adminDb.collection(ATTENDANCE_COLLECTION).where('employeeId', '==', employeeId).get();
  attendanceSnapshot.forEach(doc => batch.delete(doc.ref));

  const paymentsSnapshot = await adminDb.collection(SALARY_PAYMENTS_COLLECTION).where('employeeId', '==', employeeId).get();
  paymentsSnapshot.forEach(doc => batch.delete(doc.ref));

  const advancesSnapshot = await adminDb.collection(SALARY_ADVANCES_COLLECTION).where('employeeId', '==', employeeId).get();
  advancesSnapshot.forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
  return true;
}

// --- Task Store Functions ---
export async function getTasksFromStore(): Promise<Task[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getTasksFromStore");
  const snapshot = await adminDb.collection(TASKS_COLLECTION).get();
  return snapshot.docs.map(doc => docToDataType<Task>(doc));
}

export async function getTasksForUserFromStore(userName: string): Promise<Task[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getTasksForUserFromStore");
  const snapshot = await adminDb.collection(TASKS_COLLECTION).where('assignedTo', '==', userName).get();
  return snapshot.docs.map(doc => docToDataType<Task>(doc));
}

export async function addTaskToStore(taskData: Omit<Task, 'id'>): Promise<Task> {
  if (!adminDb) throw new Error("Admin DB not initialized for addTaskToStore");
  const newDocRef = adminDb.collection(TASKS_COLLECTION).doc();
  const newTask: Task = { id: newDocRef.id, ...taskData };
  await newDocRef.set(newTask);
  return newTask;
}

// --- Attendance Store Functions ---
export async function getAttendanceRecordsFromStore(): Promise<AttendanceRecord[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getAttendanceRecordsFromStore");
  const snapshot = await adminDb.collection(ATTENDANCE_COLLECTION).orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => docToDataType<AttendanceRecord>(doc));
}

export async function getAttendanceRecordsForUserFromStore(employeeId: string): Promise<AttendanceRecord[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getAttendanceRecordsForUserFromStore");
  const snapshot = await adminDb.collection(ATTENDANCE_COLLECTION)
    .where('employeeId', '==', employeeId)
    .orderBy('date', 'desc')
    .get();
  return snapshot.docs.map(doc => docToDataType<AttendanceRecord>(doc));
}

export async function addOrUpdateAttendanceRecordStore(
  employeeId: string, 
  employeeName: string,
  type: 'punch-in' | 'punch-out'
): Promise<AttendanceRecord | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for addOrUpdateAttendanceRecordStore");
  const today = new Date().toISOString().split('T')[0]; 
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const attendanceRef = adminDb.collection(ATTENDANCE_COLLECTION);
  const q = attendanceRef.where('employeeId', '==', employeeId).where('date', '==', today);
  const snapshot = await q.get();

  let recordToReturn: AttendanceRecord | null = null;

  if (type === 'punch-in') {
    if (!snapshot.empty && snapshot.docs[0].data().checkIn) { 
        const existingRecord = docToDataType<AttendanceRecord>(snapshot.docs[0]);
        if (!existingRecord.checkOut) return null; 
    }
    const newDocRef = attendanceRef.doc();
    const newRecord: AttendanceRecord = {
      id: newDocRef.id, employeeId, employeeName, date: today,
      checkIn: currentTime, checkOut: null, totalHours: null,
    };
    await newDocRef.set(newRecord);
    recordToReturn = newRecord;
  } else { 
    if (snapshot.empty || !snapshot.docs[0].data().checkIn || snapshot.docs[0].data().checkOut) {
      return null; 
    }
    const docToUpdate = snapshot.docs[0];
    const existingRecordData = docToUpdate.data() as AttendanceRecord;
    
    const checkInTime = new Date(`${today} ${existingRecordData.checkIn}`);
    const checkOutTime = new Date(`${today} ${currentTime}`); 
    let totalHoursStr: string | null = null;

    if (!isNaN(checkInTime.getTime()) && !isNaN(checkOutTime.getTime())) {
        let diffMs = checkOutTime.getTime() - checkInTime.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; 

        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        totalHoursStr = `${diffHrs}h ${diffMins}m`;
    } else {
        totalHoursStr = "Error";
    }
    
    const updatedRecordData = { checkOut: currentTime, totalHours: totalHoursStr };
    await docToUpdate.ref.update(updatedRecordData);
    recordToReturn = { ...existingRecordData, ...updatedRecordData, id: docToUpdate.id };
  }
  return recordToReturn;
}

export async function getTodaysAttendanceForUserFromStore(employeeId: string): Promise<AttendanceRecord | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for getTodaysAttendanceForUserFromStore");
  const today = new Date().toISOString().split('T')[0];
  const snapshot = await adminDb.collection(ATTENDANCE_COLLECTION)
    .where('employeeId', '==', employeeId)
    .where('date', '==', today)
    .limit(1)
    .get();
  return snapshot.empty ? null : docToDataType<AttendanceRecord>(snapshot.docs[0]);
}

// --- Finance Store Functions ---
export async function getSalaryPaymentsFromStore(): Promise<SalaryPayment[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getSalaryPaymentsFromStore");
  const snapshot = await adminDb.collection(SALARY_PAYMENTS_COLLECTION).orderBy('paymentDate', 'desc').get();
  return snapshot.docs.map(doc => docToDataType<SalaryPayment>(doc));
}

export async function addSalaryPaymentToStore(paymentData: LogSalaryPaymentFormValues): Promise<SalaryPayment> {
  if (!adminDb) throw new Error("Admin DB not initialized for addSalaryPaymentToStore");
  const employee = await getEmployeeByIdFromStore(paymentData.employeeId);
  if (!employee) throw new Error("Employee not found for salary payment.");
  
  const newDocRef = adminDb.collection(SALARY_PAYMENTS_COLLECTION).doc();
  const newPayment: SalaryPayment = {
    id: newDocRef.id,
    employeeId: paymentData.employeeId,
    employeeName: employee.name,
    amount: paymentData.amount,
    paymentDate: format(paymentData.paymentDate, "yyyy-MM-dd"),
    notes: paymentData.notes || "",
  };
  await newDocRef.set(newPayment);
  return newPayment;
}

export async function getSalaryAdvancesFromStore(): Promise<SalaryAdvance[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getSalaryAdvancesFromStore");
  const snapshot = await adminDb.collection(SALARY_ADVANCES_COLLECTION).orderBy('advanceDate', 'desc').get();
  return snapshot.docs.map(doc => docToDataType<SalaryAdvance>(doc));
}

export async function addSalaryAdvanceToStore(advanceData: RecordSalaryAdvanceFormValues): Promise<SalaryAdvance> {
  if (!adminDb) throw new Error("Admin DB not initialized for addSalaryAdvanceToStore");
  const employee = await getEmployeeByIdFromStore(advanceData.employeeId);
  if (!employee) throw new Error("Employee not found for salary advance.");

  const newDocRef = adminDb.collection(SALARY_ADVANCES_COLLECTION).doc();
  const newAdvance: SalaryAdvance = {
    id: newDocRef.id,
    employeeId: advanceData.employeeId,
    employeeName: employee.name,
    amount: advanceData.amount,
    advanceDate: format(advanceData.advanceDate, "yyyy-MM-dd"),
    reason: advanceData.reason || "",
    status: "Pending", // Default status
  };
  await newDocRef.set(newAdvance);
  return newAdvance;
}
