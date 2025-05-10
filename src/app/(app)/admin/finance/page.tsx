
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, TrendingDown, ListFilter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SalaryPayment, SalaryAdvance } from "@/lib/types"; 
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { fetchSalaryPayments, fetchSalaryAdvances } from "@/lib/actions";


const getAdvanceStatusVariant = (status: SalaryAdvance['status']) => {
  switch (status.toLowerCase()) {
    case "pending": return "warning";
    case "approved": return "info";
    case "repaid": return "success";
    case "partially repaid": return "secondary";
    default: return "outline";
  }
};


export default function AdminFinancePage() {
  const { toast } = useToast();
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingAdvances, setIsLoadingAdvances] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoadingPayments(true);
      setIsLoadingAdvances(true);
      try {
        const [payments, advances] = await Promise.all([
          fetchSalaryPayments(),
          fetchSalaryAdvances()
        ]);
        setSalaryPayments(payments);
        setSalaryAdvances(advances);
      } catch (error) {
        console.error("Failed to load finance data:", error);
        toast({
          title: "Error",
          description: "Failed to load finance data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPayments(false);
        setIsLoadingAdvances(false);
      }
    }
    loadData();
  }, [toast]);


  const handleFilter = (type: string) => {
    toast({
      title: `Filter ${type}`,
      description: `Filtering ${type.toLowerCase()} (simulated). This feature is not yet implemented.`,
    });
  };

  const handleExport = (type: string) => {
    toast({
      title: `Export ${type}`,
      description: `Exporting ${type.toLowerCase()} (simulated). This feature is not yet implemented.`,
    });
  };

  const totalSalariesPaidThisMonth = salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAdvancesOutstanding = salaryAdvances.filter(a => a.status !== 'Repaid').reduce((sum, p) => sum + p.amount, 0);
  const employeesWithAdvancesCount = new Set(salaryAdvances.filter(a => a.status !== 'Repaid').map(a => a.employeeId)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance Management</h1>
        <p className="text-muted-foreground">Manage employee salaries, payments, and advances.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
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
                <Button variant="outline" size="sm" onClick={() => handleFilter('Salary Payments')}>
                    <ListFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('Salary Payments')}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
            {isLoadingPayments ? (
              <p className="text-muted-foreground text-center py-8">Loading salary payments...</p>
            ) : (
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
                  {salaryPayments.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-muted-foreground text-center py-8">No salary payments recorded yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center"><TrendingDown className="mr-2 h-5 w-5 text-primary"/>Salary Advances</CardTitle>
              <CardDescription>Manage and track employee salary advances.</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href="/admin/finance/new-advance"> {/* TODO: Create this page */}
                <PlusCircle className="mr-2 h-4 w-4" /> Record New Advance
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
             <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => handleFilter('Salary Advances')}>
                    <ListFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('Salary Advances')}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
            {isLoadingAdvances ? (
              <p className="text-muted-foreground text-center py-8">Loading salary advances...</p>
            ) : (
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
                  {salaryAdvances.length === 0 && (
                     <TableRow><TableCell colSpan={5} className="text-muted-foreground text-center py-8">No salary advances recorded yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of key financial metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg bg-card/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground">Total Salaries Paid (This Month)</p>
                <p className="text-2xl font-bold text-foreground">NPR {isLoadingPayments ? "..." : totalSalariesPaidThisMonth.toLocaleString()}</p> 
            </div>
            <div className="p-4 border rounded-lg bg-card/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground">Total Advances Outstanding</p>
                <p className="text-2xl font-bold text-foreground">NPR {isLoadingAdvances ? "..." : totalAdvancesOutstanding.toLocaleString()}</p>
            </div>
             <div className="p-4 border rounded-lg bg-card/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground">Employees with Advances</p>
                <p className="text-2xl font-bold text-foreground">{isLoadingAdvances ? "..." : employeesWithAdvancesCount}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
