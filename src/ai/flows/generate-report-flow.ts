'use server';
/**
 * @fileOverview A Genkit flow to generate placeholder report content in CSV format,
 * which can be easily imported into Google Sheets.
 *
 * - generateReport - A function that handles the report generation process.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function (CSV content and filename).
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';

const GenerateReportInputSchema = z.object({
  reportType: z.string().describe('The type of report to generate (e.g., "Daily Attendance", "Task Completion - Last 7 Days").'),
  params: z.record(z.string(), z.string()).optional().describe('Additional parameters for the report, like date range or team.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  fileName: z.string().describe('A suitable CSV filename for the report, ending with .csv (e.g., "daily_attendance_report.csv").'),
  csvContent: z.string().describe('The CSV formatted string content of the report. It must include a header row and 2-3 rows of plausible placeholder data. Ensure proper CSV escaping if commas or quotes are in the data itself. This format is compatible with Google Sheets.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportCsvPrompt',
  model: 'googleai/gemini-1.5-pro-latest', // Changed model
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an administrative assistant tasked with generating placeholder report data in CSV format, suitable for import into Google Sheets.
The user has requested a report with the following details:
Report Type: "{{reportType}}"

{{#if params}}
Additional Parameters:
{{#each params}}
- {{this.key}}: {{this.value}}
{{/each}}
{{/if}}

Based on this, generate:
1. A suitable CSV filename (ending in .csv). The filename should be descriptive and based on the reportType and params. For example, if reportType is "Daily Attendance Report for Computer Team" and params include a period, a good filename might be "daily_attendance_computer_team.csv" or "weekly_attendance_computer_team.csv".
2. The CSV content as a string. This CSV string MUST:
   a. Start with a header row. Choose appropriate column headers based on the report type (e.g., for attendance: Employee Name, Date, Check-In Time, Check-Out Time, Status; for tasks: Task ID, Task Name, Assigned To, Status, Due Date, Completion Date).
   b. Include 2 to 3 rows of plausible, concise placeholder data relevant to the report type and parameters.
   c. Ensure values are properly comma-separated. If a value itself contains a comma, enclose the value in double quotes (e.g., "Value, with comma"). If a value contains a double quote, escape it with another double quote (e.g., "Value with ""quote""").
   d. For any dates in the placeholder data, use a generic YYYY-MM-DD format (e.g., '2023-10-26'). Do not use the current real date unless the report type specifically implies it (e.g., a report for 'today').
   e. Ensure the generated CSV is plain text and does not include any specific Google Sheets formatting like functions or cell colors, as it's just the data for import.

Example for Report Type "Daily Attendance Report for Computer Team":
FileName: "daily_attendance_computer_team_2023-10-26.csv"
CSV Content:
Employee Name,Date,Check-In Time,Check-Out Time,Status
Alice Wonderland,2023-10-26,09:00 AM,05:00 PM,Present
Bob The Builder,2023-10-26,09:15 AM,,Present (No Check-Out)
Charlie Brown,2023-10-26,08:55 AM,05:30 PM,Present

Example for Report Type "Task Completion Report - Last 7 Days":
FileName: "task_completion_last_7_days.csv"
CSV Content:
Task ID,Task Name,Assigned To,Status,Due Date,Completed Date
T001,"Design new logo for ""Project X""",Alice Wonderland,Finished,2023-10-20,2023-10-19
T002,"Update website copy, including terms",Bob The Builder,Ongoing,2023-10-25,
T003,"Client Follow-up",Charlie Brown,To Do,2023-10-22,

Generate the filename and CSV content now.
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
    // Ensure filename ends with .csv
    if (output.fileName && !output.fileName.toLowerCase().endsWith('.csv')) {
      output.fileName += '.csv';
    }
    return output;
  }
);

