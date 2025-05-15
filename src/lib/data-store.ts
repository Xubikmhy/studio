
'use server';

import type { EmployeeProfile, Task, AttendanceRecord, SalaryPayment, SalaryAdvance } from '@/lib/types';
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_ATTENDANCE_RECORDS } from '@/lib/constants';
import type { UpdateEmployeeFormValues } from './schemas/employee';
import type { LogSalaryPaymentFormValues, RecordSalaryAdvanceFormValues } from './schemas/finance';
import type { ManualAttendanceEntryFormValues } from './schemas/attendance'; // Added
import { format as formatDateFns } from 'date-fns';
import { adminDb } from './firebase/admin';

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
      const batch = adminDb.batch();
      initialData.forEach(item => {
        const docRef = collectionRef.doc(item.id); // Use existing ID for seeding
        batch.set(docRef, item); // Store the whole item, including its ID if that's the desired structure
      });
      await batch.commit();
      console.log(`Seeded ${collectionName} with ${initialData.length} records.`);
    }
  } catch (error) {
    console.error(`Error seeding data for collection ${collectionName}:`, error);
  }
}

// Seed data only if Firebase Admin is initialized
if (adminDb) {
  seedInitialData<EmployeeProfile>(EMPLOYEES_COLLECTION, INITIAL_EMPLOYEES)
    .then(() => seedInitialData<Task>(TASKS_COLLECTION, INITIAL_TASKS))
    .then(() => seedInitialData<AttendanceRecord>(ATTENDANCE_COLLECTION, INITIAL_ATTENDANCE_RECORDS))
    .catch(console.error);
}


// --- Helper to convert Firestore doc to local type ---
function docToDataType<T extends { id: string }>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

// --- Employee Store Functions ---
export async function getEmployeesFromStore(): Promise<EmployeeProfile[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getEmployeesFromStore");
  const snapshot = await adminDb.collection(EMPLOYEES_COLLECTION).orderBy('name').get();
  return snapshot.docs.map(doc => docToDataType<EmployeeProfile>(doc));
}

export async function getEmployeeByIdFromStore(id: string): Promise<EmployeeProfile | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for getEmployeeByIdFromStore");
  const docRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  return docSnap.exists ? docToDataType<EmployeeProfile>(docSnap) : null;
}


