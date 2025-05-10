// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormState, useFormStatus } from "react-dom";
import type * as z from "zod";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { handleCreateTask, CreateTaskSchema, type CreateTaskState } from "@/lib/actions";
import { TEAMS, TASK_STATUSES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Send } from "lucide-react";

const initialState: CreateTaskState = {
  message: null,
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Logging Task..." : "Log Task"}
      <Send className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function NewTaskPage() {
  const [state, formAction] = useFormState(handleCreateTask, initialState);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof CreateTaskSchema>>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      taskName: "",
      description: "",
      team: undefined, 
      assignedTo: "",
      status: "To Do",
    },
    // Pass server-side errors to the form
    errors: state?.errors ? Object.entries(state.errors).reduce((acc, [key, value]) => {
      if (value && value.length > 0) {
        acc[key] = { type: 'manual', message: value.join(', ') };
      }
      return acc;
    }, {}) : undefined,
  });

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        form.reset(); // Reset form on successful submission
      }
    }
     // Reset form errors when server-side errors change
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          form.setError(fieldName as keyof z.infer<typeof CreateTaskSchema>, {
            type: 'server',
            message: fieldErrors.join(', '),
          });
        }
      });
    } else if (!state?.success) { // Clear errors if no server errors and not a success state (e.g. initial load)
        form.clearErrors();
    }

  }, [state, toast, form]);

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/tasks">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Tasks</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Log New Task</h1>
          <p className="text-muted-foreground">Fill in the details below to create a new task.</p>
        </div>
      </div>

      <Card className="shadow-md">
        <Form {...form}>
          <form action={formAction} className="space-y-0">
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="taskName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Design new logo" {...field} />
                    </FormControl>
                    <FormDescription>A brief name for the task.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide more details about the task..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Any additional information or context.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TEAMS.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Which team is responsible for this task?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormDescription>Who is assigned to complete this task?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Current status of the task.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {state?.errors?.general && (
                <FormMessage>{state.errors.general.join(", ")}</FormMessage>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-6">
                <Button variant="outline" asChild>
                    <Link href="/tasks">Cancel</Link>
                </Button>
                <SubmitButton />
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
