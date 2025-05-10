'use server';
/**
 * @fileOverview A Genkit flow to generate placeholder report content.
 *
 * - generateReport - A function that handles the report generation process.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  reportType: z.string().describe('The type of report to generate (e.g., "Daily Attendance", "Task Completion - Last 7 Days").'),
  params: z.record(z.string(), z.string()).optional().describe('Additional parameters for the report, like date range or team.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  title: z.string().describe('The title of the generated report.'),
  content: z.string().describe('The placeholder content of the generated report.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest', // Added model specification
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an administrative assistant tasked with generating placeholder report content.
The user has requested a report with the following details:
Report Type: "{{reportType}}"

{{#if params}}
Additional Parameters:
{{#each params}}
- {{this.key}}: {{this.value}}
{{/each}}
{{/if}}

Based on this, generate a plausible, concise placeholder title and content for this report.
The content should be a few lines long and sound like a summary.
For example, if the reportType is "Daily Attendance Report for Computer Team", the title might be "Daily Attendance Summary - Computer Team" and content could be "All members of the Computer Team were present today. No absences reported. Full logs available in the system."
If the reportType is "Task Completion Report - Last 7 Days", title could be "Weekly Task Completion Summary" and content "Overall task completion rate for the past week was 85%. 15 tasks completed, 3 overdue. Detailed breakdown available."

Generate the report now. Ensure the title is relevant to the reportType and params.
Keep the content to 3-5 sentences.
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input: GenerateReportInput) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate report content from AI.");
    }
    return output;
  }
);
