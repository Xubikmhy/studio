
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge"; // Import Badge and BadgeProps
import { PlusCircle, ListFilter } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { TaskStatus } from "@/lib/constants";

// Placeholder Task Data
const tasks: Array<{ id: string; name: string; status: TaskStatus; team: string; assignedTo: string }> = [
  { id: "1", name: "Design new brochure", status: "Ongoing", team: "Computer Team", assignedTo: "Alice" },
  { id: "2", name: "Print 1000 flyers", status: "Finished", team: "Printing Team", assignedTo: "Bob" },
  { id: "3", name: "Client meeting", status: "Finished", team: "Marketing & Accounts Team", assignedTo: "Charlie" },
  { id: "4", name: "Update website content", status: "Ongoing", team: "Computer Team", assignedTo: "Alice" },
  { id: "5", name: "Fix binding machine", status: "To Do", team: "Binding Team", assignedTo: "David" },
  { id: "6", name: "Prepare monthly report", status: "Blocked", team: "Management Team", assignedTo: "Eve" },
];

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Tasks</h1>
          <p className="text-muted-foreground">Log, track, and manage all your team's tasks efficiently.</p>
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
          <CardTitle>Current Tasks</CardTitle>
          <CardDescription>A list of tasks currently active or recently completed.</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex justify-between items-center p-3 bg-background rounded-md border hover:shadow-sm transition-shadow duration-150">
                  <div>
                    <p className="font-medium text-foreground">{task.name}</p>
                    <p className="text-xs text-muted-foreground">{task.team} - Assigned to {task.assignedTo}</p>
                  </div>
                  <Badge variant={getTaskStatusVariant(task.status)}>{task.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No tasks found. Start by logging a new task!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
