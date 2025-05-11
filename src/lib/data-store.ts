
'use server';

import type { EmployeeProfile, Task, AttendanceRecord, SalaryPayment, SalaryAdvance, Team, UserRole, TaskStatus, TaskPriority } from '@/lib/types'; 
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_ATTENDANCE_RECORDS } from '@/lib/constants'; 
import type { UpdateEmployeeFormValues } from './schemas/employee';
import type { LogSalaryPaymentFormValues, RecordSalaryAdvanceFormValues } from './schemas/finance';
import { format } from 'date-fns';
import { adminDb, AdminTimestamp } from './firebase'; // Using Firebase Admin SDK

const EMPLOYEES_COLLECTION = 'employees';
const TASKS_COLLECTION = 'tasks';
const ATTENDANCE_COLLECTION = 'attendanceRecords';
const SALARY_PAYMENTS_COLLECTION = 'salaryPayments';
const SALARY_ADVANCES_COLLECTION = 'salaryAdvances';

// --- Seeding Functions ---
async function seedInitialData<T extends { id: string }>(collectionName: string, initialData: T[]): Promise<void> {
  if (!adminDb) throw new Error("Admin DB not initialized for seeding.");
  const collectionRef = adminDb.collection(collectionName);
  const snapshot = await collectionRef.limit(1).get();
  
  if (snapshot.empty) {
    console.log(`Collection '${collectionName}' is empty. Seeding initial data...`);
    const batch = adminDb.batch();
    initialData.forEach(item => {
      const { id, ...itemData } = item;
      const docRef = collectionRef.doc(id); // Use predefined ID for seeding consistency
      batch.set(docRef, itemData);
    });
    await batch.commit();
    console.log(`Initial data for '${collectionName}' seeded.`);
  }
}

// Call seeding functions (they will only run if collections are empty)
// This approach might run on every server start if collections are truly empty.
// For production, a more robust migration/seeding strategy is needed.
const seedPromises = [
    seedInitialData<EmployeeProfile>(EMPLOYEES_COLLECTION, INITIAL_EMPLOYEES),
    seedInitialData<Task>(TASKS_COLLECTION, INITIAL_TASKS),
    seedInitialData<AttendanceRecord>(ATTENDANCE_COLDS_COLLECTION, INITIAL_ATTENDANCE_RECORDS),
    // Seed initial salary payments and advances if needed
    // seedInitialData<SalaryPayment>(SALARY_PAYMENTS_COLLECTION, []), 
    // seedInitialData<SalaryAdvance>(SALARY_ADVANCES_COLLECTION, []),
];
Promise.all(seedPromises).catch(console.error);


// --- Helper to convert Firestore doc to local type ---
function docToDataType<T extends { id: string }>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

// --- Employee Store Functions ---
export async function getEmployeesFromStore(): Promise<EmployeeProfile[]> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snapshot = await adminDb.collection(EMPLOYEES_COLLECTION).get();
  return snapshot.docs.map(doc => docToDataType<EmployeeProfile>(doc));
}

export async function getEmployeeByIdFromStore(id: string): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const docRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  return docSnap.exists ? docToDataType<EmployeeProfile>(docSnap) : null;
}

