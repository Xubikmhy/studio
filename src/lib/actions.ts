"use server";

import { z } from "zod";
import { summarizeDailyTasks as aiSummarizeDailyTasks } from "@/ai/flows/summarize-daily-tasks";
import type { SummarizeDailyTasksInput, SummarizeDailyTasksOutput } from "@/ai/flows/summarize-daily-tasks";

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
    };
  }
}
