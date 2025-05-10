// SummarizeDailyTasks.ts
'use server';

/**
 * @fileOverview Summarizes daily task logs and identifies productivity bottlenecks.
 *
 * - summarizeDailyTasks - A function that handles the summarization of daily tasks.
 * - SummarizeDailyTasksInput - The input type for the summarizeDailyTasks function.
 * - SummarizeDailyTasksOutput - The return type for the summarizeDailyTasks function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeDailyTasksInputSchema = z.object({
  taskLogs: z.string().describe('A detailed log of daily tasks performed by employees.'),
});
export type SummarizeDailyTasksInput = z.infer<typeof SummarizeDailyTasksInputSchema>;

const SummarizeDailyTasksOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the daily task logs.'),
  bottlenecks: z.string().describe('Identified productivity bottlenecks and potential areas for improvement.'),
});
export type SummarizeDailyTasksOutput = z.infer<typeof SummarizeDailyTasksOutputSchema>;

export async function summarizeDailyTasks(input: SummarizeDailyTasksInput): Promise<SummarizeDailyTasksOutput> {
  return summarizeDailyTasksFlow(input);
}

const summarizeDailyTasksPrompt = ai.definePrompt({
  name: 'summarizeDailyTasksPrompt',
  input: {schema: SummarizeDailyTasksInputSchema},
  output: {schema: SummarizeDailyTasksOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing daily task logs and identifying productivity bottlenecks.

  Given the following task logs, provide a concise summary and highlight any potential bottlenecks that may be hindering team performance.

  Task Logs:
  {{taskLogs}}

  Summary:
  Bottlenecks:
  `,
});

const summarizeDailyTasksFlow = ai.defineFlow(
  {
    name: 'summarizeDailyTasksFlow',
    inputSchema: SummarizeDailyTasksInputSchema,
    outputSchema: SummarizeDailyTasksOutputSchema,
  },
  async input => {
    const {output} = await summarizeDailyTasksPrompt(input);
    return output!;
  }
);
