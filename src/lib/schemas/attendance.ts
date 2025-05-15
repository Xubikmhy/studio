
import { z } from "zod";

const timeStringRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;

export const ManualAttendanceEntrySchema = z.object({
  employeeId: z.string().min(1, { message: "Please select an employee." }),
  date: z.date({
    required_error: "Date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  checkInTime: z.string().regex(timeStringRegex, { message: "Invalid check-in time format. Use HH:MM AM/PM." })
    .refine(val => !!val, { message: "Check-in time is required." }),
  checkOutTime: z.string().regex(timeStringRegex, { message: "Invalid check-out time format. Use HH:MM AM/PM." })
    .refine(val => !!val, { message: "Check-out time is required." }),
}).refine(data => {
    // Basic check that checkout is after checkin on the same day logic handled in action
    // This refinement is more about ensuring times are parseable with AM/PM correctly influencing hour
    const [cinHour, cinMinutePeriod] = data.checkInTime.split(':');
    const [cinMinute, cinPeriod] = cinMinutePeriod.split(' ');
    let cinH = parseInt(cinHour);
    if (cinPeriod.toUpperCase() === 'PM' && cinH !== 12) cinH += 12;
    if (cinPeriod.toUpperCase() === 'AM' && cinH === 12) cinH = 0; // Midnight case

    const [coutHour, coutMinutePeriod] = data.checkOutTime.split(':');
    const [coutMinute, coutPeriod] = coutMinutePeriod.split(' ');
    let coutH = parseInt(coutHour);
    if (coutPeriod.toUpperCase() === 'PM' && coutH !== 12) coutH += 12;
    if (coutPeriod.toUpperCase() === 'AM' && coutH === 12) coutH = 0; // Midnight case
    
    const checkInDate = new Date(data.date);
    checkInDate.setHours(cinH, parseInt(cinMinute), 0, 0);

    const checkOutDate = new Date(data.date);
    checkOutDate.setHours(coutH, parseInt(coutMinute), 0, 0);

    return checkOutDate > checkInDate;
  }, {
    message: "Check-out time must be after check-in time.",
    path: ["checkOutTime"], 
  });


export interface ManualAttendanceEntryState {
  message?: string | null;
  errors?: {
    employeeId?: string[];
    date?: string[];
    checkInTime?: string[];
    checkOutTime?: string[];
    general?: string[];
  } | null;
  success?: boolean;
}

export type ManualAttendanceEntryFormValues = z.infer<typeof ManualAttendanceEntrySchema>;
