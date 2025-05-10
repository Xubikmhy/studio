
// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useEffect, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

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
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEmployeeById, handleUpdateEmployee } from "@/lib/actions";
import { UpdateEmployeeSchema, type UpdateEmployeeState, type UpdateEmployeeFormValues } from "@/lib/schemas/employee";
import type { EmployeeProfile } from "@/lib/types";
import { TEAMS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";

const initialState: UpdateEmployeeState = {
  message: null,
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving Changes..." : "Save Changes"}
      <Save className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const employeeId = params.id;
  const router = useRouter();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Bind employeeId to the server action
  const updateEmployeeActionWithId = handleUpdateEmployee.bind(null, employeeId);
  const [state, formAction] = useActionState(updateEmployeeActionWithId, initialState);

  const form = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(UpdateEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      team: undefined,
      roleInternal: "",
      baseSalary: undefined,
    },
  });

  useEffect(() => {
    async function loadEmployee() {
      if (!employeeId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedEmployee = await fetchEmployeeById(employeeId);
        if (fetchedEmployee) {
          setEmployee(fetchedEmployee);
          form.reset({
            name: fetchedEmployee.name,
            email: fetchedEmployee.email,
            team: fetchedEmployee.team,
            roleInternal: fetchedEmployee.roleInternal,
            baseSalary: fetchedEmployee.baseSalary,
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load employee:", error);
        toast({
          title: "Error",
          description: "Failed to load employee data.",
          variant: "destructive",
        });
        setNotFound(true); // Treat as not found on error
      }
      setIsLoading(false);
    }
    loadEmployee();
  }, [employeeId, form, toast]);


  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
    if (state?.success) {
        router.push("/admin/employees");
    }
    // Clear previous server errors and set new ones if they exist
    form.clearErrors();
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          form.setError(fieldName as keyof UpdateEmployeeFormValues, {
            type: 'server',
            message: fieldErrors.join(', '),
          });
        }
      });
    }
  }, [state, toast, form, router]);


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-64 mb-1" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6 text-center py-10">
         <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Not Found</h1>
        <p className="text-muted-foreground">The employee you are trying to edit does not exist or could not be loaded.</p>
        <Button asChild>
          <Link href="/admin/employees">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Employees List
          </Link>
        </Button>
      </div>
    );
  }


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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Employee Profile</h1>
          <p className="text-muted-foreground">Update the details for {employee?.name || "employee"}.</p>
        </div>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <Form {...form}>
          <form action={formAction} className="space-y-0">
            <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>Modify the required information for the employee.</CardDescription>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        {...field}
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
