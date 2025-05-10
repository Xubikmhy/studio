import { z } from "zod";
import { TEAMS, TASK_STATUSES } from "@/lib/constants";

export const CreateTaskSchema = z.object({
  taskName: z.string().min(3, { message: "Task name must be at least 3 characters." }),
  description: z.string().optional(),
  team: z.enum(TEAMS, { errorMap: () => ({ message: "Please select a valid team."}) }),
  assignedTo: z.string().min(2, { message: "Assignee name must be at least 2 characters." }),
  status: z.enum(TASK_STATUSES, { errorMap: () => ({ message: "Please select a valid status."}) }),
});

export interface CreateTaskState {
  message?: string | null;
  errors?: {
    taskName?: string[];
    description?: string[];
    team?: string[];
    assignedTo?: string[];
    status?: string[];
    general?: string[];
  } | null;
  success?: boolean;
}

// Infer the type from the schema for use in the form
export type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;