export async function addEmployeeToStore(
  employeeData: Omit<EmployeeProfile, 'id' | 'avatar' | 'role' | 'uid'> & { roleInternal: string }
): Promise<EmployeeProfile> {
  if (!adminDb) throw new Error("Admin DB not initialized for addEmployeeToStore");

  const newDocRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(); // Auto-generate ID
  const newEmployee: EmployeeProfile = {
    id: newDocRef.id,
    uid: `manual-uid-${newDocRef.id}`, 
    name: employeeData.name,
    email: employeeData.email,
    avatar: `https://placehold.co/100x100.png?text=${employeeData.name.charAt(0)}`, // Placeholder avatar
    team: employeeData.team,
    roleInternal: employeeData.roleInternal,
    role: (employeeData.team === "Management Team" && employeeData.roleInternal.toLowerCase().includes("manager")) || employeeData.email === 'admin@example.com' ? 'admin' : 'employee',
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
  const updateData: Partial<EmployeeProfile> = { // Use Partial to only update specified fields
    name: data.name,
    email: data.email,
    team: data.team,
    roleInternal: data.roleInternal,
    baseSalary: data.baseSalary,
    // Update role based on new team/roleInternal, preserve existing if not admin criteria
    role: (data.team === "Management Team" && data.roleInternal.toLowerCase().includes("manager")) || data.email === 'admin@example.com' ? 'admin' : 'employee',
  };

  // Preserve avatar and uid if not explicitly changed (though form doesn't change them)
  const finalData = { ...existingData, ...updateData };
  
  await docRef.update(finalData);
  return finalData;
}

export async function deleteEmployeeFromStore(employeeId: string): Promise<boolean> {
  if (!adminDb) throw new Error("Admin DB not initialized for deleteEmployeeFromStore");
  const employeeDocRef = adminDb.collection(EMPLOYEES_COLLECTION).doc(employeeId);
  const employeeDoc = await employeeDocRef.get();
  if (!employeeDoc.exists) return false;

  const employeeName = (employeeDoc.data() as EmployeeProfile).name;

  const batch = adminDb.batch();
  batch.delete(employeeDocRef);

  // Cascade delete related records (optional, based on app requirements)
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
  const snapshot = await adminDb.collection(TASKS_COLLECTION).orderBy('priority').orderBy('name').get();
  return snapshot.docs.map(doc => docToDataType<Task>(doc));
}

export async function getTasksForUserFromStore(userName: string): Promise<Task[]> {
  if (!adminDb) throw new Error("Admin DB not initialized for getTasksForUserFromStore");
  const snapshot = await adminDb.collection(TASKS_COLLECTION)
    .where('assignedTo', '==', userName)
    .orderBy('priority')
    .orderBy('name')
    .get();
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
  const snapshot = await adminDb.collection(ATTENDANCE_COLLECTION).orderBy('date', 'desc').orderBy('employeeName').get();
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
  const today = formatDateFns(new Date(), "yyyy-MM-dd");
  const now = new Date();
  const currentTime = formatDateFns(now, "hh:mm a"); // e.g., 09:05 AM

  const attendanceRef = adminDb.collection(ATTENDANCE_COLLECTION);
  const q = attendanceRef.where('employeeId', '==', employeeId).where('date', '==', today);
  const snapshot = await q.get();

  let recordToReturn: AttendanceRecord | null = null;

  if (type === 'punch-in') {
    if (!snapshot.empty) {
        const existingRecord = docToDataType<AttendanceRecord>(snapshot.docs[0]);
        // Allow re-punch-in only if already punched out for the day, or no punch-in yet.
        // This simple logic doesn't prevent multiple punch-ins if not punched out.
        // A more robust system might prevent punch-in if already punched-in and not out.
        if (existingRecord.checkIn && !existingRecord.checkOut) return null; // Already punched in, not out
    }
    const newDocRef = snapshot.empty ? attendanceRef.doc() : snapshot.docs[0].ref; // Update if exists for today
    const newRecord: AttendanceRecord = {
      id: newDocRef.id, employeeId, employeeName, date: today,
      checkIn: currentTime, checkOut: null, totalHours: null,
    };
    await newDocRef.set(newRecord, { merge: snapshot.empty ? false : true }); // Merge if updating existing
    recordToReturn = newRecord;
  } else { // punch-out
    if (snapshot.empty || !snapshot.docs[0].data().checkIn || snapshot.docs[0].data().checkOut) {
      return null; // Not punched in or already punched out
    }
    const docToUpdate = snapshot.docs[0];
    const existingRecordData = docToUpdate.data() as AttendanceRecord;

    const checkInDateTimeStr = `${existingRecordData.date} ${existingRecordData.checkIn}`;
    const checkOutDateTimeStr = `${today} ${currentTime}`;

    // Helper to parse HH:MM AM/PM to a Date object
    const parseTimeStringToDate = (timeStr: string, dayStr: string): Date => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case
        
        const [year, month, day] = dayStr.split('-').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    };
    
    const checkInDateObj = parseTimeStringToDate(existingRecordData.checkIn!, existingRecordData.date);
    const checkOutDateObj = parseTimeStringToDate(currentTime, today);
    
    let totalHoursStr: string | null = null;
    if (!isNaN(checkInDateObj.getTime()) && !isNaN(checkOutDateObj.getTime()) && checkOutDateObj > checkInDateObj) {
        let diffMs = checkOutDateObj.getTime() - checkInDateObj.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        totalHoursStr = `${diffHrs}h ${diffMins}m`;
    } else {
        totalHoursStr = "Error"; // Or handle this case explicitly
    }

    const updatedRecordData = { checkOut: currentTime, totalHours: totalHoursStr };
    await docToUpdate.ref.update(updatedRecordData);
    recordToReturn = { ...existingRecordData, ...updatedRecordData, id: docToUpdate.id };
  }
  return recordToReturn;
}

export async function getTodaysAttendanceForUserFromStore(employeeId: string): Promise<AttendanceRecord | null> {
  if (!adminDb) throw new Error("Admin DB not initialized for getTodaysAttendanceForUserFromStore");
  const today = formatDateFns(new Date(), "yyyy-MM-dd");
  const snapshot = await adminDb.collection(ATTENDANCE_COLLECTION)
    .where('employeeId', '==', employeeId)
    .where('date', '==', today)
    .limit(1)
    .get();
  return snapshot.empty ? null : docToDataType<AttendanceRecord>(snapshot.docs[0]);
}

export async function addManualAttendanceRecordToStore(
  recordData: Omit<AttendanceRecord, 'id'>
): Promise<AttendanceRecord> {
  if (!adminDb) throw new Error("Admin DB not initialized for addManualAttendanceRecordToStore");
  const newDocRef = adminDb.collection(ATTENDANCE_COLLECTION).doc();
  const newRecord: AttendanceRecord = {
    id: newDocRef.id,
    ...recordData,
  };
  await newDocRef.set(newRecord);
  return newRecord;
}

export async function deleteAttendanceRecordFromStore(id: string): Promise<boolean> {
  if (!adminDb) throw new Error("Admin DB not initialized for deleteAttendanceRecordFromStore");
  const docRef = adminDb.collection(ATTENDANCE_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return false;
  }
  await docRef.delete();
  return true;
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
    paymentDate: formatDateFns(paymentData.paymentDate, "yyyy-MM-dd"),
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
    advanceDate: formatDateFns(advanceData.advanceDate, "yyyy-MM-dd"),
    reason: advanceData.reason || "",
    status: "Pending", 
  };
  await newDocRef.set(newAdvance);
  return newAdvance;
}