export async function findEmployeeByUidOrEmail(uid: string, email: string | null): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized");
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
  employeeData: Omit<EmployeeProfile, 'id' | 'avatar' | 'role' | 'uid'> &amp; { roleInternal: string }
): Promise<EmployeeProfile> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const newId = adminDb.collection(EMPLOYEES_COLLECTION).doc().id; // Generate Firestore ID
  const newEmployee: EmployeeProfile = {
    id: newId, 
    uid: `manual-uid-${newId}-${Math.random().toString(36).substring(7)}`, // Placeholder if not Google Sign-In
    name: employeeData.name,
    email: employeeData.email,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(employeeData.name)}/100/100`,
    team: employeeData.team,
    roleInternal: employeeData.roleInternal,
    role: (employeeData.team === "Management Team" &amp;&amp; employeeData.roleInternal.toLowerCase().includes("manager")) ? 'admin' : 'employee',
    baseSalary: employeeData.baseSalary,
  };
  await adminDb.collection(EMPLOYEES_COLLECTION).doc(newId).set(newEmployee);
  return newEmployee;
}

export async function updateEmployeeInStore(id: string, data: UpdateEmployeeFormValues): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const docRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(id);
  const currentDoc = await docRef.get();
  if (!currentDoc.exists) return null;

  // Retain existing UID and avatar if not explicitly changed by this form
  const existingData = currentDoc.data() as EmployeeProfile;
  const updateData = {
    ...existingData, // preserve existing fields like uid, avatar, role
    name: data.name,
    email: data.email,
    team: data.team,
    roleInternal: data.roleInternal,
    baseSalary: data.baseSalary,
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
  if (!adminDb) throw new Error("Admin DB not initialized");
  const employeesRef = adminDb.collection(EMPLOYEES_COLLECTION);
  let query = employeesRef.where('uid', '==', googleUserData.uid);
  let snapshot = await query.get();

  if (snapshot.empty &amp;&amp; googleUserData.email) {
    query = employeesRef.where('email', '==', googleUserData.email);
    snapshot = await query.get();
  }

  if (!snapshot.empty) { // Existing user found
    const doc = snapshot.docs[0];
    const updateData: Partial<EmployeeProfile> = {
      name: googleUserData.name || doc.data().name,
      email: googleUserData.email || doc.data().email,
      avatar: googleUserData.avatar || doc.data().avatar,
      uid: googleUserData.uid, // Ensure UID is set/updated
    };
    await doc.ref.update(updateData);
    return { id: doc.id, ...doc.data(), ...updateData } as EmployeeProfile;
  } else { // New user
    const newId = employeesRef.doc().id;
    const newEmployee: EmployeeProfile = {
      id: newId,
      uid: googleUserData.uid,
      name: googleUserData.name || "New User",
      email: googleUserData.email || `user-${newId}@example.com`,
      avatar: googleUserData.avatar || `https://picsum.photos/seed/${encodeURIComponent(googleUserData.name || 'New User')}/100/100`,
      team: "Unassigned" as Team,
      roleInternal: "Employee",
      role: 'employee',
      baseSalary: 30000,
    };
    await employeesRef.doc(newId).set(newEmployee);
    return newEmployee;
  }
}

export async function deleteEmployeeFromStore(employeeId: string): Promise<boolean> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const employeeDocRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(employeeId);
  const employeeDoc = await employeeDocRef.get();
  if (!employeeDoc.exists) return false;

  const employeeName = (employeeDoc.data() as EmployeeProfile).name;

  const batch = adminDb.batch();
  batch.delete(employeeDocRef);

  // Delete related tasks
  const tasksSnapshot = await adminDb.collection(TASKS_COLLECTION).where('assignedTo', '==', employeeName).get();
  tasksSnapshot.forEach(doc => batch.delete(doc.ref));

  // Delete related attendance
  const attendanceSnapshot = await adminDb.collection(ATTENDANCE_COLLECTION).where('employeeId', '==', employeeId).get();
  attendanceSnapshot.forEach(doc => batch.delete(doc.ref));

  // Delete related salary payments
  const paymentsSnapshot = await adminDb.collection(SALARY_PAYMENTS_COLLECTION).where('employeeId', '==', employeeId).get();
  paymentsSnapshot.forEach(doc => batch.delete(doc.ref));

  // Delete related salary advances
  const advancesSnapshot = await adminDb.collection(SALARY_ADVANCES_COLLECTION).where('employeeId', '==', employeeId).get();
  advancesSnapshot.forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
  return true;
}

// --- Task Store Functions ---
export async function getTasksFromStore(): Promise<Task[]> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snapshot = await adminDb.collection(TASKS_COLLECTION).get();
  return snapshot.docs.map(doc => docToDataType<Task>(doc));
}

export async function getTasksForUserFromStore(userName: string): Promise<Task[]> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snapshot = await adminDb.collection(TASKS_COLLECTION).where('assignedTo', '==', userName).get();
  return snapshot.docs.map(doc => docToDataType<Task>(doc));
}

export async function addTaskToStore(taskData: Omit<Task, 'id'>): Promise<Task> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const newId = adminDb.collection(TASKS_COLLECTION).doc().id;
  const newTask: Task = { id: newId, ...taskData };
  await adminDb.collection(TASKS_COLLECTION).doc(newId).set(newTask);
  return newTask;
}

// --- Attendance Store Functions ---
export async function getAttendanceRecordsFromStore(): Promise<AttendanceRecord[]> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snapshot = await adminDb.collection(ATTENDANCE_COLLECTION).orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => docToDataType<AttendanceRecord>(doc));
}

