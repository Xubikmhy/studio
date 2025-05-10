
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, CalendarDays, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminReportsPage() {
  const { toast } = useToast();

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Generate Report",
      description: `Generating ${reportType} (simulated). This feature is not yet implemented.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Generate Reports</h1>
        <p className="text-muted-foreground">Access detailed reports for attendance, tasks, and team productivity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Attendance Reports</CardTitle>
            <CardDescription>Generate daily, weekly, or monthly attendance summaries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Attendance</SelectItem>
                <SelectItem value="weekly">Weekly Attendance</SelectItem>
                <SelectItem value="monthly">Monthly Attendance</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => handleGenerateReport('Attendance Report')}>
              <Download className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CalendarDays className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Task Completion Reports</CardTitle>
            <CardDescription>Track task progress and completion rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => handleGenerateReport('Task Completion Report')}>
              <Download className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Team Productivity Reports</CardTitle>
            <CardDescription>Analyze productivity across different teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {/* Dynamically populate teams here */}
                <SelectItem value="computer">Computer Team</SelectItem>
                <SelectItem value="printing">Printing Team</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => handleGenerateReport('Team Productivity Report')}>
              <Download className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
