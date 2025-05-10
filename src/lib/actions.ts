// @ts-nocheck
"use server";

import { z } from "zod";
import { summarizeDailyTasks as aiSummarizeDailyTasks } from "@/ai/flows/summarize-daily-tasks";
import type { SummarizeDailyTasksInput, SummarizeDailyTasksOutput } from "@/ai/flows/summarize-daily-tasks";
import { TEAMS, TASK_STATUSES } from "./constants";

const SummarizeSchema = z.object({
  taskLogs: z.string().min(10, "Task logs must be at least 10 characters long."),
});

export interface SummarizeState {
  message?: string | null;
  summary?: string | null;
  bottlenecks?: string | null;
  errors?: {
    taskLogs?: string[];
  } | null;
}

export async function handleSummarizeTasks(
  prevState: SummarizeState,
  formData: FormData
): Promise<SummarizeState> {
  const validatedFields = SummarizeSchema.safeParse({
    taskLogs: formData.get("taskLogs"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the task logs.",
    };
  }

  try {
    const input: SummarizeDailyTasksInput = {
      taskLogs: validatedFields.data.taskLogs,
    };
    const result: SummarizeDailyTasksOutput = await aiSummarizeDailyTasks(input);
    
    return {
      message: "Tasks summarized successfully.",
      summary: result.summary,
      bottlenecks: result.bottlenecks,
      errors: null,
    };
  } catch (error) {
    console.error("Error summarizing tasks:", error);
    return {
      message: "An error occurred while summarizing tasks. Please try again.",
      errors: null,
      summary: null,
      bottlenecks: null,
    };
  }
}


// Schema for creating a new task
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
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the task details.",
      success: false,
    };
  }

  // In a real application, you would save this data to a database.
  // For now, we'll just log it and return a success message.
  console.log("New Task Data:", validatedFields.data);

  // Simulate database operation
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    message: `Task "${validatedFields.data.taskName}" created successfully!`,
    errors: null,
    success: true,
  };
}
