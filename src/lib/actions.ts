// @ts-nocheck
"use server";

import { CreateTaskSchema, type CreateTaskState } from "@/lib/schemas/task"; // Import from new location

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
