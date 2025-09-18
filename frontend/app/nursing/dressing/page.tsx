"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bandage, AlertTriangle, Plus, Clock, RefreshCw, Users, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Interface to match pool queue structure
interface Patient {
  id: string;
  patientId: string;
  name: string;
  personalNumber?: string;
  visitId: string;
  clinic: string;
  visitDate: string;
  visitTime: string;
  visitType: string;
  priority: "Emergency" | "High" | "Medium" | "Low";
  status: "Awaiting Dressing" | "Dressing Complete" | "Completed";
  location: string;
  assignedNurse?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  employeeCategory?: string;
  dressingAlerts?: string[];
  dressingNotes?: string;
  woundType?: string;
  woundLocation?: string;
  lastDressingAt?: string;
}

interface DressingRecord {
  id: string;
  date: string;
  time: string;
  recordedBy: string;
  dressing: {
    woundType: string;
    location: string;
    dressingType: string;
    woundCondition: string;
    woundSize: string;
    drainage: string;
    painLevel: string;
    skinCondition: string;
    observations: string;
  };
  alerts: string[];
}

interface PatientDressingData {
  patientId: string;
  patientName: string;
  personalNumber: string;
  dressingsHistory: DressingRecord[];
}

// Helper functions
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const formatTimeWithAMPM = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getMinutesDifference = (fromDate: string, toDate: Date = new Date()) => {
  const from = new Date(fromDate);
  return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
};

const subtractMinutes = (minutes: number) => {
  const now = new Date();
  return new Date(now.getTime() - (minutes * 60 * 1000)).toISOString();
};

// Mock data
const createInitialPatients = () => [
  {
    id: "P001",
    patientId: "P001",
    name: "John Doe",
    personalNumber: "EMP001",
    visitId: "V001",
    status: "Awaiting Dressing",
    priority: "High",
    location: "Dressing Room",
    clinic: "General",
    visitType: "Consultation",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(25),
    assignedNurse: "Nurse Alice",
    gender: "Male",
    age: 30,
    phoneNumber: "+234-801-234-5678",
    employeeCategory: "Employee",
    dressingAlerts: ["Surgical wound requiring monitoring"],
    dressingNotes: "Post-operative abdominal incision",
    woundType: "Surgical",
    woundLocation: "Abdomen"
  },
  {
    id: "P002",
    patientId: "P002",
    name: "Jane Smith",
    personalNumber: "EMP002",
    visitId: "V002",
    status: "Awaiting Dressing",
    priority: "Emergency",
    location: "Dressing Room",
    clinic: "Emergency",
    visitType: "Emergency Care",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(10),
    assignedNurse: "Nurse Bob",
    gender: "Female",
    age: 45,
    phoneNumber: "+234-804-567-8901",
    employeeCategory: "Employee",
    dressingAlerts: ["Infected burn wound"],
    dressingNotes: "Second-degree burn with signs of infection",
    woundType: "Burn",
    woundLocation: "Left forearm"
  },
  {
    id: "P003",
    patientId: "P003",
    name: "Michael Johnson",
    personalNumber: "EMP003",
    visitId: "V003",
    status: "Awaiting Dressing",
    priority: "Medium",
    location: "Dressing Room",
    clinic: "General",
    visitType: "Follow Up",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(45),
    assignedNurse: "Nurse Carol",
    gender: "Male",
    age: 62,
    phoneNumber: "+234-805-678-9012",
    employeeCategory: "Retiree",
    dressingAlerts: [],
    dressingNotes: "Stage 2 pressure ulcer",
    woundType: "Pressure Ulcer",
    woundLocation: "Sacrum"
  },
  {
    id: "P004",
    patientId: "P004",
    name: "Sarah Wilson",
    personalNumber: "EMP004",
    visitId: "V004",
    status: "Awaiting Dressing",
    priority: "Low",
    location: "Dressing Room",
    clinic: "General",
    visitType: "Consultation",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(5),
    assignedNurse: "Nurse Dan",
    gender: "Female",
    age: 50,
    phoneNumber: "+234-806-789-0123",
    employeeCategory: "Employee",
    dressingAlerts: [],
    dressingNotes: "Minor trauma wound",
    woundType: "Trauma",
    woundLocation: "Right knee"
  }
];

