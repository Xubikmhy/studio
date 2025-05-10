"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Clock, Users2, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; 
import { CURRENT_USER_DATA, UrgentTaskIcon, INITIAL_ATTENDANCE_RECORDS, INITIAL_TASKS } from "@/lib/constants"; // Keep INITIAL_ for recent activity simulation for now
import type { Task, AttendanceRecord } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { fetchUserTasks, punchIn, punchOut, fetchTodaysUserAttendance } from "@/lib/actions";

export default function DashboardPage() {
  const { toast } = useToast(); 
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [isPunching, setIsPunching] = useState(false);

  const currentUser = CURRENT_USER_DATA;
  const isAdmin = currentUser.role === 'admin';

  const loadDashboardData = useCallback(async () => {
    // Fetch user-specific task data
    const tasksForUser = await fetchUserTasks(currentUser.name);
    setUserTasks(tasksForUser);

    // Fetch user's attendance for today
    const attendanceRecord = await fetchTodaysUserAttendance(currentUser.id);
    setTodayAttendance(attendanceRecord);
  }, [currentUser.id, currentUser.name]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const userTasksCompleted = userTasks.filter(task => task.status === "Finished").length;
  const userTasksTotal = userTasks.length;
  const userTodayHours = todayAttendance?.totalHours || (todayAttendance?.checkIn && !todayAttendance?.checkOut ? "Punched In" : "N/A");


  const handlePunchIn = async () => {
    setIsPunching(true);
    const result = await punchIn(currentUser.id, currentUser.name);
    toast({
      title: result.success ? "Punch In Successful" : "Punch In Failed",
      description: result.message,
      variant: result.success ? "success" : "destructive", 
    });
    if (result.success) {
      setTodayAttendance(result.record || null);
    }
    setIsPunching(false);
  };

  const handlePunchOut = async () => {
    setIsPunching(true);
    const result = await punchOut(currentUser.id, currentUser.name);
    toast({
      title: result.success ? "Punch Out Successful" : "Punch Out Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive", 
    });
    if (result.success) {
      setTodayAttendance(result.record || null);
    }
    setIsPunching(false);
  };

  // Simulate recent activity from constants for now
  const recentActivityTasks = INITIAL_TASKS.filter(task => task.assignedTo === currentUser.name && task.priority === "Urgent" && task.status !== "Finished");
  const lastPunchIn = INITIAL_ATTENDANCE_RECORDS.find(rec => rec.employeeId === currentUser.id);


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
              {userTodayHours === "N/A" ? "Not punched in today" : (userTodayHours === "Punched In" ? `Checked in at ${todayAttendance?.checkIn}` : `Total hours logged today`)}
            </p>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="success" 
                onClick={handlePunchIn} 
                className="flex-1"
                disabled={isPunching || (!!todayAttendance?.checkIn && !todayAttendance?.checkOut)}
              >
                <LogIn className="mr-2 h-4 w-4" /> Punch In
              </Button>
              <Button 
                variant="destructive" 
                onClick={handlePunchOut} 
                className="flex-1"
                disabled={isPunching || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
              >
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
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => toast({ title: "Team Overview", description: "This feature is not yet implemented."})}> 
                View Team Details
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
          <CardDescription>Latest updates and notifications relevant to you. (Simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {recentActivityTasks.map(task => (
                 <li key={task.id} className="flex items-start p-2 hover:bg-muted rounded-md transition-colors">
                    <UrgentTaskIcon className="h-4 w-4 text-destructive mr-2 mt-0.5 shrink-0" />
                    <span><strong>URGENT:</strong> Task "{task.name}" assigned to you is marked as urgent and is {task.status}.</span>
                </li>
            ))}
            {lastPunchIn && (
                 <li className="p-2 hover:bg-muted rounded-md transition-colors">- You last punched in on {lastPunchIn.date} at {lastPunchIn.checkIn}.</li>
            )}
            <li className="p-2 hover:bg-muted rounded-md transition-colors">- New company announcement: "System Maintenance".</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}