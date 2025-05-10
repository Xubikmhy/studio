
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, TrendingDown, ListFilter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EMPLOYEES_SAMPLE } from "@/lib/constants";
import Link from "next/link";

// Placeholder Salary Payment Data
const salaryPayments = [
  { id: "sp1", employeeId: "1", employeeName: EMPLOYEES_SAMPLE[0].name, amount: 60000, paymentDate: "2024-07-30", notes: "July Salary" },
  { id: "sp2", employeeId: "2", employeeName: EMPLOYEES_SAMPLE[1].name, amount: 55000, paymentDate: "2024-07-30", notes: "July Salary" },
  { id: "sp3", employeeId: "4", employeeName: EMPLOYEES_SAMPLE[3].name, amount: 80000, paymentDate: "2024-07-29", notes: "July Salary + Bonus" },
];

// Placeholder Salary Advance Data
const salaryAdvances = [
  { id: "sa1", employeeId: "3", employeeName: EMPLOYEES_SAMPLE[2].name, amount: 5000, advanceDate: "2024-07-15", reason: "Medical Emergency", status: "Pending" },
  { id: "sa2", employeeId: "1", employeeName: EMPLOYEES_SAMPLE[0].name, amount: 10000, advanceDate: "2024-06-20", reason: "Personal", status: "Partially Repaid" },
  { id: "sa3", employeeId: "2", employeeName: EMPLOYEES_SAMPLE[1].name, amount: 7000, advanceDate: "2024-08-02", reason: "Urgent Need", status: "Approved" },
];

const getAdvanceStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending": return "warning";
    case "approved": return "info";
    case "repaid": return "success";
    case "partially repaid": return "secondary";
    default: return "outline";
  }
};


export default function AdminFinancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance Management</h1>
        <p className="text-muted-foreground">Manage employee salaries, payments, and advances.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Salary Payments</CardTitle>
              <CardDescription>Log and track employee salary payments.</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href="/admin/finance/new-payment">
                <PlusCircle className="mr-2 h-4 w-4" /> Log New Payment
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => console.log('Filter salary payments clicked')}>
                    <ListFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => console.log('Export salary payments clicked')}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Amount (NPR)</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.employeeName}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{payment.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {salaryPayments.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No salary payments recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center"><TrendingDown className="mr-2 h-5 w-5 text-primary"/>Salary Advances</CardTitle>
              <CardDescription>Manage and track employee salary advances.</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href="/admin/finance/new-advance">
                <PlusCircle className="mr-2 h-4 w-4" /> Record New Advance
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
             <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => console.log('Filter salary advances clicked')}>
                    <ListFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => console.log('Export salary advances clicked')}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Amount (NPR)</TableHead>
                  <TableHead>Advance Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryAdvances.map((advance) => (
                  <TableRow key={advance.id}>
                    <TableCell className="font-medium">{advance.employeeName}</TableCell>
                    <TableCell>{advance.amount.toLocaleString()}</TableCell>
                    <TableCell>{advance.advanceDate}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={advance.reason}>{advance.reason}</TableCell>
                    <TableCell>
                      <Badge variant={getAdvanceStatusVariant(advance.status) as any}>{advance.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {salaryAdvances.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No salary advances recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of key financial metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg bg-card/50">
                <p className="text-sm font-medium text-muted-foreground">Total Salaries Paid (This Month)</p>
                <p className="text-2xl font-bold text-foreground">NPR 195,000</p> 
            </div>
            <div className="p-4 border rounded-lg bg-card/50">
                <p className="text-sm font-medium text-muted-foreground">Total Advances Outstanding</p>
                <p className="text-2xl font-bold text-foreground">NPR 22,000</p>
            </div>
             <div className="p-4 border rounded-lg bg-card/50">
                <p className="text-sm font-medium text-muted-foreground">Employees with Advances</p>
                <p className="text-2xl font-bold text-foreground">3</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
