import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog, ListFilter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TEAMS } from "@/lib/constants";

// Placeholder Employee Data
const employees = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", team: TEAMS[1], role: "Designer" },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", team: TEAMS[2], role: "Printer Operator" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", team: TEAMS[4], role: "Account Manager" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", team: TEAMS[0], role: "Manager" },
];

export default function AdminEmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Employees</h1>
            <p className="text-muted-foreground">Add, edit, or remove employee profiles.</p>
        </div>
        <Button> {/* Link to add employee page */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>Employee List</CardTitle>
                <CardDescription>All registered employees in the system.</CardDescription>
            </div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm">
                    <ListFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm">
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell><Badge variant="secondary">{employee.team}</Badge></TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
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
