
// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker"; 
import { handleLogSalaryPayment, fetchEmployees } from "@/lib/actions";
import { LogSalaryPaymentSchema, type LogSalaryPaymentState, type LogSalaryPaymentFormValues } from "@/lib/schemas/finance";
import type { EmployeeProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, CreditCard } from "lucide-react";

const initialState: LogSalaryPaymentState = {
  message: null,
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Logging Payment..." : "Log Payment"}
      <CreditCard className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function NewSalaryPaymentPage() {
  const [state, formAction] = useActionState(handleLogSalaryPayment, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  const form = useForm<LogSalaryPaymentFormValues>({
    resolver: zodResolver(LogSalaryPaymentSchema),
    defaultValues: {
      employeeId: "",
      amount: undefined,
      paymentDate: undefined,
      notes: "",
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
      // Optionally navigate back or refresh the finance page
      // router.push("/admin/finance"); 
    }
    
    form.clearErrors();
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          form.setError(fieldName as keyof LogSalaryPaymentFormValues, {
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
          <Link href="/admin/finance">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Finance</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Log New Salary Payment</h1>
          <p className="text-muted-foreground">Enter the details for the new salary payment record.</p>
        </div>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <Form {...form}>
          <form action={formAction} className="space-y-0">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Fill in all required payment information.</CardDescription>
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
                    <FormDescription>The employee receiving the payment.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (NPR)</FormLabel>
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
                    <FormDescription>The amount paid to the employee.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select payment date"
                    />
                    <FormDescription>The date the payment was made.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., July Salary, Bonus payment"
                        className="resize-y min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Any additional notes about this payment.</FormDescription>
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
                <Link href="/admin/finance">Cancel</Link>
              </Button>
              <SubmitButton />
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
