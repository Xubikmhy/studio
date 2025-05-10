import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your activities.</p>
        </div>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/tasks/new"> {/* Assuming a route to create new task */}
                    <PlusCircle className="mr-2 h-4 w-4" /> Log New Task
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Attendance
            </CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8h 15m</div>
            <p className="text-xs text-muted-foreground">
              Total hours logged today
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/attendance">View Attendance</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Tasks
            </CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3 / 5</div>
            <p className="text-xs text-muted-foreground">
              Completed / Total tasks assigned
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/tasks">View Tasks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Overview (Placeholder)
            </CardTitle>
             {/* Icon for Team */}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Summary of team activities and productivity will be shown here.
            </p>
            {/* More detailed team stats or links can be added */}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for recent activity or important notifications */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>- Task "Design new brochure" marked as Ongoing.</li>
            <li>- Punched in at 9:03 AM.</li>
            <li>- New company announcement posted.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
