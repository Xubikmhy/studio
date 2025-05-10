
import { z } from "zod";
import { TEAMS } from "@/lib/constants";

export const CreateEmployeeSchema = z.object({
  name: z.string().min(3, { message: "Full name must be at least 3 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  team: z.enum(TEAMS, { errorMap: () => ({ message: "Please select a valid team."}) }),
  roleInternal: z.string().min(2, { message: "Role/Job title must be at least 2 characters." }).max(50),
  baseSalary: z.coerce.number().positive({ message: "Base salary must be a positive number." }),
});

export interface CreateEmployeeState {
  message?: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    team?: string[];
    roleInternal?: string[];
    baseSalary?: string[];
    general?: string[];
  } | null;
  success?: boolean;
}

export type CreateEmployeeFormValues = z.infer<typeof CreateEmployeeSchema>;