export async function getAttendanceRecordsForUserFromStore(employeeId: string): Promise<AttendanceRecord[]> {
  if (!adminDb) throw new Error("Admin DB not initialized");
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
  if (!adminDb) throw new Error("Admin DB not initialized");
  const today = new Date().toISOString().split('T')[0]; 
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const attendanceRef = adminDb.collection(ATTENDANCE_COLLECTION);
  const q = attendanceRef.where('employeeId', '==', employeeId).where('date', '==', today);
  const snapshot = await q.get();

  let recordToReturn: AttendanceRecord | null = null;

  if (type === 'punch-in') {
    if (!snapshot.empty &amp;&amp; snapshot.docs[0].data().checkIn) { // Already punched in and not out
        const existingRecord = docToDataType<AttendanceRecord>(snapshot.docs[0]);
        if (!existingRecord.checkOut) return null; // Already punched in and not out
    }
    const newId = attendanceRef.doc().id;
    const newRecord: AttendanceRecord = {
      id: newId, employeeId, employeeName, date: today,
      checkIn: currentTime, checkOut: null, totalHours: null,
    };
    await attendanceRef.doc(newId).set(newRecord);
    recordToReturn = newRecord;
  } else { // punch-out
    if (snapshot.empty || !snapshot.docs[0].data().checkIn || snapshot.docs[0].data().checkOut) {
      // Not punched in today, or already punched out
      return null; 
    }
    const docToUpdate = snapshot.docs[0];
    const existingRecordData = docToUpdate.data() as AttendanceRecord;
    
    const checkInTime = new Date(`${today} ${existingRecordData.checkIn}`);
    const checkOutTime = new Date(`${today} ${currentTime}`); // Use current time for checkout
    let totalHoursStr: string | null = null;

    if (!isNaN(checkInTime.getTime()) &amp;&amp; !isNaN(checkOutTime.getTime())) {
        let diffMs = checkOutTime.getTime() - checkInTime.getTime();
        if (diffMs &lt; 0) diffMs += 24 * 60 * 60 * 1000; 

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
  if (!adminDb) throw new Error("Admin DB not initialized");
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
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snapshot = await adminDb.collection(SALARY_PAYMENTS_COLLECTION).orderBy('paymentDate', 'desc').get();
  return snapshot.docs.map(doc => docToDataType<SalaryPayment>(doc));
}

export async function addSalaryPaymentToStore(paymentData: LogSalaryPaymentFormValues): Promise<SalaryPayment> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const employee = await getEmployeeByIdFromStore(paymentData.employeeId);
  if (!employee) throw new Error("Employee not found for salary payment.");
  
  const newId = adminDb.collection(SALARY_PAYMENTS_COLLECTION).doc().id;
  const newPayment: SalaryPayment = {
    id: newId,
    employeeId: paymentData.employeeId,
    employeeName: employee.name,
    amount: paymentData.amount,
    paymentDate: format(paymentData.paymentDate, "yyyy-MM-dd"),
    notes: paymentData.notes || "",
  };
  await adminDb.collection(SALARY_PAYMENTS_COLLECTION).doc(newId).set(newPayment);
  return newPayment;
}

export async function getSalaryAdvancesFromStore(): Promise<SalaryAdvance[]> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snapshot = await adminDb.collection(SALARY_ADVANCES_COLLECTION).orderBy('advanceDate', 'desc').get();
  return snapshot.docs.map(doc => docToDataType<SalaryAdvance>(doc));
}

export async function addSalaryAdvanceToStore(advanceData: RecordSalaryAdvanceFormValues): Promise<SalaryAdvance> {
  if (!adminDb) throw new Error("Admin DB not initialized");
  const employee = await getEmployeeByIdFromStore(advanceData.employeeId);
  if (!employee) throw new Error("Employee not found for salary advance.");

  const newId = adminDb.collection(SALARY_ADVANCES_COLLECTION).doc().id;
  const newAdvance: SalaryAdvance = {
    id: newId,
    employeeId: advanceData.employeeId,
    employeeName: employee.name,
    amount: advanceData.amount,
    advanceDate: format(advanceData.advanceDate, "yyyy-MM-dd"),
    reason: advanceData.reason || "",
    status: "Pending",
  };
  await adminDb.collection(SALARY_ADVANCES_COLLECTION).doc(newId).set(newAdvance);
  return newAdvance;
}
