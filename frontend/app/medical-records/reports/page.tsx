"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  BarChart3,
  Users,
  Activity,
  Eye,
  FileText,
  Download,
  Play,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Share2,
  TrendingUp,
  PieChart,
  Building2,
  Stethoscope,
  FlaskConical,
  Pill,
  Shield,
  Database,
  Zap,
  Target,
  Archive,
  Bell,
  Link,
  Lock,
  Monitor,
  HardDrive,
  Wifi,
  WifiOff,
  History,
  Flag,
  Star,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  FileSpreadsheet,
  Pause,
  RotateCcw
} from "lucide-react";

// Enhanced Types
interface DataSource {
  id: string;
  name: string;
  type: "EHR" | "INVENTORY" | "FINANCIAL" | "SCHEDULING" | "REGULATORY";
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync?: string;
  recordCount?: number;
  version?: string;
}

interface DataQuality {
  score: number; // 0-100
  issues: {
    type: "missing" | "inconsistent" | "outdated" | "duplicate";
    count: number;
    severity: "low" | "medium" | "high";
    description: string;
  }[];
  lastChecked: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "patient" | "clinical" | "administrative" | "financial" | "operational";
  type: string;
  icon: React.ReactNode;
  parameters: ReportParameter[];
  estimatedTime: string;
  dataSources: string[];
  compliance: {
    hipaa: boolean;
    regulatory: string[];
    retention: number; // days
  };
  version: string;
  lastUpdated: string;
  usageCount: number;
  avgRating: number;
}

