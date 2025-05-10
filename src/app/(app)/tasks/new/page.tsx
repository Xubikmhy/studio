// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useEffect, useActionState } from "react"; 
import { useFormStatus } from "react-dom"; 

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
import { handleCreateTask } from "@/lib/actions"; 
import { CreateTaskSchema, type CreateTaskState, type CreateTaskFormValues } from "@/lib/schemas/task"; 
import { TEAMS, TASK_STATUSES, TASK_PRIORITIES, CURRENT_USER_DATA, EMPLOYEES_SAMPLE } from "@/lib/constants";
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
  const [state, formAction] = useActionState(handleCreateTask, initialState); 
  const { toast } = useToast();
  const isAdmin = CURRENT_USER_DATA.role === 'admin';

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      taskName: "",
      description: "",
      team: undefined, 
      assignedTo: isAdmin ? "" : CURRENT_USER_DATA.name,
      status: "To Do",
      priority: "Normal",
    },
    // Errors are now primarily set via form.setError in useEffect
  });

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }

    if (state?.success) {
      form.reset(); // Resets to defaultValues defined in useForm including isAdmin logic for assignedTo
    } 
    
    // Clear previous errors before setting new ones from action state
    form.clearErrors(); 
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          form.setError(fieldName as keyof CreateTaskFormValues, {
            type: 'server',
            message: fieldErrors.join(', '),
          });
        }
      });
    }
  }, [state, toast, form, isAdmin]); // isAdmin is needed if defaultValues in useForm depends on it for reset

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

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      {isAdmin ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an employee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EMPLOYEES_SAMPLE.map((employee) => (
                              <SelectItem key={employee.id} value={employee.name}>
                                {employee.name} ({employee.team})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                      )}
                      <FormDescription>
                        {isAdmin ? "Select the employee to assign this task to." : "This task will be assigned to you."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TASK_PRIORITIES.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Priority level of the task.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               {state?.errors?.general && ( // General errors can still be displayed if they exist
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