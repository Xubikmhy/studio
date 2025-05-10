"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { handleSummarizeTasks, type SummarizeState } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BotMessageSquare, Lightbulb } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState: SummarizeState = {
  message: null,
  summary: null,
  bottlenecks: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Summarizing..." : "Summarize Tasks"}
      <BotMessageSquare className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function AITaskSummarizer() {
  const [state, formAction] = useFormState(handleSummarizeTasks, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: state.summary ? "Summary Ready" : "Notice",
        description: state.message,
        variant: state.summary ? "default" : "destructive",
      });
    } else if (state.message && state.errors) {
       toast({
        title: "Validation Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BotMessageSquare className="mr-2 h-6 w-6 text-primary" />
          AI-Powered Task Summary
        </CardTitle>
        <CardDescription>
          Paste your daily task logs below to get a concise summary and identify potential productivity bottlenecks.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="taskLogs" className="text-base font-medium">Daily Task Logs</Label>
            <Textarea
              id="taskLogs"
              name="taskLogs"
              placeholder="Enter detailed task logs here. For example:&#10;John D. - Designed poster for Client X (Finished)&#10;Jane S. - Operated offset printer for 500 copies (Finished)&#10;Mike B. - Coordinated with marketing team for campaign (Ongoing)"
              rows={10}
              className="mt-1 text-sm"
              aria-describedby="taskLogs-error"
            />
            {state.errors?.taskLogs && (
              <p id="taskLogs-error" className="text-sm text-destructive mt-1">
                {state.errors.taskLogs.join(", ")}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>

      {state.summary && (
        <div className="p-6 border-t">
          <Alert className="bg-primary/5 border-primary/20">
            <Terminal className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">Summary</AlertTitle>
            <AlertDescription className="text-foreground whitespace-pre-wrap">
              {state.summary}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {state.bottlenecks && (
        <div className="p-6 border-t pt-0">
          <Alert className="bg-accent/5 border-accent/20">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
            <AlertTitle className="text-accent-foreground font-semibold">Productivity Bottlenecks</AlertTitle>
            <AlertDescription className="text-foreground whitespace-pre-wrap">
              {state.bottlenecks}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
