
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListFilter, Download, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CURRENT_USER_DATA, ALL_ATTENDANCE_RECORDS } from "@/lib/constants";

export default function AttendancePage() {
  const { toast } = useToast();
  const currentUser = CURRENT_USER_DATA;
  const isAdmin = currentUser.role === 'admin';

  const attendanceRecords = isAdmin 
    ? ALL_ATTENDANCE_RECORDS 
    : ALL_ATTENDANCE_RECORDS.filter(record => record.employeeId === currentUser.id);

  const handleFilter = () => {
    toast({
      title: "Filter Attendance",
      description: "Filtering attendance records (simulated). This feature is not yet implemented.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Attendance",
      description: "Exporting attendance data (simulated). This feature is not yet implemented.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isAdmin ? "Company Attendance Log" : "My Attendance Log"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "View all employee check-ins, check-outs, and attendance history." : "View your daily check-ins, check-outs, and attendance history."}
            </p>
        </div>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>{isAdmin ? "All Records" : "My Records"}</CardTitle>
                <CardDescription>
                  {isAdmin ? "Recent attendance records for all employees." : "Your recent attendance records."}
                </CardDescription>
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
                {isAdmin && <TableHead>Employee Name</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  {isAdmin && <TableCell className="font-medium">{record.employeeName}</TableCell>}
                  <TableCell className={!isAdmin ? "font-medium" : ""}>{record.date}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell className="text-right">{record.totalHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {attendanceRecords.length === 0 && (
             <p className="text-muted-foreground text-center py-8">
               {isAdmin ? "No attendance records found for any employee." : "No attendance records found for you."}
             </p>
           )}
        </CardContent>
      </Card>
      
      {isAdmin && (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Team Attendance Overview</CardTitle>
            <CardDescription>View attendance summaries and metrics for teams/departments. (Admin View - Simulated)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Detailed team attendance analytics and reporting tools would be displayed here.</p>
            {/* Placeholder for charts or summary tables */}
            <div className="mt-4 p-4 border rounded-lg bg-card/50">
                <p className="text-sm font-medium text-muted-foreground">Overall Company Attendance (Today)</p>
                <p className="text-xl font-bold text-foreground">85%</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