interface ReportParameter {
  name: string;
  label: string;
  type: "date" | "select" | "multiselect" | "number" | "text" | "boolean";
  required: boolean;
  options?: string[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  type: string;
  category: string;
  status: "queued" | "generating" | "completed" | "failed" | "scheduled" | "cancelled" | "paused";
  createdAt: string;
  completedAt?: string;
  parameters: Record<string, any>;
  dataCount?: number;
  fileSize?: string;
  downloadUrl?: string;
  error?: string;
  progress?: number;
  estimatedCompletion?: string;
  dataQuality?: DataQuality;
  auditTrail: AuditEntry[];
  compliance: {
    encrypted: boolean;
    accessLevel: "public" | "restricted" | "confidential";
    retentionDate: string;
  };
  formats: {
    pdf?: string;
    excel?: string;
    csv?: string;
  };
  resourceUsage: {
    cpuTime: number;
    memory: number;
    diskSpace: number;
  };
  feedback?: {
    rating: number;
    comments: string;
  };
}

interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

interface SystemMetrics {
  activeReports: number;
  queuedReports: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkStatus: boolean;
  avgGenerationTime: number;
  errorRate: number;
}

// Mock Data with Enhanced Features
const dataSources: DataSource[] = [
  {
    id: "ehr-epic",
    name: "Epic EHR System",
    type: "EHR",
    status: "connected",
    lastSync: "2024-08-26T10:30:00Z",
    recordCount: 45672,
    version: "2024.3"
  },
  {
    id: "inventory-cerner",
    name: "Cerner Inventory Management",
    type: "INVENTORY",
    status: "syncing",
    lastSync: "2024-08-26T10:25:00Z",
    recordCount: 12450,
    version: "5.2.1"
  },
  {
    id: "financial-oracle",
    name: "Oracle Financial System",
    type: "FINANCIAL",
    status: "error",
    lastSync: "2024-08-26T08:15:00Z",
    recordCount: 0,
    version: "19c"
  },
  {
    id: "scheduling-kronos",
    name: "Kronos Staff Scheduling",
    type: "SCHEDULING",
    status: "connected",
    lastSync: "2024-08-26T10:35:00Z",
    recordCount: 892,
    version: "8.1.2"
  }
];

const reportTemplates: ReportTemplate[] = [
  {
    id: "daily-patient-summary",
    name: "Daily Patient Summary",
    description: "Daily overview of patient registrations, visits, and key metrics",
    category: "patient",
    type: "daily",
    icon: <Users className="h-5 w-5" />,
    estimatedTime: "2-3 minutes",
    dataSources: ["ehr-epic"],
    compliance: {
      hipaa: true,
      regulatory: ["CMS", "Joint Commission"],
      retention: 2555 // 7 years
    },
    version: "2.1.0",
    lastUpdated: "2024-08-15T00:00:00Z",
    usageCount: 142,
    avgRating: 4.7,
    parameters: [
      {
        name: "date",
        label: "Report Date",
        type: "date",
        required: true,
        defaultValue: new Date().toISOString().split('T')[0]
      },
      {
        name: "departments",
        label: "Departments",
        type: "multiselect",
        required: false,
        options: ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Emergency"]
      },
      {
        name: "includeConfidential",
        label: "Include Confidential Records",
        type: "boolean",
        required: false,
        defaultValue: false
      }
    ]
  },
  {
    id: "monthly-clinical-stats",
    name: "Monthly Clinical Statistics",
    description: "Comprehensive monthly analysis of clinical activities and outcomes",
    category: "clinical",
    type: "monthly",
    icon: <BarChart3 className="h-5 w-5" />,
    estimatedTime: "5-7 minutes",
    dataSources: ["ehr-epic", "inventory-cerner"],
    compliance: {
      hipaa: true,
      regulatory: ["FDA", "CMS"],
      retention: 1825 // 5 years
    },
    version: "3.0.1",
    lastUpdated: "2024-08-20T00:00:00Z",
    usageCount: 89,
    avgRating: 4.5,
    parameters: [
      { name: "month", label: "Month", type: "select", required: true, options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
      { name: "year", label: "Year", type: "select", required: true, options: ["2024", "2023", "2022"] },
      {
        name: "includeComparisons",
        label: "Include Year-over-Year Comparisons",
        type: "boolean",
        required: false,
        defaultValue: true
      }
    ]
  },
  {
    id: "compliance-audit",
    name: "Compliance Audit Report",
    description: "Regulatory compliance status and audit findings",
    category: "administrative",
    type: "compliance",
    icon: <Shield className="h-5 w-5" />,
    estimatedTime: "8-12 minutes",
    dataSources: ["ehr-epic", "financial-oracle", "scheduling-kronos"],
    compliance: {
      hipaa: true,
      regulatory: ["HIPAA", "HITECH", "Joint Commission", "CMS"],
      retention: 3650 // 10 years
    },
    version: "1.5.2",
    lastUpdated: "2024-08-22T00:00:00Z",
    usageCount: 34,
    avgRating: 4.9,
    parameters: [
      { name: "auditType", label: "Audit Type", type: "select", required: true, options: ["HIPAA", "Financial", "Clinical Quality", "Safety"] },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "endDate", label: "End Date", type: "date", required: true },
      {
        name: "confidentialityLevel",
        label: "Confidentiality Level",
        type: "select",
        required: true,
        options: ["Standard", "Restricted", "Confidential"],
        defaultValue: "Restricted"
      }
    ]
  }
];

const mockGeneratedReports: GeneratedReport[] = [
  {
    id: "RPT-001",
    templateId: "daily-patient-summary",
    name: "Daily Patient Summary - Aug 26, 2024",
    type: "daily",
    category: "patient",
    status: "completed",
    createdAt: "2024-08-26T08:00:00Z",
    completedAt: "2024-08-26T08:03:12Z",
    parameters: { date: "2024-08-26", departments: ["General Medicine", "Cardiology"] },
    dataCount: 156,
    fileSize: "2.3 MB",
    progress: 100,
    dataQuality: {
      score: 94,
      issues: [
        { type: "missing", count: 3, severity: "low", description: "Missing phone numbers for 3 patients" },
        { type: "outdated", count: 1, severity: "medium", description: "1 insurance record over 6 months old" }
      ],
      lastChecked: "2024-08-26T08:01:00Z"
    },
    auditTrail: [
      { timestamp: "2024-08-26T08:00:00Z", action: "Report Initiated", user: "Dr. Smith" },
      { timestamp: "2024-08-26T08:03:12Z", action: "Report Completed", user: "System" }
    ],
    compliance: {
      encrypted: true,
      accessLevel: "restricted",
      retentionDate: "2031-08-26T00:00:00Z"
    },
    formats: {
      pdf: "#pdf-url",
      excel: "#excel-url"
    },
    resourceUsage: {
      cpuTime: 45.2,
      memory: 128,
      diskSpace: 2.3
    },
    feedback: {
      rating: 5,
      comments: "Excellent detail and accuracy"
    }
  },
  {
    id: "RPT-002",
    templateId: "monthly-clinical-stats",
    name: "Monthly Clinical Statistics - July 2024",
    type: "monthly",
    category: "clinical",
    status: "generating",
    createdAt: "2024-08-26T09:15:00Z",
    parameters: { month: "July", year: "2024", includeComparisons: true },
    progress: 67,
    estimatedCompletion: "2024-08-26T09:22:00Z",
    auditTrail: [
      { timestamp: "2024-08-26T09:15:00Z", action: "Report Initiated", user: "Admin User" },
      { timestamp: "2024-08-26T09:18:30Z", action: "Data Collection Phase Complete", user: "System" }
    ],
    compliance: {
      encrypted: true,
      accessLevel: "confidential",
      retentionDate: "2029-08-26T00:00:00Z"
    },
    resourceUsage: {
      cpuTime: 234.1,
      memory: 512,
      diskSpace: 0
    },
    formats: {}
  }
];

const systemMetrics: SystemMetrics = {
  activeReports: 3,
  queuedReports: 2,
  cpuUsage: 34,
  memoryUsage: 67,
  diskUsage: 45,
  networkStatus: true,
  avgGenerationTime: 4.2,
  errorRate: 2.1
};

export default function EnhancedReportsDashboard() {
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(mockGeneratedReports);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [feedbackReport, setFeedbackReport] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState("");

  // Auto-refresh system metrics and reports
  useEffect(() => {
    const interval = setInterval(() => {
      // Update generating reports
      setGeneratedReports(prev =>
        prev.map(report => {
          if (report.status === "generating") {
            const newProgress = Math.min((report.progress || 0) + Math.random() * 15, 100);
            if (newProgress >= 100) {
              return {
                ...report,
                status: "completed",
                progress: 100,
                completedAt: new Date().toISOString(),
                dataCount: Math.floor(Math.random() * 500) + 50,
                fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
                formats: {
                  pdf: "#pdf-url",
                  excel: "#excel-url",
                  csv: "#csv-url"
                }
              };
            }
            return { ...report, progress: newProgress };
          }
          return report;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleParameterChange = useCallback((paramName: string, value: any) => {
    setReportParameters(prev => ({ ...prev, [paramName]: value }));
  }, []);

  const validateParameters = useCallback((template: ReportTemplate) => {
    const missingParams = template.parameters
      .filter(param => param.required && !reportParameters[param.name])
      .map(param => param.label);

    if (missingParams.length > 0) {
      return `Please fill in required parameters: ${missingParams.join(", ")}`;
    }

    // Additional validation
    for (const param of template.parameters) {
      const value = reportParameters[param.name];
      if (value && param.validation) {
        if (param.validation.min && value < param.validation.min) {
          return `${param.label} must be at least ${param.validation.min}`;
        }
        if (param.validation.max && value > param.validation.max) {
          return `${param.label} must be at most ${param.validation.max}`;
        }
      }
    }

    return null;
  }, [reportParameters]);

  const generateReport = async () => {
    if (!selectedTemplate) return;

    const validationError = validateParameters(selectedTemplate);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsGenerating(true);

    const newReport: GeneratedReport = {
      id: `RPT-${Date.now()}`,
      templateId: selectedTemplate.id,
      name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      type: selectedTemplate.type,
      category: selectedTemplate.category,
      status: "queued",
      createdAt: new Date().toISOString(),
      parameters: { ...reportParameters },
      progress: 0,
      estimatedCompletion: new Date(Date.now() + 5 * 60000).toISOString(), // 5 min estimate
      auditTrail: [{
        timestamp: new Date().toISOString(),
        action: "Report Queued",
        user: "Current User"
      }],
      compliance: {
        encrypted: selectedTemplate.compliance.hipaa,
        accessLevel: reportParameters.confidentialityLevel?.toLowerCase() || "restricted",
        retentionDate: new Date(Date.now() + selectedTemplate.compliance.retention * 24 * 60 * 60 * 1000).toISOString()
      },
      resourceUsage: {
        cpuTime: 0,
        memory: 0,
        diskSpace: 0
      },
      formats: {}
    };

    setGeneratedReports(prev => [newReport, ...prev]);

    // Simulate queue processing
    setTimeout(() => {
      setGeneratedReports(prev => prev.map(r => 
        r.id === newReport.id ? { ...r, status: "generating", progress: 5 } : r
      ));
    }, 2000);

    setIsGenerating(false);
    setSelectedTemplate(null);
    setReportParameters({});
  };

  const pauseReport = (reportId: string) => {
    setGeneratedReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, status: "paused" } : r
    ));
  };

  const resumeReport = (reportId: string) => {
    setGeneratedReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, status: "generating" } : r
    ));
  };

  const cancelReport = (reportId: string) => {
    setGeneratedReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, status: "cancelled" } : r
    ));
  };

  const retryReport = (reportId: string) => {
    setGeneratedReports(prev => prev.map(r =>
      r.id === reportId ? {
        ...r,
        status: "queued",
        error: undefined,
        progress: 0
      } : r
    ));
  };

  const submitFeedback = () => {
    if (!feedbackReport) return;

    setGeneratedReports(prev => prev.map(r => 
      r.id === feedbackReport ? {
        ...r,
        feedback: {
          rating: feedbackRating,
          comments: feedbackComments
        }
      } : r
    ));

    setFeedbackReport(null);
    setFeedbackComments("");
    setFeedbackRating(5);
  };

  const getStatusIcon = (status: GeneratedReport['status']) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "generating": return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "scheduled": return <Clock className="h-4 w-4 text-orange-600" />;
      case "queued": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "paused": return <Pause className="h-4 w-4 text-gray-600" />;
      case "cancelled": return <X className="h-4 w-4 text-red-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: GeneratedReport['status']) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "generating": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      case "scheduled": return "bg-orange-100 text-orange-800";
      case "queued": return "bg-yellow-100 text-yellow-800";
      case "paused": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-50 text-red-600";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "patient": return "bg-blue-100 text-blue-800";
      case "clinical": return "bg-green-100 text-green-800";
      case "administrative": return "bg-purple-100 text-purple-800";
      case "financial": return "bg-yellow-100 text-yellow-800";
      case "operational": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDataSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case "EHR": return <Stethoscope className="h-4 w-4" />;
      case "INVENTORY": return <FlaskConical className="h-4 w-4" />;
      case "FINANCIAL": return <PieChart className="h-4 w-4" />;
      case "SCHEDULING": return <Calendar className="h-4 w-4" />;
      case "REGULATORY": return <Shield className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getDataSourceStatus = (status: DataSource['status']) => {
    switch (status) {
      case "connected": return { color: "text-green-600", icon: <CheckCircle2 className="h-3 w-3" /> };
      case "disconnected": return { color: "text-red-600", icon: <XCircle className="h-3 w-3" /> };
      case "error": return { color: "text-red-600", icon: <AlertTriangle className="h-3 w-3" /> };
      case "syncing": return { color: "text-blue-600", icon: <RefreshCw className="h-3 w-3 animate-spin" /> };
      default: return { color: "text-gray-600", icon: <AlertCircle className="h-3 w-3" /> };
    }
  };

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredReports = generatedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const reportStats = {
    total: generatedReports.length,
    completed: generatedReports.filter(r => r.status === "completed").length,
    generating: generatedReports.filter(r => r.status === "generating").length,
    failed: generatedReports.filter(r => r.status === "failed").length,
    queued: generatedReports.filter(r => r.status === "queued").length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with System Status */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Generate and manage comprehensive medical facility reports with integrated data validation and compliance monitoring
          </p>
        </div>

      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search report templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="patient">Patient Reports</SelectItem>
                <SelectItem value="clinical">Clinical Reports</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {template.icon}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      {template.compliance.hipaa && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          HIPAA
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  {/* Template Analytics */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {template.avgRating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {template.usageCount} uses
                    </div>
                    <div>v{template.version}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated time:</span>
                    <span className="font-medium">{template.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data sources:</span>
                    <span className="font-medium text-xs">
                      {template.dataSources.map(dsId => 
                        dataSources.find(ds => ds.id === dsId)?.name.split(' ')[0] || dsId
                      ).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Retention:</span>
                    <span className="font-medium">{Math.floor(template.compliance.retention / 365)} years</span>
                  </div>
                  <Button 
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search generated reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{report.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status}
                          </div>
                        </Badge>
                        <Badge className={getCategoryColor(report.category)}>
                          {report.category}
                        </Badge>
                        <Badge className={`${report.compliance.accessLevel === 'confidential' ? 'bg-red-100 text-red-800' : 
                          report.compliance.accessLevel === 'restricted' ? 'bg-orange-100 text-orange-800' : 
                          'bg-green-100 text-green-800'}`}>
                          <Lock className="h-3 w-3 mr-1" />
                          {report.compliance.accessLevel}
                        </Badge>
                      </div>
                      
                      {/* Progress Bar for Active Reports */}
                      {(report.status === "generating" || report.status === "queued") && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{report.progress || 0}%</span>
                          </div>
                          <Progress value={report.progress || 0} className="h-2" />
                          {report.estimatedCompletion && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ETA: {new Date(report.estimatedCompletion).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Data Quality Indicators */}
                      {report.dataQuality && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Data Quality Score:</span>
                            <Badge className={report.dataQuality.score >= 90 ? "bg-green-100 text-green-800" : 
                              report.dataQuality.score >= 75 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {report.dataQuality.score}%
                            </Badge>
                          </div>
                          {report.dataQuality.issues.length > 0 && (
                            <div className="space-y-1">
                              {report.dataQuality.issues.slice(0, 2).map((issue, idx) => (
                                <div key={idx} className="text-xs flex items-center gap-2">
                                  <AlertTriangle className={`h-3 w-3 ${issue.severity === 'high' ? 'text-red-500' : 
                                    issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                                  <span>{issue.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {new Date(report.createdAt).toLocaleString()}
                        </div>
                        {report.completedAt && (
                          <div>
                            <span className="font-medium">Completed:</span>
                            <br />
                            {new Date(report.completedAt).toLocaleString()}
                          </div>
                        )}
                        {report.dataCount && (
                          <div>
                            <span className="font-medium">Records:</span>
                            <br />
                            {report.dataCount.toLocaleString()}
                          </div>
                        )}
                        {report.fileSize && (
                          <div>
                            <span className="font-medium">Size:</span>
                            <br />
                            {report.fileSize}
                          </div>
                        )}
                      </div>

                      {/* Resource Usage */}
                      {report.resourceUsage && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          <div className="flex gap-4">
                            <span>CPU: {report.resourceUsage.cpuTime}s</span>
                            <span>Memory: {report.resourceUsage.memory}MB</span>
                            <span>Disk: {report.resourceUsage.diskSpace}MB</span>
                          </div>
                        </div>
                      )}

                      {report.error && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{report.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Feedback Display */}
                      {report.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < report.feedback!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">User Feedback</span>
                          </div>
                          {report.feedback.comments && (
                            <p className="text-xs text-gray-600">{report.feedback.comments}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {report.status === "completed" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {report.formats?.pdf && (
                              <Button variant="outline" size="sm" title="Download PDF">
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            {report.formats?.excel && (
                              <Button variant="outline" size="sm" title="Download Excel">
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" title="Print Report">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" title="Share Report">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(report.status === "generating" || report.status === "queued") && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => pauseReport(report.id)} title="Pause">
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => cancelReport(report.id)} title="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {report.status === "paused" && (
                          <Button variant="outline" size="sm" onClick={() => resumeReport(report.id)} title="Resume">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {report.status === "failed" && (
                          <Button variant="outline" size="sm" onClick={() => retryReport(report.id)} title="Retry">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Feedback Button */}
                      {report.status === "completed" && !report.feedback && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setFeedbackReport(report.id)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Provide Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Automated Schedules
                </CardTitle>
                <p className="text-muted-foreground">
                  Configure automatic report generation schedules
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Daily Patient Summary</h4>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Every day at 6:00 AM</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Pause</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Monthly Clinical Report</h4>
                      <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">1st of every month at 8:00 AM</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Run Now</Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  <Settings className="h-4 w-4 mr-2" />
                  Create New Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-complete" defaultChecked />
                    <Label htmlFor="notify-complete" className="text-sm">
                      Notify when reports complete
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-errors" defaultChecked />
                    <Label htmlFor="notify-errors" className="text-sm">
                      Notify on generation errors
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-quality" />
                    <Label htmlFor="notify-quality" className="text-sm">
                      Notify on data quality issues
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-compliance" defaultChecked />
                    <Label htmlFor="notify-compliance" className="text-sm">
                      Compliance deadline reminders
                    </Label>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Notification Methods</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email-notify" defaultChecked />
                      <Label htmlFor="email-notify" className="text-sm">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dashboard-notify" defaultChecked />
                      <Label htmlFor="dashboard-notify" className="text-sm">Dashboard alerts</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Usage Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reports This Month</span>
                    <span className="font-bold">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Generation Time</span>
                    <span className="font-bold">{systemMetrics.avgGenerationTime}min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-bold text-green-600">{(100 - systemMetrics.errorRate).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Popular</span>
                    <span className="font-bold text-xs">Daily Patient Summary</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{systemMetrics.cpuUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.cpuUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{systemMetrics.memoryUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.memoryUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Disk Usage</span>
                      <span>{systemMetrics.diskUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.diskUsage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      HIPAA Compliant
                    </span>
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Audit Trail Active
                    </span>
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Retention Policy
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reports Archived</span>
                    <span className="font-bold">1,247</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Charts Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <p className="text-muted-foreground">
                Report generation trends and system performance over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Charts and detailed analytics would be implemented here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Integration with charting libraries like Chart.js or Recharts recommended
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Report Generation Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedTemplate.icon}
                Generate {selectedTemplate.name}
              </CardTitle>
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
              
              {/* Template Info */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge className={getCategoryColor(selectedTemplate.category)}>
                  {selectedTemplate.category}
                </Badge>
                {selectedTemplate.compliance.hipaa && (
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    HIPAA Compliant
                  </Badge>
                )}
                <Badge variant="outline">
                  v{selectedTemplate.version}
                </Badge>
                <Badge variant="outline">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {selectedTemplate.avgRating.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Data Source Dependencies Check */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Data Source Status</Label>
                <div className="grid gap-2">
                  {selectedTemplate.dataSources.map(sourceId => {
                    const source = dataSources.find(ds => ds.id === sourceId);
                    if (!source) return null;
                    const statusInfo = getDataSourceStatus(source.status);
                    
                    return (
                      <div key={sourceId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getDataSourceIcon(source.type)}
                          <span className="text-sm">{source.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="text-xs capitalize">{source.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Report Parameters */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Report Parameters</Label>
                <div className="grid gap-4">
                  {selectedTemplate.parameters.map((param) => (
                    <div key={param.name} className="space-y-2">
                      <Label htmlFor={param.name}>
                        {param.label}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {param.type === "date" && (
                        <Input
                          id={param.name}
                          type="date"
                          value={reportParameters[param.name] || param.defaultValue || ""}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        />
                      )}
                      
                      {param.type === "select" && (
                        <Select
                          value={reportParameters[param.name] || param.defaultValue || ""}
                          onValueChange={(value) => handleParameterChange(param.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {param.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {param.type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={param.name}
                            checked={reportParameters[param.name] || param.defaultValue || false}
                            onCheckedChange={(checked) => handleParameterChange(param.name, checked)}
                          />
                          <Label htmlFor={param.name} className="text-sm">
                            Enable this option
                          </Label>
                        </div>
                      )}
                      
                      {param.type === "text" && (
                        <Input
                          id={param.name}
                          value={reportParameters[param.name] || param.defaultValue || ""}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          placeholder={`Enter ${param.label.toLowerCase()}`}
                        />
                      )}
                      
                      {param.type === "number" && (
                        <Input
                          id={param.name}
                          type="number"
                          value={reportParameters[param.name] || param.defaultValue || ""}
                          onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
                          placeholder={`Enter ${param.label.toLowerCase()}`}
                          min={param.validation?.min}
                          max={param.validation?.max}
                        />
                      )}
                      
                      {param.type === "multiselect" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {param.options?.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${param.name}-${option}`}
                                  checked={(reportParameters[param.name] || []).includes(option)}
                                  onCheckedChange={(checked) => {
                                    const current = reportParameters[param.name] || [];
                                    handleParameterChange(
                                      param.name,
                                      checked
                                        ? [...current, option]
                                        : current.filter((o: string) => o !== option)
                                    );
                                  }}
                                />
                                <Label htmlFor={`${param.name}-${option}`} className="text-sm">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
              <Button onClick={generateReport} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl h-[80vh]">
            <CardHeader>
              <CardTitle>{selectedReport.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-full bg-gray-50 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Report preview would be rendered here (implement with PDF viewer or similar)</p>
              </div>
            </CardContent>
            <div className="flex justify-end p-6 border-t">
              <Button onClick={() => setSelectedReport(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Provide Feedback</CardTitle>
              <p className="text-muted-foreground">Rate this report and add comments</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeedbackRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${i < feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Optional comments..."
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
              />
            </CardContent>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setFeedbackReport(null)}>
                Cancel
              </Button>
              <Button onClick={submitFeedback}>
                Submit Feedback
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}