
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog, ListFilter, Download, Trash2, UserX, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { fetchEmployees, deleteEmployee } from "@/lib/actions";
import type { EmployeeProfile } from "@/lib/types"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { arrayToCsv, downloadCsv } from "@/lib/csv-utils";


export default function AdminEmployeesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeProfile | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const fetchedEmployees = await fetchEmployees();
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employee data.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []); 

  const handleFilter = () => {
    toast({
      title: "Filter Employees",
      description: "Employee filtering functionality is not yet implemented.",
    });
  };

  const handleExport = () => {
    if (employees.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no employees to export.",
      });
      return;
    }
    setIsExporting(true);
    try {
      const headers = ["Name", "Email", "Team", "Role", "Base Salary (NPR)"];
      const dataToExport = employees.map(emp => [
        emp.name,
        emp.email,
        emp.team,
        emp.roleInternal,
        emp.baseSalary.toString()
      ]);

      const csvString = arrayToCsv(headers, dataToExport);
      downloadCsv(csvString, "employee_list.csv");

      toast({
        title: "Export Successful",
        description: "Employee list has been downloaded.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting employee data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/admin/employees/${employeeId}/edit`);
  };

  const confirmDeleteEmployee = (employee: EmployeeProfile) => {
    setEmployeeToDelete(employee);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    const result = await deleteEmployee(employeeToDelete.id);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setEmployeeToDelete(null); // Close dialog
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Employees</h1>
              <p className="text-muted-foreground">Add, edit, or remove employee profiles.</p>
          </div>
          <Button asChild disabled>
            <Link href="/admin/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
            </Link>
          </Button>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>Loading employee data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Loading employees...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AlertDialog open={!!employeeToDelete} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setEmployeeToDelete(null);
      }
    }}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Employees</h1>
              <p className="text-muted-foreground">Add, edit, or remove employee profiles.</p>
          </div>
          <Button asChild>
            <Link href="/admin/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row justify-between items-center">
              <div>
                  <CardTitle>Employee List</CardTitle>
                  <CardDescription>All registered employees in the system.</CardDescription>
              </div>
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFilter}>
                      <ListFilter className="mr-2 h-4 w-4" /> Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      {isExporting ? "Exporting..." : "Export"}
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Base Salary (NPR)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell><Badge variant="secondary">{employee.team}</Badge></TableCell>
                    <TableCell>{employee.roleInternal}</TableCell> 
                    <TableCell>{employee.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee.id)} title="Edit Employee">
                        <UserCog className="h-4 w-4" />
                        <span className="sr-only">Edit Employee</span>
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteEmployee(employee)} title="Delete Employee">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete Employee</span>
                        </Button>
                      </AlertDialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {employees.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                  <UserX className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No employees found.</p>
                  <p className="text-sm">Start by adding a new employee to the system.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialogContent>
          {employeeToDelete ? (
              <>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the employee profile for <strong>{employeeToDelete.name}</strong> and all associated data (like tasks and attendance records).
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Yes, delete employee
                </AlertDialogAction>
                </AlertDialogFooter>
              </>
            ) : (
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>Preparing to delete an employee...</AlertDialogDescription>
              </AlertDialogHeader>
            )
          }
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
