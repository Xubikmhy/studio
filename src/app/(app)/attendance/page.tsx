import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, ListFilter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Placeholder Attendance Data
const attendanceRecords = [
  { id: "1", date: "2024-07-28", checkIn: "09:03 AM", checkOut: "05:32 PM", totalHours: "8h 29m" },
  { id: "2", date: "2024-07-27", checkIn: "08:58 AM", checkOut: "06:05 PM", totalHours: "9h 07m" },
  { id: "3", date: "2024-07-26", checkIn: "09:15 AM", checkOut: "05:00 PM", totalHours: "7h 45m" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Tracking</h1>
            <p className="text-muted-foreground">Manage your daily check-ins, check-outs, and view attendance history.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="default"> {/* Changed from custom green to default (primary) */}
                <LogIn className="mr-2 h-4 w-4" /> Punch In
            </Button>
            <Button variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Punch Out
            </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>My Attendance Log</CardTitle>
                <CardDescription>Your recent attendance records.</CardDescription>
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
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell className="text-right">{record.totalHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {attendanceRecords.length === 0 && (
             <p className="text-muted-foreground text-center py-8">No attendance records found.</p>
           )}
        </CardContent>
      </Card>
      
      {/* Placeholder for Admin view or Team view */}
      {/* This section would be conditionally rendered based on user role */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Team Attendance Overview</CardTitle>
          <CardDescription>View attendance for your team members.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Team attendance details will be displayed here for managers/admins.</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
