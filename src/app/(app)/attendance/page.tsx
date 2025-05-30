
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListFilter, Download, Users, Loader2, PlusCircle } from "lucide-react"; // Added PlusCircle
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CURRENT_USER_DATA } from "@/lib/constants";
import type { AttendanceRecord } from "@/lib/types";
import { fetchAttendanceRecords, fetchUserAttendanceRecords } from "@/lib/actions";
import { arrayToCsv, downloadCsv } from "@/lib/csv-utils";
import Link from "next/link"; // Added Link

export default function AttendancePage() {
  const { toast } = useToast();
  const currentUser = CURRENT_USER_DATA;
  const isAdmin = currentUser.role === 'admin';
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadAttendance() {
      setIsLoading(true);
      try {
        const fetchedRecords = isAdmin 
          ? await fetchAttendanceRecords() 
          : await fetchUserAttendanceRecords(currentUser.id);
        setAttendanceRecords(fetchedRecords);
      } catch (error) {
        console.error("Failed to load attendance records:", error);
        toast({
          title: "Error",
          description: "Failed to load attendance data.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
    loadAttendance();
  }, [isAdmin, currentUser.id, toast]);


  const handleFilter = () => {
    toast({
      title: "Filter Attendance",
      description: "Filtering attendance records (simulated). This feature is not yet implemented.",
    });
  };

  const handleExport = () => {
    if (attendanceRecords.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no attendance records to export.",
        variant: "default" 
      });
      return;
    }
    setIsExporting(true);
    try {
      const headers = isAdmin 
        ? ["Employee Name", "Date", "Check-In", "Check-Out", "Total Hours"]
        : ["Date", "Check-In", "Check-Out", "Total Hours"];
      
      const dataToExport = attendanceRecords.map(record => {
        return isAdmin
          ? [record.employeeName, record.date, record.checkIn, record.checkOut, record.totalHours]
          : [record.date, record.checkIn, record.checkOut, record.totalHours];
      });

      const csvString = arrayToCsv(headers, dataToExport);
      const filename = isAdmin ? "company_attendance_log.csv" : "my_attendance_log.csv";
      downloadCsv(csvString, filename);

      toast({
        title: "Export Successful",
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting attendance data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  if (isLoading) {
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
             {isAdmin && (
                <Button asChild disabled>
                    <Link href="/admin/attendance/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Manually Add Record
                    </Link>
                </Button>
            )}
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isAdmin ? "All Records" : "My Records"}</CardTitle>
            <CardDescription>Loading attendance data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Loading attendance...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


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
         {isAdmin && (
            <Button asChild>
                <Link href="/admin/attendance/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Manually Add Record
                </Link>
            </Button>
        )}
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
                  <TableCell>{record.checkIn || "---"}</TableCell>
                  <TableCell>{record.checkOut || "---"}</TableCell>
                  <TableCell className="text-right">{record.totalHours || "---"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {attendanceRecords.length === 0 && !isLoading && (
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
                <p className="text-xl font-bold text-foreground">85% (Simulated)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