// Mock dressing data
const dressingsByPatientId = {
  P001: {
    patientId: "P001",
    patientName: "John Doe",
    personalNumber: "123456789",
    dressingsHistory: [
      {
        date: "2025-08-15",
        time: "09:30",
        recordedBy: "Nurse Alice",
        dressing: {
          woundType: "Surgical",
          location: "Abdomen",
          dressingType: "Hydrocolloid",
          woundCondition: "Healing Well",
          woundSize: "3cm x 2cm",
          drainage: "Minimal serous",
          painLevel: "2/10",
          skinCondition: "Intact around wound",
          observations: "Surgical site healing well, no signs of infection. Patient comfortable.",
        },
        alerts: [],
      },
      {
        date: "2025-08-15",
        time: "18:45",
        recordedBy: "Nurse Bob",
        dressing: {
          woundType: "Surgical",
          location: "Abdomen",
          dressingType: "Gauze",
          woundCondition: "Stable",
          woundSize: "3cm x 2cm",
          drainage: "None",
          painLevel: "1/10",
          skinCondition: "Normal",
          observations: "Evening check, wound dry and intact.",
        },
        alerts: [],
      },
      {
        date: "2025-08-12",
        time: "14:00",
        recordedBy: "Nurse Carol",
        dressing: {
          woundType: "Surgical",
          location: "Abdomen",
          dressingType: "Gauze",
          woundCondition: "Stable",
          woundSize: "3.5cm x 2.5cm",
          drainage: "Moderate serous",
          painLevel: "3/10",
          skinCondition: "Slightly red around edges",
          observations: "Initial post-op dressing change. Some expected inflammation.",
        },
        alerts: ["Initial post-operative monitoring required"],
      },
    ],
  },
  P002: {
    patientId: "P002",
    patientName: "Jane Smith",
    personalNumber: "987654321",
    dressingsHistory: [
      {
        date: "2025-08-14",
        time: "11:00",
        recordedBy: "Nurse Carol",
        dressing: {
          woundType: "Burn",
          location: "Left forearm",
          dressingType: "Foam",
          woundCondition: "Signs of Infection",
          woundSize: "5cm x 3cm",
          drainage: "Purulent, yellow-green",
          painLevel: "7/10",
          skinCondition: "Red, warm, swollen",
          observations: "Wound showing signs of infection. Increased drainage and patient reports increased pain. Doctor notified.",
        },
        alerts: ["Possible infection - doctor notified", "Increased pain reported"],
      },
      {
        date: "2025-08-11",
        time: "16:30",
        recordedBy: "Nurse Dan",
        dressing: {
          woundType: "Burn",
          location: "Left forearm",
          dressingType: "Transparent Film",
          woundCondition: "Stable",
          woundSize: "5.5cm x 3.5cm",
          drainage: "Minimal clear",
          painLevel: "4/10",
          skinCondition: "Pink, healing",
          observations: "Second-degree burn healing as expected. Patient tolerating well.",
        },
        alerts: [],
      },
    ],
  },
  P003: {
    patientId: "P003",
    patientName: "Michael Johnson",
    personalNumber: "456789123",
    dressingsHistory: [
      {
        date: "2025-08-13",
        time: "10:15",
        recordedBy: "Nurse Eve",
        dressing: {
          woundType: "Pressure Ulcer",
          location: "Sacrum",
          dressingType: "Hydrocolloid",
          woundCondition: "Deteriorating",
          woundSize: "4cm x 4cm, 0.5cm deep",
          drainage: "Moderate serous",
          painLevel: "5/10",
          skinCondition: "Macerated edges",
          observations: "Stage 2 pressure ulcer showing signs of deterioration. Increased turning schedule implemented.",
        },
        alerts: ["Wound deteriorating", "Increased monitoring required"],
      },
      {
        date: "2025-08-10",
        time: "09:45",
        recordedBy: "Nurse Frank",
        dressing: {
          woundType: "Trauma",
          location: "Right knee",
          dressingType: "Gauze",
          woundCondition: "Healing Well",
          woundSize: "2cm x 1cm",
          drainage: "None",
          painLevel: "1/10",
          skinCondition: "Normal",
          observations: "Laceration from fall, healing without complications.",
        },
        alerts: [],
      },
    ],
  },
  P004: {
    patientId: "P004",
    patientName: "Sarah Wilson",
    personalNumber: "EMP004",
    dressingsHistory: [
      {
        date: "2025-08-29",
        time: "11:30",
        recordedBy: "Nurse Bob",
        dressing: {
          woundType: "Trauma",
          location: "Right knee",
          dressingType: "Gauze",
          woundCondition: "Healing Well",
          woundSize: "2cm x 1cm",
          drainage: "None",
          painLevel: "1/10",
          skinCondition: "Normal",
          observations: "Minor laceration healing well.",
        },
        alerts: [],
      }
    ],
  }
};

