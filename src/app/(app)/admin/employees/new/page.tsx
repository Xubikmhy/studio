
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { handleCreateEmployee } from "@/lib/actions"; 
import { CreateEmployeeSchema, type CreateEmployeeState, type CreateEmployeeFormValues } from "@/lib/schemas/employee"; 
import { TEAMS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, UserPlus } from "lucide-react";

const initialState: CreateEmployeeState = {
  message: null,
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding Employee..." : "Add Employee"}
      <UserPlus className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function NewEmployeePage() {
  const [state, formAction] = useActionState(handleCreateEmployee, initialState); 
  const { toast } = useToast();

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(CreateEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      team: undefined, 
      roleInternal: "",
      baseSalary: undefined, 
    },
    // errors: state?.errors ? Object.entries(state.errors).reduce((acc, [key, value]) => {
    //   if (value && value.length > 0) {
    //     acc[key as keyof CreateEmployeeFormValues] = { type: 'manual', message: value.join(', ') };
    //   }
    //   return acc;
    // }, {} as any) : undefined, // Removed initial error setting from useForm, will be handled by useEffect
  });

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        form.reset(); 
      }
    }
    
    form.clearErrors(); // Clear previous errors before setting new ones
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          form.setError(fieldName as keyof CreateEmployeeFormValues, {
            type: 'server',
            message: fieldErrors.join(', '),
          });
        }
      });
    }
  }, [state, toast]); // Removed 'form' from dependencies

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/employees">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Employees</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Employee</h1>
          <p className="text-muted-foreground">Fill in the details below to create a new employee profile.</p>
        </div>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <Form {...form}>
          <form action={formAction} className="space-y-0">
            <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>Enter the required information for the new employee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormDescription>The employee's full legal name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>The employee's primary email address.</FormDescription>
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
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
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
                      <FormDescription>Assign the employee to a team.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleInternal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Designer" {...field} />
                      </FormControl>
                      <FormDescription>The employee's job title or role.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Salary (NPR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 50000"
                        {...field} // Spread field props first
                        value={field.value ?? ''} 
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : +value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>The employee's monthly base salary in NPR.</FormDescription>
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
                    <Link href="/admin/employees">Cancel</Link>
                </Button>
                <SubmitButton />
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
