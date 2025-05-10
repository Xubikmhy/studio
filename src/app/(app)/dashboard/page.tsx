
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Clock, Users2, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; 
import { CURRENT_USER_DATA, ALL_TASKS, ALL_ATTENDANCE_RECORDS } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { toast } = useToast(); 
  const [userTasksCompleted, setUserTasksCompleted] = useState(0);
  const [userTasksTotal, setUserTasksTotal] = useState(0);
  const [userTodayHours, setUserTodayHours] = useState("N/A");

  const currentUser = CURRENT_USER_DATA;
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    // Simulate fetching user-specific task data
    const tasksForUser = ALL_TASKS.filter(task => task.assignedTo === currentUser.name);
    setUserTasksCompleted(tasksForUser.filter(task => task.status === "Finished").length);
    setUserTasksTotal(tasksForUser.length);

    // Simulate fetching user's attendance for today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayRecord = ALL_ATTENDANCE_RECORDS.find(
      record => record.employeeId === currentUser.id && record.date === today
    );
    setUserTodayHours(todayRecord?.totalHours || "0h 0m");

  }, [currentUser.id, currentUser.name]);


  const handlePunchIn = () => {
    toast({
      title: "Punch In Successful",
      description: `Welcome, ${currentUser.name}! Your check-in has been recorded (simulated).`,
      variant: "success", 
    });
    // Simulate updating attendance, e.g., setUserTodayHours if this were a real punch-in
  };

  const handlePunchOut = () => {
    toast({
      title: "Punch Out Successful",
      description: `Goodbye, ${currentUser.name}! Your check-out has been recorded (simulated).`,
      variant: "default", 
    });
     // Simulate updating attendance
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser.name}! Here's an overview of your activities.</p>
        </div>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/tasks/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Log New Task
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Attendance
            </CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userTodayHours}</div>
            <p className="text-xs text-muted-foreground">
              Total hours logged today
            </p>
            
            <div className="mt-4 flex gap-2">
              <Button variant="success" onClick={handlePunchIn} className="flex-1">
                <LogIn className="mr-2 h-4 w-4" /> Punch In
              </Button>
              <Button variant="destructive" onClick={handlePunchOut} className="flex-1">
                <LogOut className="mr-2 h-4 w-4" /> Punch Out
              </Button>
            </div>

            <Button variant="link" size="sm" className="mt-2 w-full justify-center text-sm" asChild>
              <Link href="/attendance">View Full Attendance Log</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Tasks
            </CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userTasksCompleted} / {userTasksTotal}</div>
            <p className="text-xs text-muted-foreground">
              Completed / Total tasks assigned
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/tasks">View Tasks</Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Overview
              </CardTitle>
              <Users2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Quick summary of team activities and productivity metrics. (Admin View)
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full"> 
                View Team Details (Simulated)
              </Button>
            </CardContent>
          </Card>
        )}
         {!isAdmin && (
             <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Team</CardTitle>
                    <Users2 className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold text-foreground">{currentUser.team}</p>
                    <p className="text-xs text-muted-foreground">Your current team assignment.</p>
                </CardContent>
            </Card>
        )}
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications relevant to you.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* This would be dynamically populated based on user's activities or relevant system events */}
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="p-2 hover:bg-muted rounded-md transition-colors">- Task "Design new brochure" updated to Ongoing.</li>
            <li className="p-2 hover:bg-muted rounded-md transition-colors">- You punched in at 9:03 AM.</li>
            <li className="p-2 hover:bg-muted rounded-md transition-colors">- New company announcement: "System Maintenance".</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
