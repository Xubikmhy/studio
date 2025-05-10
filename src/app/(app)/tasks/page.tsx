
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { PlusCircle, ListFilter, AlertTriangle } from "lucide-react"; // Added AlertTriangle for urgent tasks
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { TaskStatus, TaskPriority } from "@/lib/constants"; // Added TaskPriority
import { CURRENT_USER_DATA, ALL_TASKS, UrgentTaskIcon } from "@/lib/constants";
import { cn } from "@/lib/utils";

const getTaskStatusVariant = (status: TaskStatus): BadgeProps['variant'] => {
  switch (status) {
    case "Finished":
      return "success";
    case "Ongoing":
      return "info";
    case "To Do":
      return "secondary";
    case "Blocked":
      return "destructive";
    default:
      return "outline";
  }
};

export default function TasksPage() {
  const { toast } = useToast();
  const currentUser = CURRENT_USER_DATA;
  const isAdmin = currentUser.role === 'admin';

  const tasks = isAdmin
    ? ALL_TASKS
    : ALL_TASKS.filter(task => task.assignedTo === currentUser.name);

  const handleFilterTasks = () => {
    toast({
      title: "Filter Tasks",
      description: "Task filtering functionality (simulated). This feature is not yet implemented.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isAdmin ? "All Tasks" : "My Tasks"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Log, track, and manage all tasks across the company." : "Log, track, and manage your assigned tasks efficiently."}
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleFilterTasks}>
                <ListFilter className="mr-2 h-4 w-4" /> Filter Tasks
            </Button>
            <Button asChild>
                 <Link href="/tasks/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Log New Task
                </Link>
            </Button>
        </div>
      </div>
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>{isAdmin ? "Task List" : "My Task List"}</CardTitle>
          <CardDescription>
            {isAdmin ? "A list of all tasks currently active or recently completed." : "A list of your tasks currently active or recently completed."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map(task => (
                <li 
                  key={task.id} 
                  className={cn(
                    "flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-card rounded-md border hover:shadow-sm transition-shadow duration-150 gap-3 sm:gap-4",
                    task.priority === "Urgent" && "border-destructive/70 ring-1 ring-destructive/30"
                  )}
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      {task.priority === "Urgent" && (
                        <UrgentTaskIcon className="h-5 w-5 text-destructive shrink-0" />
                      )}
                      <p className="font-medium text-foreground">{task.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 pl-1">
                      Team: {task.team}
                      {isAdmin && ` - Assigned to: ${task.assignedTo}`}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 self-start sm:self-center">
                     {task.priority === "Urgent" && (
                        <Badge variant="destructive" className="text-xs hidden sm:inline-flex">Urgent</Badge>
                     )}
                    <Badge variant={getTaskStatusVariant(task.status)} className="text-xs">{task.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {isAdmin ? "No tasks found in the system." : "No tasks assigned to you. Well done!"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
