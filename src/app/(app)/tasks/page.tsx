import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter } from "lucide-react";
import { AITaskSummarizer } from "@/components/tasks/ai-task-summarizer";
import Link from "next/link";

// Placeholder Task Data
const tasks = [
  { id: "1", name: "Design new brochure", status: "Ongoing", team: "Computer Team", assignedTo: "Alice" },
  { id: "2", name: "Print 1000 flyers", status: "Finished", team: "Printing Team", assignedTo: "Bob" },
  { id: "3", name: "Client meeting", status: "Finished", team: "Marketing & Accounts Team", assignedTo: "Charlie" },
  { id: "4", name: "Update website content", status: "Ongoing", team: "Computer Team", assignedTo: "Alice" },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Tasks</h1>
          <p className="text-muted-foreground">Log, track, and manage all your team's tasks efficiently.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filter Tasks
            </Button>
            <Button asChild>
                 <Link href="/tasks/new"> {/* Placeholder for actual new task page */}
                    <PlusCircle className="mr-2 h-4 w-4" /> Log New Task
                </Link>
            </Button>
        </div>
      </div>
      
      {/* Task List Placeholder */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Current Tasks</CardTitle>
          <CardDescription>A list of tasks currently active or recently completed.</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex justify-between items-center p-3 bg-background rounded-md border hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-medium text-foreground">{task.name}</p>
                    <p className="text-xs text-muted-foreground">{task.team} - Assigned to {task.assignedTo}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${task.status === "Finished" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No tasks found. Start by logging a new task!</p>
          )}
        </CardContent>
      </Card>

      {/* AI Task Summarizer Section */}
      <div className="pt-8">
         <AITaskSummarizer />
      </div>
    </div>
  );
}
