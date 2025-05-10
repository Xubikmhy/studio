"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog, ListFilter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { fetchEmployees } from "@/lib/actions";
import type { EmployeeProfile } from "@/lib/types"; // Import EmployeeProfile type

export default function AdminEmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
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
    }
    loadEmployees();
  }, [toast]);

  const handleFilter = () => {
    toast({
      title: "Filter Employees",
      description: "Employee filtering functionality is not yet implemented.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Employees",
      description: "Employee data export functionality is not yet implemented.",
    });
  };

  const handleEditEmployee = (employeeId: string) => {
    toast({
      title: "Edit Employee",
      description: `Editing employee ${employeeId}. (This is a simulated action)`,
    });
    // In a real app, you might navigate to an edit page:
    // router.push(`/admin/employees/${employeeId}/edit`);
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
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
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
                  <TableCell>{employee.roleInternal}</TableCell> {/* Displaying the job title/roleInternal */}
                  <TableCell>{employee.baseSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee.id)}>
                      <UserCog className="h-4 w-4" />
                      <span className="sr-only">Edit Employee</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {employees.length === 0 && !isLoading && (
             <p className="text-muted-foreground text-center py-8">No employees found. Start by adding a new employee.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}