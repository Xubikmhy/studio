import { AITaskSummarizer } from "@/components/tasks/ai-task-summarizer";

export default function AISummaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Task Summarization</h1>
        <p className="text-muted-foreground">
          Leverage AI to get insights from your daily task logs. Identify productivity trends and bottlenecks.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
           <AITaskSummarizer />
        </div>
      </div>
    </div>
  );
}
