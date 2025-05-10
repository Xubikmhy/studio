
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog, ListFilter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EMPLOYEES_SAMPLE } from "@/lib/constants"; // Updated import
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Use employee data from constants
const employees = EMPLOYEES_SAMPLE;

export default function AdminEmployeesPage() {
  const { toast } = useToast();

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
                <TableHead>Role</TableHead> {/* Using the 'role' field which now corresponds to 'roleInternal' */}
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
                  <TableCell>{employee.role}</TableCell> {/* Displaying the job title/role */}
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
           {employees.length === 0 && (
             <p className="text-muted-foreground text-center py-8">No employees found. Start by adding a new employee.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