/**
 * Get icon and color based on dressing condition/alerts
 */
const getDressingIcon = (alerts: string[]) => {
  if (alerts.length > 0) {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  return <Bandage className="h-4 w-4 text-green-500" />;
};

/**
 * Get badge color class based on status
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case "Awaiting Dressing":
      return "bg-red-100 text-red-800 border-red-200";
    case "Dressing Complete":
      return "bg-green-100 text-green-800 border-green-200";
    case "Completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Get badge color class based on priority
 */
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Emergency":
      return "bg-red-500 text-white";
    case "High":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Format label from camelCase key
 */
const labelFromKey = (key: string) => {
  const labels: Record<string, string> = {
    woundType: "Wound Type",
    location: "Location",
    dressingType: "Dressing Type",
    woundCondition: "Wound Condition",
    woundSize: "Wound Size",
    drainage: "Drainage",
    painLevel: "Pain Level",
    skinCondition: "Skin Condition",
    observations: "Observations"
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const Loader = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />;

export default function PatientDressings() {
  const { toast } = useToast();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(() => createInitialPatients());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addDressingOpen, setAddDressingOpen] = useState(false);
  const [selectedPatientDressings, setSelectedPatientDressings] = useState<PatientDressingData | null>(null);
  const [selectedPatientForDressing, setSelectedPatientForDressing] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [clinicFilter, setClinicFilter] = useState("all");
  const [woundTypeFilter, setWoundTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedTimes, setExpandedTimes] = useState<Record<string, boolean>>({});
  const pageSize = 6;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch patients from API
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: "Sent to Dressing",
        page: String(currentPage),
        page_size: String(pageSize),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(clinicFilter !== "all" && { clinic: clinicFilter }),
      });
      const response = await fetch(`${API_URL}/api/visits/?${params}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      
      const data = await response.json();
      const mappedPatients = (data.results || data).map((v: any) => ({
        id: v.id,
        patientId: v.patient,
        name: v.patient_name || "Unknown",
        personalNumber: v.personal_number || "",
        visitId: v.id,
        clinic: v.clinic,
        visitDate: v.visit_date,
        visitTime: v.visit_time,
        visitType: v.visit_type,
        priority: v.priority,
        status: v.status,
        location: v.location || "Dressing Room",
        assignedNurse: v.assigned_nurse,
        gender: v.gender,
        age: v.age,
        phoneNumber: v.phone,
        employeeCategory: v.employee_category,
        dressingAlerts: v.dressing_alerts || [],
        dressingNotes: v.status_note,
        woundType: v.wound_type,
        woundLocation: v.wound_location,
      }));
      
      setPatients(mappedPatients);
    } catch (err) {
      setError("Failed to load patient data. Please try again.");
      console.error(err);
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [currentPage, searchTerm, statusFilter, priorityFilter, clinicFilter, woundTypeFilter]);

  useEffect(() => {
    if (historyOpen) {
      setHistoryPage(1);
      setExpandedTimes({});
    }
  }, [historyOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPatients();
    } catch (err) {
      setError("Failed to refresh dressing queue data");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredPatients = useMemo(() => {
    let filtered = patients;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    
    if (priorityFilter !== "all") {
      filtered = filtered.filter((p) => p.priority === priorityFilter);
    }
    
    if (clinicFilter !== "all") {
      filtered = filtered.filter((p) => p.clinic === clinicFilter);
    }
    
    if (woundTypeFilter !== "all") {
      filtered = filtered.filter((p) => p.woundType === woundTypeFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term) ||
          p.visitId.toLowerCase().includes(term) ||
          p.personalNumber?.toLowerCase().includes(term) ||
          p.clinic.toLowerCase().includes(term) ||
          p.assignedNurse?.toLowerCase().includes(term) ||
          p.woundType?.toLowerCase().includes(term) ||
          p.woundLocation?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [patients, statusFilter, priorityFilter, clinicFilter, woundTypeFilter, searchTerm]);

  const priorityOrder: Record<Patient["priority"], number> = { Emergency: 0, High: 1, Medium: 2, Low: 3 };
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      const prioDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      if (prioDiff !== 0) return prioDiff;
      return new Date(a.visitTime).getTime() - new Date(b.visitTime).getTime();
    });
  }, [filteredPatients]);

  const totalPages = Math.max(1, Math.ceil(sortedPatients.length / pageSize));
  
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, clinicFilter, woundTypeFilter, searchTerm]);
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPatients.slice(start, start + pageSize);
  }, [sortedPatients, currentPage, pageSize]);

  const stats = {
    total: patients.length,
    awaitingDressing: patients.filter((p) => p.status === "Awaiting Dressing").length,
    dressingComplete: patients.filter((p) => p.status === "Dressing Complete").length,
    completed: patients.filter((p) => p.status === "Completed").length,
    emergencyPatients: patients.filter((p) => p.priority === "Emergency").length,
    averageWait: patients.length
      ? Math.round(patients.reduce((sum, p) => sum + getMinutesDifference(p.visitTime), 0) / patients.length)
      : 0,
    patientsWithAlerts: patients.filter((p) => p.dressingAlerts && p.dressingAlerts.length > 0).length
  };

  const uniqueClinics = [...new Set(patients.map(p => p.clinic))];
  const uniqueWoundTypes = [...new Set(patients.map(p => p.woundType))].filter(Boolean);

  const getPatientTimeInfo = (patient: Patient) => {
    const arrival = formatTime(patient.visitTime);
    const wait = getMinutesDifference(patient.visitTime);
    return { arrival, wait };
  };

  const handleCompleteDressing = async (patientId: string) => {
    setIsLoading(true);
    try {
      // Update API
      const response = await fetch(`${API_URL}/api/visits/${patientId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "Dressing Complete",
          location: "Waiting for Doctor",
          last_dressing_at: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to complete dressing");
      }
      
      // Update local state
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: "Dressing Complete",
                location: "Waiting for Doctor",
                lastDressingAt: new Date().toISOString(),
              }
            : p
        )
      );
      
      toast({
        title: "Success",
        description: "Dressing completed successfully",
        variant: "success",
      });
    } catch (err) {
      setError("Failed to complete dressing");
      toast({
        title: "Error",
        description: "Failed to complete dressing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBackToQueue = async (patientId: string) => {
    setIsLoading(true);
    try {
      // Update API
      const response = await fetch(`${API_URL}/api/visits/${patientId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "Completed",
          location: "Returning to Queue",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send patient back to queue");
      }
      
      // Update local state
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: "Completed",
                location: "Returning to Queue",
              }
            : p
        )
      );
      
      toast({
        title: "Success",
        description: "Patient sent back to queue",
        variant: "success",
      });
    } catch (err) {
      setError("Failed to send patient back to queue");
      toast({
        title: "Error",
        description: "Failed to send patient back to queue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDressing = async (data: any) => {
    if (!selectedPatientForDressing || !data) {
      setAddDressingOpen(false);
      setSelectedPatientForDressing(null);
      return;
    }
    
    setIsLoading(true);
    try {
      // Update API
      const response = await fetch(`${API_URL}/api/visits/${selectedPatientForDressing.id}/dressing/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save dressing record");
      }
      
      // Update patient status
      await handleCompleteDressing(selectedPatientForDressing.id);
      
      // Update history (mock)
      const patientHistory = dressingsByPatientId[selectedPatientForDressing.id] || {
        patientId: selectedPatientForDressing.id,
        patientName: selectedPatientForDressing.name,
        personalNumber: selectedPatientForDressing.personalNumber || "",
        dressingsHistory: []
      };
      
      patientHistory.dressingsHistory.unshift({
        date: data.date,
        time: data.time,
        recordedBy: data.recordedBy,
        dressing: {
          woundType: data.woundType,
          location: data.location,
          dressingType: data.dressingType,
          woundCondition: data.woundCondition,
          woundSize: data.woundSize,
          drainage: data.drainage,
          painLevel: data.painLevel,
          skinCondition: data.skinCondition,
          observations: data.observations
        },
        alerts: [] // Mock no alerts
      });
      
      dressingsByPatientId[selectedPatientForDressing.id] = patientHistory;
      
      setAddDressingOpen(false);
      setSelectedPatientForDressing(null);
      
      toast({
        title: "Success",
        description: "Dressing recorded successfully",
        variant: "success",
      });
    } catch (err) {
      setError("Failed to record dressing");
      toast({
        title: "Error",
        description: "Failed to record dressing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTime = (date: string, time: string) => {
    const key = `${date}_${time}`;
    setExpandedTimes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="max-w-6xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Bandage className="h-8 w-8" />
                Dressing Room
              </CardTitle>
              <CardDescription>
                Patients sent from nursing queue for wound dressings
              </CardDescription>
            </div>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-auto p-0 text-destructive"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Dressing</CardTitle>
              <Bandage className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.awaitingDressing}</div>
            </CardContent>
          </Card>
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dressing Complete</CardTitle>
              <Bandage className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.dressingComplete}</div>
            </CardContent>
          </Card>
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Emergency</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.emergencyPatients}</div>
            </CardContent>
          </Card>
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">With Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.patientsWithAlerts}</div>
            </CardContent>
          </Card>
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait (min)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.averageWait}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <h2 className="font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Filter
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Awaiting Dressing">Awaiting Dressing</SelectItem>
                <SelectItem value="Dressing Complete">Dressing Complete</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={woundTypeFilter} onValueChange={setWoundTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by wound type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wound Types</SelectItem>
                {uniqueWoundTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={clinicFilter} onValueChange={setClinicFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by clinic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clinics</SelectItem>
                {uniqueClinics.map(clinic => (
                  <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
            {filteredPatients.length !== patients.length && (
              <span className="ml-2 text-blue-600">
                (filtered from {patients.length} total)
              </span>
            )}
          </div>
        </div>
        
        <div className="grid gap-4">
          {paginatedPatients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No patients found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || clinicFilter !== "all" || woundTypeFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No patients in dressing room at the moment"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedPatients.map((patient) => {
              const { arrival, wait } = getPatientTimeInfo(patient);
              const hasAlerts = patient.dressingAlerts && patient.dressingAlerts.length > 0;
              return (
                <Card
                  key={patient.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    hasAlerts || patient.priority === "Emergency" 
                      ? "border-2 border-red-500 bg-red-50/30" 
                      : patient.priority === "High" 
                      ? "border-2 border-orange-400 bg-orange-50/30" 
                      : patient.priority === "Medium"
                      ? "border-2 border-yellow-400 bg-yellow-50/30"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {patient.name}
                          {getDressingIcon(patient.dressingAlerts || [])}
                        </CardTitle>
                        <CardDescription>
                          ID: {patient.id} | Personal #: {patient.personalNumber} | Visit ID: {patient.visitId}
                        </CardDescription>
                        <CardDescription className="mt-1">
                          Clinic: {patient.clinic} | Visit Type: {patient.visitType}
                        </CardDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          {patient.gender} • Age: {patient.age} • {patient.employeeCategory} • {patient.phoneNumber}
                        </div>
                        {patient.dressingNotes && (
                          <div className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">
                            Note: {patient.dressingNotes}
                          </div>
                        )}
                        {hasAlerts && (
                          <div className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                            Alerts: {patient.dressingAlerts?.join(" • ")}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                          <Badge className={getPriorityColor(patient.priority)} variant="outline">
                            {patient.priority}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground text-right">
                          Arrived: {arrival} • Wait: {wait} min
                          {patient.assignedNurse && <div>Nurse: {patient.assignedNurse}</div>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { 
                          setSelectedPatientDressings(dressingsByPatientId[patient.id] || {
                            patientId: patient.id,
                            patientName: patient.name,
                            personalNumber: patient.personalNumber || "",
                            dressingsHistory: []
                          }); 
                          setHistoryOpen(true); 
                        }}
                      >
                        View History
                      </Button>
                      {patient.status === "Awaiting Dressing" && (
                        <Button 
                          onClick={() => {
                            setSelectedPatientForDressing(patient);
                            setAddDressingOpen(true);
                          }}
                          disabled={isLoading}
                          className="bg-gray-900 hover:bg-gray-900 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" /> 
                          Record Dressing
                        </Button>
                      )}
                      {patient.status === "Dressing Complete" && (
                        <Button 
                          onClick={() => handleSendBackToQueue(patient.id)}
                          disabled={isLoading}
                          className="bg-gray-900 hover:bg-gray-900 text-white"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Send Back to Queue
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
        
        {/* History Modal */}
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Dressing History - {selectedPatientDressings?.patientName}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
              {selectedPatientDressings ? (() => {
                const allDressings = selectedPatientDressings.dressingsHistory || [];
                const grouped: Record<string, typeof allDressings> = {};
                allDressings.forEach((v) => {
                  if (!grouped[v.date]) grouped[v.date] = [];
                  grouped[v.date].push(v);
                });
                const uniqueDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                const historyTotalPagesLocal = uniqueDates.length;
                const currentDate = uniqueDates[historyPage - 1];
                let records: DressingRecord[] = [];
                if (currentDate) {
                  records = grouped[currentDate].slice().sort((a, b) => b.time.localeCompare(a.time));
                }
                const currentDressingGroup = currentDate ? [{ date: currentDate, records }] : [];
                return (
                  <>
                    {currentDressingGroup.map(({ date, records }) => {
                      const top = records[0] || { alerts: [] };
                      return (
                        <div key={date} className="space-y-3 border rounded-lg p-4 mb-6">
                          {/* Visit-level header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {selectedPatientDressings.patientName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Personal Number: {selectedPatientDressings.personalNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {top.alerts.length ? (
                                <>
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  <Badge className="bg-red-100 text-red-800">Alerts</Badge>
                                </>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Normal</Badge>
                              )}
                            </div>
                          </div>
                          {/* Time entries (collapsible) */}
                          <div className="space-y-2">
                            {records.map((rec) => {
                              const key = `${rec.date}_${rec.time}`;
                              const open = !!expandedTimes[key];
                              return (
                                <div key={key} className="border rounded-md">
                                  <div className="flex items-center justify-between p-3">
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {rec.time} — {rec.dressing.woundType} ({rec.dressing.woundCondition})
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        Recorded by {rec.recordedBy} | Dressing: {rec.dressing.dressingType}
                                      </div>
                                      {rec.alerts.length > 0 && (
                                        <div className="text-xs text-red-600 mt-1">
                                          {rec.alerts.join(" • ")}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleTime(rec.date, rec.time)}
                                    >
                                      {open ? "▼ Hide" : "▶ Show"}
                                    </Button>
                                  </div>
                                  {open && (
                                    <div className="p-3 pt-0 space-y-3">
                                      {/* Dressing Details Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(rec.dressing).map(([k, v]) =>
                                          k !== "observations" ? (
                                            <div key={k} className="p-3 border rounded-lg">
                                              <Label className="text-sm font-medium text-gray-600">
                                                {labelFromKey(k)}
                                              </Label>
                                              <p className="text-lg font-semibold text-gray-900">
                                                {v || "Not recorded"}
                                              </p>
                                            </div>
                                          ) : null
                                        )}
                                      </div>
                                      {rec.dressing.observations && (
                                        <div className="p-3 border rounded-lg bg-blue-50">
                                          <Label className="text-sm font-medium text-gray-600">
                                            Observations
                                          </Label>
                                          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                            {rec.dressing.observations}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {/* Pagination (by dressing date) */}
                    {historyTotalPagesLocal > 1 && (
                      <div className="mt-2">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                              />
                            </PaginationItem>
                            {Array.from({ length: historyTotalPagesLocal }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={historyPage === i + 1}
                                  onClick={() => setHistoryPage(i + 1)}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  setHistoryPage((p) => Math.min(historyTotalPagesLocal, p + 1))
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                );
              })() : (
                <div className="text-center py-8">
                  <Bandage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No dressing history</h3>
                  <p className="text-sm text-muted-foreground">
                    This patient has no previous dressing records.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHistoryOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setAddDressingOpen(true)} className="bg-gray-900 hover:bg-gray-900 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Record Dressing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Dressing Modal */}
        <Dialog open={addDressingOpen} onOpenChange={setAddDressingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Record Dressing - {selectedPatientDressings?.patientName || selectedPatientForDressing?.name}
              </DialogTitle>
            </DialogHeader>
            <DressingForm
              onSubmit={handleAddDressing}
              initialData={{
                woundType: selectedPatientDressings?.dressingsHistory[0]?.dressing.woundType || selectedPatientForDressing?.woundType || "",
                location: selectedPatientDressings?.dressingsHistory[0]?.dressing.location || selectedPatientForDressing?.woundLocation || ""
              }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Simple dressing form component
interface DressingFormProps {
  onSubmit: (data: any) => void;
  initialData?: {
    woundType?: string;
    location?: string;
  };
}

const DressingForm: React.FC<DressingFormProps> = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    woundType: initialData.woundType || "",
    location: initialData.location || "",
    dressingType: "Gauze",
    woundCondition: "Healing Well",
    woundSize: "",
    drainage: "Minimal",
    painLevel: "0/10",
    skinCondition: "Normal",
    observations: "",
    ...initialData
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      recordedBy: "Current Nurse",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Wound Type *</Label>
          <Select value={formData.woundType} onValueChange={(value) => setFormData({...formData, woundType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Surgical">Surgical</SelectItem>
              <SelectItem value="Burn">Burn</SelectItem>
              <SelectItem value="Trauma">Trauma</SelectItem>
              <SelectItem value="Pressure Ulcer">Pressure Ulcer</SelectItem>
              <SelectItem value="Diabetic">Diabetic</SelectItem>
              <SelectItem value="Venous">Venous</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Location *</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Dressing Type *</Label>
          <Select value={formData.dressingType} onValueChange={(value) => setFormData({...formData, dressingType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gauze">Gauze</SelectItem>
              <SelectItem value="Foam">Foam</SelectItem>
              <SelectItem value="Transparent Film">Transparent Film</SelectItem>
              <SelectItem value="Hydrogel">Hydrogel</SelectItem>
              <SelectItem value="Alginate">Alginate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Wound Condition *</Label>
          <Select value={formData.woundCondition} onValueChange={(value) => setFormData({...formData, woundCondition: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Healing Well">Healing Well</SelectItem>
              <SelectItem value="Stable">Stable</SelectItem>
              <SelectItem value="Improving">Improving</SelectItem>
              <SelectItem value="Deteriorating">Deteriorating</SelectItem>
              <SelectItem value="Signs of Infection">Signs of Infection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Wound Size</Label>
          <Input
            value={formData.woundSize}
            onChange={(e) => setFormData({...formData, woundSize: e.target.value})}
            placeholder="e.g., 5cm x 3cm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Drainage</Label>
          <Select value={formData.drainage} onValueChange={(value) => setFormData({...formData, drainage: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Minimal clear">Minimal clear</SelectItem>
              <SelectItem value="Minimal serous">Minimal serous</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Heavy">Heavy</SelectItem>
              <SelectItem value="Purulent">Purulent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Pain Level</Label>
          <Select value={formData.painLevel} onValueChange={(value) => setFormData({...formData, painLevel: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 11 }, (_, i) => (
                <SelectItem key={i} value={`${i}/10`}>{i}/10</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Skin Condition</Label>
          <Select value={formData.skinCondition} onValueChange={(value) => setFormData({...formData, skinCondition: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Dry">Dry</SelectItem>
              <SelectItem value="Red">Red</SelectItem>
              <SelectItem value="Swollen">Swollen</SelectItem>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Cool">Cool</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium">Observations</Label>
        <Textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.observations}
          onChange={(e) => setFormData({...formData, observations: e.target.value})}
          placeholder="Additional observations, notes, or concerns..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gray-900 hover:bg-gray-900 text-white">
          Record Dressing
        </Button>
      </div>
    </form>
  );
};