
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
import { DatePicker } from "@/components/ui/date-picker";
import { handleAdminCreateManualAttendance, fetchEmployees } from "@/lib/actions";
import { ManualAttendanceEntrySchema, type ManualAttendanceEntryState, type ManualAttendanceEntryFormValues } from "@/lib/schemas/attendance";
import type { EmployeeProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, CalendarPlus } from "lucide-react";

const initialState: ManualAttendanceEntryState = {
  message: null,
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding Record..." : "Add Record"}
      <CalendarPlus className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function AdminNewManualAttendancePage() {
  const [state, formAction] = useActionState(handleAdminCreateManualAttendance, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  const form = useForm<ManualAttendanceEntryFormValues>({
    resolver: zodResolver(ManualAttendanceEntrySchema),
    defaultValues: {
      employeeId: "",
      date: undefined,
      checkInTime: "",
      checkOutTime: "",
    },
  });

  useEffect(() => {
    async function loadEmployees() {
      setIsLoadingEmployees(true);
      try {
        const fetchedEmployees = await fetchEmployees();
        setEmployees(fetchedEmployees);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load employee list.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEmployees(false);
      }
    }
    loadEmployees();
  }, [toast]);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
    if (state?.success) {
      form.reset();
      // router.push("/attendance"); // Or refresh if needed
    }
    
    form.clearErrors();
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          form.setError(fieldName as keyof ManualAttendanceEntryFormValues, {
            type: 'server',
            message: fieldErrors.join(', '),
          });
        }
      });
    }
  }, [state, toast, router]); // Removed 'form' from dependencies

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/attendance">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Attendance Log</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manually Add Attendance Record</h1>
          <p className="text-muted-foreground">Enter details for the attendance entry.</p>
        </div>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <Form {...form}>
          <form action={formAction} className="space-y-0">
            <CardHeader>
              <CardTitle>Attendance Details</CardTitle>
              <CardDescription>Fill in all required information for the record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.team})
                          </SelectItem>
                        ))}
                        {isLoadingEmployees && (
                           <SelectItem value="loading_placeholder_sel" disabled>Loading employees...</SelectItem>
                         )}
                         {!isLoadingEmployees && employees.length === 0 && (
                            <SelectItem value="no_employees_placeholder_sel" disabled>No employees found</SelectItem>
                         )}
                      </SelectContent>
                    </Select>
                    <FormDescription>The employee for this attendance record.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select attendance date"
                    />
                    <FormDescription>The date of attendance.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-In Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 09:00 AM" {...field} />
                      </FormControl>
                      <FormDescription>Format: HH:MM AM/PM</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-Out Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 05:30 PM" {...field} />
                      </FormControl>
                      <FormDescription>Format: HH:MM AM/PM</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {state?.errors?.general && (
                <FormMessage>{state.errors.general.join(", ")}</FormMessage>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/attendance">Cancel</Link>
              </Button>
              <SubmitButton />
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
