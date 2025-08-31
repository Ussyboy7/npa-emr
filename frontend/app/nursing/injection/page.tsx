"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Syringe, AlertTriangle, Plus, Clock, RefreshCw, Users, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  status: "Awaiting Injection" | "Injection Complete" | "Completed";
  location: string;
  assignedNurse?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  employeeCategory?: string;
  injectionAlerts?: string[];
  injectionNotes?: string;
  lastInjectionAt?: string;
}

interface InjectionRecord {
  date: string;
  time: string;
  recordedBy: string;
  injection: {
    medication: string;
    dosage: string;
    route: string;
    site: string;
    batchNumber: string;
    expiryDate: string;
    manufacturer: string;
    indication: string;
    comment: string;
  };
  alerts: string[];
}

interface PatientInjectionData {
  patientId: string;
  patientName: string;
  personalNumber: string;
  injectionsHistory: InjectionRecord[];
}

// Simple injection form component
const InjectionForm = ({ onSubmit, patientName, currentNurse }) => {
  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    route: "Subcutaneous",
    site: "",
    batchNumber: "",
    expiryDate: "",
    manufacturer: "",
    indication: "",
    comment: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      recordedBy: currentNurse,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Medication *</label>
          <Input
            value={formData.medication}
            onChange={(e) => setFormData({...formData, medication: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Dosage *</label>
          <Input
            value={formData.dosage}
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Route *</label>
          <Select value={formData.route} onValueChange={(value) => setFormData({...formData, route: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
              <SelectItem value="Intramuscular">Intramuscular</SelectItem>
              <SelectItem value="Intravenous">Intravenous</SelectItem>
              <SelectItem value="Oral">Oral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Injection Site *</label>
          <Input
            value={formData.site}
            onChange={(e) => setFormData({...formData, site: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Batch Number</label>
          <Input
            value={formData.batchNumber}
            onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Expiry Date</label>
          <Input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Manufacturer</label>
          <Input
            value={formData.manufacturer}
            onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Indication</label>
          <Input
            value={formData.indication}
            onChange={(e) => setFormData({...formData, indication: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Comments</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows="3"
          value={formData.comment}
          onChange={(e) => setFormData({...formData, comment: e.target.value})}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
          Cancel
        </Button>
        <Button type="submit">Record Injection</Button>
      </div>
    </form>
  );
};

// Helper functions
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const getMinutesDifference = (fromDate, toDate = new Date()) => {
  const from = new Date(fromDate);
  return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
};

const subtractMinutes = (minutes) => {
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
    status: "Awaiting Injection",
    priority: "High",
    location: "Injection Room",
    clinic: "General",
    visitType: "Consultation",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(25),
    assignedNurse: "Nurse Alice",
    gender: "Male",
    age: 30,
    phoneNumber: "+234-801-234-5678",
    employeeCategory: "Employee",
    injectionAlerts: ["Insulin administration required"],
    injectionNotes: "Patient has Type 1 diabetes, requires insulin before meals"
  },
  {
    id: "P002",
    patientId: "P002",
    name: "Jane Smith",
    personalNumber: "EMP002",
    visitId: "V002",
    status: "Awaiting Injection",
    priority: "Medium",
    location: "Injection Room", 
    clinic: "General",
    visitType: "Follow Up",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(15),
    assignedNurse: "Nurse Bob",
    gender: "Female",
    age: 45,
    phoneNumber: "+234-804-567-8901",
    employeeCategory: "Employee",
    injectionNotes: "Monthly B12 injection due"
  },
  {
    id: "P003",
    patientId: "P003",
    name: "Michael Johnson",
    personalNumber: "EMP003",
    visitId: "V003",
    status: "Awaiting Injection",
    priority: "Low",
    location: "Injection Room",
    clinic: "General",
    visitType: "Vaccination",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(5),
    assignedNurse: "Nurse Carol",
    gender: "Male",
    age: 28,
    phoneNumber: "+234-805-678-9012",
    employeeCategory: "Employee",
    injectionNotes: "Flu vaccine"
  },
  {
    id: "P004",
    patientId: "P004",
    name: "Sarah Wilson",
    personalNumber: "EMP004",
    visitId: "V004",
    status: "Awaiting Injection",
    priority: "Medium",
    location: "Injection Room", 
    clinic: "General",
    visitType: "Follow Up",
    visitDate: "2025-08-29",
    visitTime: subtractMinutes(15),
    assignedNurse: "Nurse Bob",
    gender: "Female",
    age: 45,
    phoneNumber: "+234-804-567-8901",
    employeeCategory: "Employee",
    injectionNotes: "Monthly B12 injection due"
  },
];

const injectionsByPatientId = {
  P001: {
    patientId: "P001",
    patientName: "John Doe",
    personalNumber: "EMP001",
    injectionsHistory: [
      // Same day with multiple injections at different times
      {
        date: "2025-08-15",
        time: "09:30",
        recordedBy: "Nurse Alice",
        injection: {
          medication: "Insulin",
          dosage: "10 units",
          route: "Subcutaneous",
          site: "Abdomen",
          batchNumber: "INS2025-001",
          expiryDate: "2026-01-15",
          manufacturer: "PharmaCorp",
          indication: "Type 1 Diabetes",
          comment: "Pre-breakfast shot, patient tolerated well.",
        },
        alerts: [],
      },
      {
        date: "2025-08-15",
        time: "18:45",
        recordedBy: "Nurse Bob",
        injection: {
          medication: "Insulin",
          dosage: "8 units",
          route: "Subcutaneous",
          site: "Thigh",
          batchNumber: "INS2025-001",
          expiryDate: "2026-01-15",
          manufacturer: "PharmaCorp",
          indication: "Type 1 Diabetes",
          comment: "Evening dose, rotation site as planned.",
        },
        alerts: [],
      },
      // Another day
      {
        date: "2025-08-12",
        time: "10:00",
        recordedBy: "Nurse Carol",
        injection: {
          medication: "Vitamin B12",
          dosage: "1000 mcg",
          route: "Intramuscular",
          site: "Deltoid muscle (left)",
          batchNumber: "VB12-2025-045",
          expiryDate: "2025-12-30",
          manufacturer: "VitaPharm",
          indication: "B12 deficiency",
          comment: "Monthly B12 supplement injection.",
        },
        alerts: [],
      },
      // Older injection
      {
        date: "2025-08-10",
        time: "14:30",
        recordedBy: "Nurse Dan",
        injection: {
          medication: "Tetanus Vaccine",
          dosage: "0.5 mL",
          route: "Intramuscular",
          site: "Deltoid muscle (right)",
          batchNumber: "TET2025-089",
          expiryDate: "2025-11-20",
          manufacturer: "VaccinePlus",
          indication: "Wound prophylaxis",
          comment: "Patient had minor cut, vaccine administered as precaution.",
        },
        alerts: [],
      },
    ],
  },
  P002: {
    patientId: "P002",
    patientName: "Jane Smith",
    personalNumber: "987654321",
    injectionsHistory: [
      {
        date: "2025-08-14",
        time: "11:00",
        recordedBy: "Nurse Eve",
        injection: {
          medication: "Ceftriaxone",
          dosage: "1 gram",
          route: "Intravenous",
          site: "Left antecubital vein",
          batchNumber: "CEF2025-123",
          expiryDate: "2025-10-15",
          manufacturer: "AntibioLab",
          indication: "Bacterial infection",
          comment: "Patient reports mild burning sensation during administration.",
        },
        alerts: ["Patient experienced mild discomfort during administration"],
      },
      {
        date: "2025-08-11",
        time: "09:15",
        recordedBy: "Nurse Frank",
        injection: {
          medication: "Morphine",
          dosage: "5 mg",
          route: "Intramuscular",
          site: "Gluteal muscle",
          batchNumber: "MOR2025-067",
          expiryDate: "2026-03-20",
          manufacturer: "PainRelief Inc",
          indication: "Post-operative pain management",
          comment: "Administered for severe post-surgical pain.",
        },
        alerts: ["Controlled substance - documented and witnessed"],
      },
    ],
  },
  P003: {
    patientId: "P003",
    patientName: "Michael Johnson",
    personalNumber: "456789123",
    injectionsHistory: [
      {
        date: "2025-08-13",
        time: "16:20",
        recordedBy: "Nurse Grace",
        injection: {
          medication: "Influenza Vaccine",
          dosage: "0.5 mL",
          route: "Intramuscular",
          site: "Deltoid muscle (left)",
          batchNumber: "FLU2025-201",
          expiryDate: "2026-06-30",
          manufacturer: "FluShield",
          indication: "Annual flu prevention",
          comment: "Routine annual flu vaccination, no adverse reactions.",
        },
        alerts: [],
      },
    ],
  },
  P004: {
    patientId: "P004",
    patientName: "Sarah Wilson", 
    personalNumber: "EMP004",
    injectionsHistory: [
      {
        date: "2025-08-29",
        time: "11:30",
        recordedBy: "Nurse Bob",
        injection: {
          medication: "Vitamin B12",
          dosage: "1000 mcg",
          route: "Intramuscular",
          site: "Deltoid muscle (right)",
          batchNumber: "VB12-2025-040",
          expiryDate: "2025-12-30", 
          manufacturer: "VitaPharm",
          indication: "B12 deficiency",
          comment: "Previous monthly injection, patient tolerated well.",
        },
        alerts: [],
      }
    ],
  }
};

/**
 * Get icon and color based on injection type/alerts
 */
const getInjectionIcon = (alerts) => {
  if (alerts && alerts.length > 0) {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  return <Syringe className="h-4 w-4 text-blue-500" />;
};

const getStatusColor = (status) => {
  switch (status) {
    case "Awaiting Injection":
      return "bg-red-100 text-red-800 border-red-200";
    case "Injection Complete":
      return "bg-green-100 text-green-800 border-green-200";
    case "Completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority) => {
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
const labelFromKey = (key) => {
  const labels = {
    medication: "Medication",
    dosage: "Dosage",
    route: "Route of Administration",
    site: "Injection Site",
    batchNumber: "Batch Number",
    expiryDate: "Expiry Date",
    manufacturer: "Manufacturer",
    indication: "Indication",
    comment: "Comments/Notes"
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export default function PatientInjections() {
  const [patients, setPatients] = useState(() => createInitialPatients());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addInjectionOpen, setAddInjectionOpen] = useState(false);
  const [selectedPatientInjections, setSelectedPatientInjections] = useState<PatientInjectionData | null>(null);
  const [selectedPatientForInjection, setSelectedPatientForInjection] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [clinicFilter, setClinicFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedTimes, setExpandedTimes] = useState({});
  
  const pageSize = 6;

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (historyOpen) {
      setHistoryPage(1);
      setExpandedTimes({});
    }
  }, [historyOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPatients(prev => [...prev]);
    } catch (err) {
      setError("Failed to refresh injection queue data");
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
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term) ||
          p.visitId.toLowerCase().includes(term) ||
          p.personalNumber?.toLowerCase().includes(term) ||
          p.clinic.toLowerCase().includes(term) ||
          p.assignedNurse?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [patients, statusFilter, priorityFilter, clinicFilter, searchTerm]);

  const priorityOrder = { Emergency: 0, High: 1, Medium: 2, Low: 3 };
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
  }, [statusFilter, priorityFilter, clinicFilter, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPatients.slice(start, start + pageSize);
  }, [sortedPatients, currentPage, pageSize]);

  const stats = {
    total: patients.length,
    awaitingInjection: patients.filter((p) => p.status === "Awaiting Injection").length,
    injectionComplete: patients.filter((p) => p.status === "Injection Complete").length,
    completed: patients.filter((p) => p.status === "Completed").length,
    emergencyPatients: patients.filter((p) => p.priority === "Emergency").length,
    averageWait: patients.length
      ? Math.round(patients.reduce((sum, p) => sum + getMinutesDifference(p.visitTime), 0) / patients.length)
      : 0,
    patientsWithAlerts: patients.filter((p) => p.injectionAlerts && p.injectionAlerts.length > 0).length
  };

  const uniqueClinics = [...new Set(patients.map(p => p.clinic))];

  const getPatientTimeInfo = (patient) => {
    const arrival = formatTime(patient.visitTime);
    const wait = getMinutesDifference(patient.visitTime);
    return { arrival, wait };
  };

  const handleCompleteInjection = async (patientId) => {
    setIsLoading(true);
    try {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: "Injection Complete",
                location: "Waiting for Doctor",
                lastInjectionAt: new Date().toISOString(),
              }
            : p
        )
      );
      setError(null);
    } catch (err) {
      setError("Failed to complete injection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBackToQueue = async (patientId) => {
    setIsLoading(true);
    try {
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
      setError(null);
    } catch (err) {
      setError("Failed to send patient back to queue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInjection = (data) => {
    if (!selectedPatientForInjection || !data) {
      setAddInjectionOpen(false);
      setSelectedPatientForInjection(null);
      return;
    }

    console.log("New injection added for patient:", selectedPatientForInjection.name, data);
    handleCompleteInjection(selectedPatientForInjection.id);
    
    // Update history (mock)
    const patientHistory = injectionsByPatientId[selectedPatientForInjection.id] || {
      patientId: selectedPatientForInjection.id,
      patientName: selectedPatientForInjection.name,
      personalNumber: selectedPatientForInjection.personalNumber || "",
      injectionsHistory: []
    };
    patientHistory.injectionsHistory.unshift({
      date: data.date,
      time: data.time,
      recordedBy: data.recordedBy,
      injection: {
        medication: data.medication,
        dosage: data.dosage,
        route: data.route,
        site: data.site,
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        manufacturer: data.manufacturer,
        indication: data.indication,
        comment: data.comment
      },
      alerts: [] // Mock no alerts
    });
    injectionsByPatientId[selectedPatientForInjection.id] = patientHistory;
    
    setAddInjectionOpen(false);
    setSelectedPatientForInjection(null);
  };

  const toggleTime = (date, time) => {
    const key = `${date}_${time}`;
    setExpandedTimes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Injection Room</h2>
            <p className="text-muted-foreground">Patients sent from nursing queue for injections</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Injection</CardTitle>
            <Syringe className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.awaitingInjection}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Injection Complete</CardTitle>
            <Syringe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.injectionComplete}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emergency</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergencyPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.patientsWithAlerts}</div>
          </CardContent>
        </Card>

        <Card>
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <SelectItem value="Awaiting Injection">Awaiting Injection</SelectItem>
              <SelectItem value="Injection Complete">Injection Complete</SelectItem>
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
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || clinicFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No patients in injection room at the moment"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedPatients.map((patient) => {
            const { arrival, wait } = getPatientTimeInfo(patient);
            const hasAlerts = patient.injectionAlerts && patient.injectionAlerts.length > 0;

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
                        {getInjectionIcon(patient.injectionAlerts || [])}
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
                      {patient.injectionNotes && (
                        <div className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">
                          Note: {patient.injectionNotes}
                        </div>
                      )}
                      {hasAlerts && (
                        <div className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                          Alerts: {patient.injectionAlerts?.join(" • ")}
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
                        setSelectedPatientInjections(injectionsByPatientId[patient.id] || {
                          patientId: patient.id,
                          patientName: patient.name,
                          personalNumber: patient.personalNumber || "",
                          injectionsHistory: []
                        }); 
                        setHistoryOpen(true); 
                      }}
                    >
                      View History
                    </Button>

                    {patient.status === "Awaiting Injection" && (
                      <Button 
                        onClick={() => {
                          setSelectedPatientForInjection(patient);
                          setAddInjectionOpen(true);
                        }}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-2" /> 
                        Administer Injection
                      </Button>
                    )}

                    {patient.status === "Injection Complete" && (
                      <Button 
                        onClick={() => handleSendBackToQueue(patient.id)}
                        disabled={isLoading}
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
            <DialogTitle>Injection History - {selectedPatientInjections?.patientName}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            {selectedPatientInjections ? (() => {
              const allInjections = selectedPatientInjections.injectionsHistory || [];
              const grouped = {};
              allInjections.forEach((v) => {
                if (!grouped[v.date]) grouped[v.date] = [];
                grouped[v.date].push(v);
              });
              const uniqueDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
              const historyTotalPagesLocal = uniqueDates.length;
              const currentDate = uniqueDates[historyPage - 1];
              let records = [];
              if (currentDate) {
                records = grouped[currentDate].slice().sort((a, b) => b.time.localeCompare(a.time));
              }
              const currentInjectionGroup = currentDate ? [{ date: currentDate, records }] : [];

              return (
                <>
                  {currentInjectionGroup.map(({ date, records }) => {
                    const top = records[0] || { alerts: [] };
                    return (
                      <div key={date} className="space-y-3 border rounded-lg p-4 mb-6">
                        {/* Visit-level header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {selectedPatientInjections.patientName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Personal Number: {selectedPatientInjections.personalNumber}
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
                                      {rec.time} — {rec.injection.medication} ({rec.injection.dosage})
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      Administered by {rec.recordedBy} via {rec.injection.route}
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
                                    {/* Injection Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(rec.injection).map(([k, v]) =>
                                        k !== "comment" ? (
                                          <div key={k} className="p-3 border rounded-lg">
                                            <label className="text-sm font-medium text-gray-600">
                                              {labelFromKey(k)}
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                              {v || "Not recorded"}
                                            </p>
                                          </div>
                                        ) : null
                                      )}
                                    </div>

                                    {rec.injection.comment && (
                                      <div className="p-3 border rounded-lg bg-blue-50">
                                        <label className="text-sm font-medium text-gray-600">
                                          Comments/Notes
                                        </label>
                                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                          {rec.injection.comment}
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
                  {/* Pagination (by injection date) */}
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
                <Syringe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No injection history</h3>
                <p className="text-sm text-muted-foreground">
                  This patient has no previous injection records.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setAddInjectionOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Injection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Injection Modal */}
      <Dialog open={addInjectionOpen} onOpenChange={setAddInjectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Administer Injection - {selectedPatientForInjection?.name || selectedPatientInjections?.patientName}
            </DialogTitle>
          </DialogHeader>
          <InjectionForm
            onSubmit={handleAddInjection}
            patientName={selectedPatientForInjection?.name || selectedPatientInjections?.patientName}
            currentNurse={selectedPatientForInjection?.assignedNurse || "Current Nurse"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}