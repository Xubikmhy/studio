
import { z } from "zod";

// --- Salary Payment Schema ---
export const LogSalaryPaymentSchema = z.object({
  employeeId: z.string().min(1, { message: "Please select an employee." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  paymentDate: z.date({
    required_error: "Payment date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  notes: z.string().max(500, { message: "Notes cannot exceed 500 characters." }).optional(),
});

export interface LogSalaryPaymentState {
  message?: string | null;
  errors?: {
    employeeId?: string[];
    amount?: string[];
    paymentDate?: string[];
    notes?: string[];
    general?: string[];
  } | null;
  success?: boolean;
}

export type LogSalaryPaymentFormValues = z.infer<typeof LogSalaryPaymentSchema>;


// --- Salary Advance Schema ---
export const RecordSalaryAdvanceSchema = z.object({
    employeeId: z.string().min(1, { message: "Please select an employee." }),
    amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
    advanceDate: z.date({
        required_error: "Advance date is required.",
        invalid_type_error: "That's not a valid date!",
    }),
    reason: z.string().max(200, { message: "Reason cannot exceed 200 characters." }).optional(),
    // Status will likely be set by admin flow, not directly by user on initial record. Default to Pending.
});

export interface RecordSalaryAdvanceState {
    message?: string | null;
    errors?: {
        employeeId?: string[];
        amount?: string[];
        advanceDate?: string[];
        reason?: string[];
        general?: string[];
    } | null;
    success?: boolean;
}

export type RecordSalaryAdvanceFormValues = z.infer<typeof RecordSalaryAdvanceSchema>;
