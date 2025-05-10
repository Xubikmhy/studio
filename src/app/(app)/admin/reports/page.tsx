
"use client";
import { useState }
from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, CalendarDays, Users, Loader2, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TEAMS } from "@/lib/constants";
import { generateReport, type GenerateReportInput, type GenerateReportOutput } from '@/ai/flows/generate-report-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface ReportConfiguration {
  type: string; // User-friendly display name
  params: Record<string, string>;
  paramOptions?: Record<string, { label: string; value: string }[]>;
  categoryLabel: string; // For the actual reportType sent to AI
}

export default function AdminReportsPage() {
  const { toast } = useToast();

  const initialReportConfigs: Record<string, ReportConfiguration> = {
    attendance: {
      type: "Daily Attendance",
      params: { period: "daily" },
      paramOptions: {
        period: [
          { label: "Daily Attendance", value: "daily" },
          { label: "Weekly Attendance", value: "weekly" },
          { label: "Monthly Attendance", value: "monthly" },
        ],
      },
      categoryLabel: "Attendance Report"
    },
    task: {
      type: "Task Completion - Last 7 Days",
      params: { period: "last7" },
      paramOptions: {
        period: [
          { label: "Last 7 Days", value: "last7" },
          { label: "Last 30 Days", value: "last30" },
        ],
      },
      categoryLabel: "Task Completion Report"
    },
    team: {
      type: `Team Productivity - ${TEAMS[0]}`,
      params: { team: TEAMS[0] || "all" },
      paramOptions: {
        team: [
          { label: "All Teams", value: "all" },
          ...TEAMS.map(team => ({ label: team, value: team })),
        ],
      },
      categoryLabel: "Team Productivity Report"
    },
  };

  const [reportConfigs, setReportConfigs] = useState<Record<string, ReportConfiguration>>(initialReportConfigs);
  const [generatedReportData, setGeneratedReportData] = useState<GenerateReportOutput | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentGeneratingKey, setCurrentGeneratingKey] = useState<string | null>(null);

  const handleParamChange = (reportKey: string, paramKey: string, value: string) => {
    setReportConfigs(prev => {
      const newParams = { ...prev[reportKey].params, [paramKey]: value };
      let newType = prev[reportKey].type;

      if (reportKey === 'attendance' && paramKey === 'period') {
        newType = prev[reportKey].paramOptions?.period?.find(opt => opt.value === value)?.label || prev[reportKey].type;
      } else if (reportKey === 'task' && paramKey === 'period') {
        newType = `Task Completion - ${prev[reportKey].paramOptions?.period?.find(opt => opt.value === value)?.label || 'Selected Period'}`;
      } else if (reportKey === 'team' && paramKey === 'team') {
        newType = `Team Productivity - ${prev[reportKey].paramOptions?.team?.find(opt => opt.value === value)?.label || 'Selected Team'}`;
      }
      
      return {
        ...prev,
        [reportKey]: {
          ...prev[reportKey],
          params: newParams,
          type: newType,
        }
      };
    });
    setGeneratedReportData(null); // Clear previous report data when params change
  };

  const downloadCsvFile = (fileName: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const safeFileName = fileName.replace(/[^\w\s.-]/gi, '').replace(/\s+/g, '_') || 'report.csv';
    link.download = safeFileName.toLowerCase().endsWith('.csv') ? safeFileName : `${safeFileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const triggerReportGeneration = async (reportKey: string) => {
    const config = reportConfigs[reportKey];
    if (!config) {
      toast({ title: "Error", description: "Invalid report configuration.", variant: "destructive" });
      return;
    }

    setIsGeneratingReport(true);
    setCurrentGeneratingKey(reportKey);
    setGeneratedReportData(null);

    try {
      const input: GenerateReportInput = {
        reportType: `${config.categoryLabel} (${config.type})`,
        params: config.params,
      };
      const result = await generateReport(input);
      setGeneratedReportData(result);
      downloadCsvFile(result.fileName, result.csvContent);
      toast({ title: "Report Generated", description: `Downloading "${result.fileName}"...` });
    } catch (error) {
      console.error("Failed to generate report:", error);
      setGeneratedReportData(null);
      toast({ title: "Error Generating Report", description: (error as Error).message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
      setCurrentGeneratingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Generate Reports</h1>
        <p className="text-muted-foreground">Access detailed reports for attendance, tasks, and team productivity. Downloads as CSV.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Report Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Attendance Reports</CardTitle>
            <CardDescription>Generate daily, weekly, or monthly attendance summaries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
              onValueChange={(value) => handleParamChange('attendance', 'period', value)} 
              defaultValue={reportConfigs.attendance.params.period}
              disabled={isGeneratingReport}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                {reportConfigs.attendance.paramOptions?.period?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              className="w-full" 
              onClick={() => triggerReportGeneration('attendance')}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport && currentGeneratingKey === 'attendance' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isGeneratingReport && currentGeneratingKey === 'attendance' ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Task Completion Report Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CalendarDays className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Task Completion Reports</CardTitle>
            <CardDescription>Track task progress and completion rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
              onValueChange={(value) => handleParamChange('task', 'period', value)} 
              defaultValue={reportConfigs.task.params.period}
              disabled={isGeneratingReport}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Report Period" />
              </SelectTrigger>
              <SelectContent>
                {reportConfigs.task.paramOptions?.period?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              className="w-full" 
              onClick={() => triggerReportGeneration('task')}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport && currentGeneratingKey === 'task' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isGeneratingReport && currentGeneratingKey === 'task' ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Team Productivity Report Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Team Productivity Reports</CardTitle>
            <CardDescription>Analyze productivity across different teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
              onValueChange={(value) => handleParamChange('team', 'team', value)} 
              defaultValue={reportConfigs.team.params.team}
              disabled={isGeneratingReport}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                 {reportConfigs.team.paramOptions?.team?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              className="w-full" 
              onClick={() => triggerReportGeneration('team')}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport && currentGeneratingKey === 'team' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isGeneratingReport && currentGeneratingKey === 'team' ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {isGeneratingReport && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg">Generating your report, please wait...</p>
        </div>
      )}

      {!isGeneratingReport && generatedReportData && (
        <Alert variant="default" className="mt-8 bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-700 dark:text-green-300">Report Ready</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            The report &quot;{generatedReportData.fileName}&quot; has been generated and your download should have started.
          </AlertDescription>
        </Alert>
      )}
      
       {!isGeneratingReport && !generatedReportData && (
        <Alert className="mt-8">
          <FileText className="h-4 w-4" />
          <AlertTitle>No Report Generated Yet</AlertTitle>
          <AlertDescription>
            Select report options above and click &quot;Generate Report&quot; to download the simulated CSV content.
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
