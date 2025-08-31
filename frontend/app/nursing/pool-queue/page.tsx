// This is the PoolQueue component code
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Activity, Stethoscope, UserCheck, ArrowRight, Clock, Syringe, AlertTriangle, RefreshCw, Users } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import VitalsForm from "@/components/nurse/vitalsform"; // Import the VitalsForm component
import { ViewVitalsModal } from "@/components/nurse/viewvitals"; // Import the ViewVitalsModal component

// VitalsData interface - aligned with the new component
interface VitalsData {
 id?: string;
 height: string;
 weight: string;
 temperature: string;
 pulse: string;
 respiratoryRate: string;
 bloodPressureSystolic: string;
 bloodPressureDiastolic: string;
 oxygenSaturation: string;
 fbs: string;
 rbs: string;
 painScale: string;
 bodymassindex: string;
 comment?: string;
 recordedAt?: string;
 recordedBy?: string;
}

// Helper functions to replace dayjs functionality
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
 hour12: true 
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

// Status checking functions
  const getVitalStatus = (field: keyof typeof normalRanges, value: string): 'normal' | 'high' | 'low' | 'critical' => {
    if (!value || value === '') return 'normal';
    
    const numValue = parseFloat(value);
    const range = normalRanges[field];
    
    if (!range) return 'normal';
    
    // Check critical ranges first
    if (numValue <= range.critical.min || numValue >= range.critical.max) return 'critical';
    
    // Check normal ranges
    if (numValue >= range.min && numValue <= range.max) return 'normal';
    if (numValue > range.max) return 'high';
    if (numValue < range.min) return 'low';
    
    return 'normal';
  };


// Normal ranges and validation
const normalRanges = {
  temperature: { min: 36.1, max: 37.2, unit: '°C', critical: { min: 35, max: 39 } },
  bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg', critical: { min: 70, max: 180 } },
  bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg', critical: { min: 40, max: 120 } },
  pulse: { min: 60, max: 100, unit: 'bpm', critical: { min: 50, max: 120 } },
  respiratoryRate: { min: 12, max: 20, unit: '/min', critical: { min: 8, max: 30 } },
  oxygenSaturation: { min: 95, max: 100, unit: '%', critical: { min: 90, max: 100 } },
  fbs: { min: 70, max: 99, unit: 'mg/dL', critical: { min: 40, max: 400 } },
  rbs: { min: 70, max: 140, unit: 'mg/dL', critical: { min: 40, max: 400 } },
  painScale: { min: 0, max: 3, unit: '/10', critical: { min: 0, max: 10 } }
};

  const getRecordOverallStatus = (record: Patient): 'normal' | 'alert' => {
    if (!record.vitals) return 'normal';
    
     const vitalsToCheck = [
   { field: 'temperature', value: record.vitals.temperature },
   { field: 'pulse', value: record.vitals.pulse },
   { field: 'oxygenSaturation', value: record.vitals.oxygenSaturation }
 ];

    for (const vital of vitalsToCheck) {
      if (vital.value) {
        const status = getVitalStatus(vital.field as keyof typeof normalRanges, vital.value);
        if (status === 'critical' || status === 'high' || status === 'low') {
          return 'alert';
        }
      }
    }
    return 'normal';
  };

// Helper function: compute vitals alerts based on thresholds
const computeVitalsAlerts = (vitals: VitalsData): string[] => {
 const alerts: string[] = [];

 if (!vitals) return alerts;

 const { temperature, pulse, respiratoryRate, bloodPressureSystolic, bloodPressureDiastolic, oxygenSaturation, fbs, rbs } = vitals;

 // Temperature alert
 if (temperature && Number(temperature) >= 38) {
 alerts.push("High Temperature");
 }

 // Pulse alert
 if (pulse && (Number(pulse) < 50 || Number(pulse) > 100)) {
 alerts.push("Abnormal Pulse");
 }

 // Respiratory Rate alert
 if (respiratoryRate && (Number(respiratoryRate) < 12 || Number(respiratoryRate) > 20)) {
 alerts.push("Abnormal Respiratory Rate");
 }

 // Blood pressure alert (simple check)
 if (bloodPressureSystolic && bloodPressureDiastolic) {
 const systolic = Number(bloodPressureSystolic);
 const diastolic = Number(bloodPressureDiastolic);
 if (systolic >= 140 || diastolic >= 90) {
 alerts.push("High Blood Pressure");
 } else if (systolic < 90 || diastolic < 60) {
 alerts.push("Low Blood Pressure");
 }
 }

 // Oxygen saturation alert
 if (oxygenSaturation) {
 const spo2 = parseInt(oxygenSaturation);
 if (!isNaN(spo2)) {
 if (spo2 < 90) {
 alerts.push("Critical Low O2 Saturation (<90%)");
 } else if (spo2 < 95) {
 alerts.push("Low O2 Saturation (<95%)");
 }
 }
 }

 // Blood sugar alerts
 if (fbs) {
 const fbsValue = parseInt(fbs);
 if (!isNaN(fbsValue)) {
 if (fbsValue < 70) {
 alerts.push("Low Fasting Blood Sugar (<70 mg/dL)");
 } else if (fbsValue >= 126) {
 alerts.push("High Fasting Blood Sugar (≥126 mg/dL)");
 }
 }
 }

 if (rbs) {
 const rbsValue = parseInt(rbs);
 if (!isNaN(rbsValue)) {
 if (rbsValue < 70) {
 alerts.push("Low Random Blood Sugar (<70 mg/dL)");
 } else if (rbsValue >= 200) {
 alerts.push("High Random Blood Sugar (≥200 mg/dL)");
 }
 }
 }

 return alerts;
};

// UPDATED: Aligned with visit management structure
interface Patient {
 id: string;
 patientId: string; // Added to match visit structure
 name: string;
 personalNumber?: string;
 visitId: string;
 clinic: string;
 visitDate: string;
 visitTime: string;
 visitType: string;
 priority: "Emergency" | "High" | "Medium" | "Low"; // Aligned with visit priorities
 
 // Nursing-specific fields
 status: "Awaiting Vitals" | "Vitals Complete" | "Completed" | "Sent to Injection" | "Sent to Dressing" | "Sent to Ward";
 location: string;
 assignedNurse?: string;
 consultationRoom?: string;
 vitals?: VitalsData;
 vitalsAlerts?: string[]; 
 statusNote?: string;
 completedAt?: string;
 
 // Additional patient info from visit management
 gender?: string;
 age?: number;
 phoneNumber?: string;
 email?: string;
 employeeCategory?: string;
}

interface ViewVitalsData {
 id: string;
 patientName: string;
 personalNumber: string;
 date: string;
 time: string;
 vitals: VitalsData;
 recordedBy: string;
 alerts: string[];
}

// Inline ConsultationRoomPicker Component
interface Room {
 id: string;
 name: string;
 status: 'available' | 'occupied';
}

const ConsultationRoomPicker = ({ 
 onSelectRoom, 
 rooms 
}: {
 onSelectRoom: (roomId: string) => void;
 rooms: Room[];
}) => {
 return (
 <div className="space-y-4">
 <p className="text-sm text-muted-foreground">
 Select an available consultation room for the patient:
 </p>
 <div className="grid grid-cols-2 gap-3">
 {rooms.map((room) => (
 <Button
 key={room.id}
 variant={room.status === 'available' ? 'default' : 'secondary'}
 disabled={room.status === 'occupied'}
 onClick={() => onSelectRoom(room.id)}
 className="h-20 flex flex-col items-center justify-center"
 >
 <span className="font-medium">{room.name}</span>
 <span className="text-xs mt-1 capitalize">
 {room.status === 'available' ? '✓ Available' : '✗ Occupied'}
 </span>
 </Button>
 ))}
 </div>
 </div>
 );
};

const PoolQueue = () => {
 // UPDATED: Mock data now reflects confirmed visits that would come from visit management
 const [patients, setPatients] = useState<Patient[]>([
 {
 id: "P001",
 patientId: "P001",
 name: "John Doe",
 personalNumber: "EMP001",
 visitId: "V001",
 status: "Awaiting Vitals",
 priority: "High",
 location: "Nurse Queue",
 clinic: "General",
 visitType: "Consultation",
 visitDate: "2025-08-28",
 visitTime: subtractMinutes(45),
 assignedNurse: "",
 gender: "Male",
 age: 30,
 phoneNumber: "+234-801-234-5678",
 employeeCategory: "Employee"
 },
 {
 id: "P002", 
 patientId: "P002",
 name: "Jane Smith",
 personalNumber: "EMP002", 
 visitId: "V002",
 status: "Vitals Complete",
 priority: "Medium",
 location: "Waiting for Doctor",
 clinic: "Eye",
 visitType: "Follow Up",
 visitDate: "2025-08-28",
 visitTime: subtractMinutes(30),
 assignedNurse: "Nurse Mary",
 gender: "Female",
 age: 55,
 phoneNumber: "+234-802-345-6789",
 employeeCategory: "Retiree",
  vitals: {
   bloodPressureSystolic: "120",
   bloodPressureDiastolic: "80",
   temperature: "36.8", 
   pulse: "75",
   respiratoryRate: "16",
   oxygenSaturation: "99",
   height: "165",
   weight: "60",
   fbs: "90",
   rbs: "110",
   painScale: "0",
   bodymassindex: "22.04",
   comment: "",
 },
 vitalsAlerts: [],
 },
 {
 id: "P003",
 patientId: "P003", 
 name: "Michael Johnson",
 personalNumber: "EMP003",
 visitId: "V003",
 status: "Vitals Complete",
 priority: "Emergency",
 location: "Waiting for Doctor",
 clinic: "General",
 visitType: "Emergency",
 visitDate: "2025-08-28", 
 visitTime: subtractMinutes(10),
 assignedNurse: "Nurse Mary",
 gender: "Male",
 age: 42,
 phoneNumber: "+234-803-456-7890",
 employeeCategory: "Employee",
  vitals: {
   bloodPressureSystolic: "145",
   bloodPressureDiastolic: "95",
   temperature: "38.8",
   pulse: "85", 
   respiratoryRate: "18",
   oxygenSaturation: "96",
   height: "170",
   weight: "65",
   fbs: "90",
   rbs: "110",
   painScale: "7",
   bodymassindex: "22.49",
   comment: "Patient reports feeling unwell and chest discomfort",
 },
 vitalsAlerts: ["High Temperature", "High Blood Pressure"],
 }
 ]);

 const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
 const [dialogOpen, setDialogOpen] = useState(false);
 const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
 const [vitalsPatientId, setVitalsPatientId] = useState<string | null>(null);
 const [editingVitalsPatientId, setEditingVitalsPatientId] = useState<string | null>(null);
 const [viewVitalsPatient, setViewVitalsPatient] = useState<any | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 const [statusFilter, setStatusFilter] = useState<string>("all");
 const [priorityFilter, setPriorityFilter] = useState<string>("all");
 const [clinicFilter, setClinicFilter] = useState<string>("all");
 const [currentPage, setCurrentPage] = useState<number>(1);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const pageSize = 6;

 const [bulkSelected, setBulkSelected] = useState<string[]>([]);
 const [showBulkActions, setShowBulkActions] = useState(false);
 const [bulkActionType, setBulkActionType] = useState<'consultation' | 'injection' | 'dressing' | 'ward' | null>(null);

 // Auto-refresh every 30s
 useEffect(() => {
 const interval = setInterval(() => {
 handleRefresh();
 }, 30000);
 return () => clearInterval(interval);
 }, []);

 // Initialize vitals alerts for existing patients
 useEffect(() => {
 setPatients((prevPatients) =>
 prevPatients.map((patient) => ({
 ...patient,
 vitalsAlerts: patient.vitals && !patient.vitalsAlerts 
 ? computeVitalsAlerts(patient.vitals) 
 : patient.vitalsAlerts || [],
 }))
 );
 }, []);

 // Mock API refresh function - In real implementation, this would fetch from backend
 const handleRefresh = async () => {
 setIsRefreshing(true);
 try {
 // RECOMMENDATION: In real implementation, this would call an API endpoint
 // that fetches confirmed visits from the visit management system
 // Example: const response = await fetchConfirmedVisitsForNursing();
 
 await new Promise(resolve => setTimeout(resolve, 1000));
 setPatients(prev => [...prev]);
 } catch (err) {
 setError("Failed to refresh patient data");
 } finally {
 setIsRefreshing(false);
 }
 };

 // Enhanced search with comprehensive filtering
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
 p.assignedNurse?.toLowerCase().includes(term) ||
 p.visitType.toLowerCase().includes(term)
 );
 }
 
 return filtered;
 }, [patients, statusFilter, priorityFilter, clinicFilter, searchTerm]);

 // Enhanced sorting - Emergency first, then by priority, then by wait time
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

 const getPatientTimeInfo = (patient: Patient) => {
 const arrival = formatTime(patient.visitTime);
 const wait = getMinutesDifference(patient.visitTime);
 return { arrival, wait };
 };

 const getBadgeColor = (status: string) => {
 switch (status) {
 case "Awaiting Vitals":
 return "bg-red-100 text-red-800 border-red-200";
 case "Vitals Complete":
 return "bg-yellow-100 text-yellow-800 border-yellow-200";
 case "Completed":
 return "bg-green-100 text-green-800 border-green-200";
 case "Sent to Injection":
 case "Sent to Dressing":
 case "Sent to Ward":
 return "bg-blue-100 text-blue-800 border-blue-200";
 default:
 return "bg-gray-100 text-gray-800 border-gray-200";
 }
 };

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

 // Action handlers with error handling
 const handleRecordVitals = (patientId: string) => {
 try {
 setVitalsPatientId(patientId);
 setEditingVitalsPatientId(null);
 setVitalsDialogOpen(true);
 setError(null);
 } catch (err) {
 setError("Failed to open vitals form");
 }
 };

 const handleEditVitals = (patientId: string) => {
 try {
 setVitalsPatientId(null);
 setEditingVitalsPatientId(patientId);
 setVitalsDialogOpen(true);
 setError(null);
 } catch (err) {
 setError("Failed to open vitals form");
 }
 };

 const getPatientVitals = (patientId: string): VitalsData | undefined => {
 const patient = patients.find((p) => p.id === patientId);
 return patient?.vitals;
 };

 const handleVitalsSubmit = async (data: VitalsData) => {
 const targetId = editingVitalsPatientId ?? vitalsPatientId;
 if (!targetId) return;

 setIsLoading(true);
 try {
 const alerts = computeVitalsAlerts(data);

 setPatients((prev) =>
 prev.map((p) =>
 p.id === targetId
 ? { 
 ...p, 
 status: "Vitals Complete" as const, 
 location: "Waiting for Doctor", 
 vitals: data,
 vitalsAlerts: alerts
 }
 : p
 )
 );

 setVitalsDialogOpen(false);
 setVitalsPatientId(null);
 setEditingVitalsPatientId(null);
 setError(null);
 } catch (err) {
 setError("Failed to save vitals data");
 } finally {
 setIsLoading(false);
 }
 };

 const handleSendToConsultation = async (roomId: string) => {
 if (!selectedPatientId) return;

 setIsLoading(true);
 try {
 setPatients((prev) =>
 prev.map((p) =>
 p.id === selectedPatientId
 ? {
 ...p,
 status: "Completed" as const,
 location: roomId,
 consultationRoom: roomId,
 statusNote: `Consultation (${roomId})`,
 completedAt: new Date().toISOString(),
 }
 : p
 )
 );

 setDialogOpen(false);
 setSelectedPatientId(null);
 setError(null);
 } catch (err) {
 setError("Failed to send patient to consultation");
 } finally {
 setIsLoading(false);
 }
 };

 const handleSendToService = async (patientId: string, service: "Injection" | "Dressing" | "Ward") => {
 setIsLoading(true);
 try {
 setPatients((prev) =>
 prev.map((p) =>
 p.id === patientId 
 ? { 
 ...p, 
 status: `Sent to ${service}` as const, 
 location: `${service} Room` 
 } 
 : p
 )
 );
 setError(null);
 } catch (err) {
 setError(`Failed to send patient to ${service}`);
 } finally {
 setIsLoading(false);
 }
 };

  const getPatientVitalsData = (id: string) => {
   const patient = patients.find((p) => p.id === id);
   if (!patient || !patient.vitals) return null;

   return {
     id,
     patientName: patient.name,
     personalNumber: patient.personalNumber || "N/A",
     date: patient.visitDate,
     time: formatTimeWithAMPM(patient.visitTime),
     vitals: patient.vitals,
     recordedBy: patient.assignedNurse || "N/A",
     alerts: patient.vitalsAlerts || [],
   };
 };

 // Calculate stats
 const averageWait = patients.length
 ? Math.round(patients.reduce((sum, p) => sum + getMinutesDifference(p.visitTime), 0) / patients.length)
 : 0;

 const stats = {
 total: patients.length,
 awaitingVitals: patients.filter((p) => p.status === "Awaiting Vitals").length,
 vitalsComplete: patients.filter((p) => p.status === "Vitals Complete").length,
 completed: patients.filter((p) => p.status === "Completed").length,
 emergencyPatients: patients.filter((p) => p.priority === "Emergency").length,
 averageWait,
 patientsWithAlerts: patients.filter((p) => p.vitalsAlerts && p.vitalsAlerts.length > 0).length
 };

 const uniqueClinics = [...new Set(patients.map(p => p.clinic))];

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 setBulkSelected(paginatedPatients.map(p => p.id));
 } else {
 setBulkSelected([]);
 }
 };

  const handleBulkSend = (service: 'consultation' | 'injection' | 'dressing' | 'ward', roomId?: string) => {
   if (bulkSelected.length === 0) return;

   setIsLoading(true);
   try {
     setPatients((prev) =>
       prev.map((p) =>
         bulkSelected.includes(p.id)
           ? {
               ...p,
               status: service === 'consultation' ? "Completed" : 
                 service === 'injection' ? "Sent to Injection" :
                 service === 'dressing' ? "Sent to Dressing" :
                 "Sent to Ward",
               location: service === 'consultation' ? (roomId || '') : `${service.charAt(0).toUpperCase() + service.slice(1)} Room`,
               consultationRoom: service === 'consultation' ? roomId : undefined,
               statusNote: service === 'consultation' ? `Consultation (${roomId})` : undefined,
               completedAt: new Date().toISOString(),
             }
           : p
       )
     );

     setShowBulkActions(false);
     setBulkSelected([]);
     setBulkActionType(null);
     setError(null);
   } catch (err) {
     setError(`Failed to send patients to ${service}`);
   } finally {
     setIsLoading(false);
   }
 };

 return (
 <main className="flex-1 p-6 md:p-8 space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Nursing Pool Queue</h1>
 <p className="text-muted-foreground">
 Manage confirmed visits - record vitals, send to consultation, and follow doctor orders.
 </p>
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

 {/* Error Alert */}
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

 {/* Enhanced Summary cards with nursing-relevant metrics */}
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
 <CardTitle className="text-sm font-medium">Awaiting Vitals</CardTitle>
 <Stethoscope className="h-4 w-4 text-red-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-red-600">{stats.awaitingVitals}</div>
 </CardContent>
 </Card>

 <Card className="transition hover:shadow-lg hover:scale-[1.02]">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-medium">Vitals Complete</CardTitle>
 <UserCheck className="h-4 w-4 text-yellow-600" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-yellow-600">{stats.vitalsComplete}</div>
 </CardContent>
 </Card>

 <Card className="transition hover:shadow-lg hover:scale-[1.02]">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-medium">Completed</CardTitle>
 <Activity className="h-4 w-4 text-green-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
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
 <CardTitle className="text-sm font-medium">Avg Wait (min)</CardTitle>
 <Clock className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-orange-600">{stats.averageWait}</div>
 </CardContent>
 </Card>
 </div>

 {/* Enhanced search & filter section */}
 <div className="space-y-4 p-4 border rounded-lg bg-card">
 <h2 className="font-semibold flex items-center gap-2">
 <Search className="h-4 w-4" />
 Search & Filter
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
 {/* Search input */}
 <div className="md:col-span-2">
 <div className="relative">
 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search patients, ID, personal number, clinic..."
 className="pl-8"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>

 {/* Status filter */}
 <Select value={statusFilter} onValueChange={setStatusFilter}>
 <SelectTrigger>
 <SelectValue placeholder="Filter by status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Status</SelectItem>
 <SelectItem value="Awaiting Vitals">Awaiting Vitals</SelectItem>
 <SelectItem value="Vitals Complete">Vitals Complete</SelectItem>
 <SelectItem value="Completed">Completed</SelectItem>
 <SelectItem value="Sent to Injection">Sent to Injection</SelectItem>
 <SelectItem value="Sent to Dressing">Sent to Dressing</SelectItem>
  <SelectItem value="Sent to Ward">Sent to Ward</SelectItem>
 </SelectContent>
 </Select>

 {/* Priority filter */}
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

 {/* Clinic filter */}
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

 {/* Results summary */}
 <div className="text-sm text-gray-600">
 Showing {paginatedPatients.length} of {filteredPatients.length} patients
 {filteredPatients.length !== patients.length && (
 <span className="ml-2 text-blue-600">
 (filtered from {patients.length} total)
 </span>
 )}
 </div>
 </div>

 {/* Patient list */}
 <div className="space-y-4">
 {paginatedPatients.length === 0 ? (
 <Card>
 <CardContent className="flex flex-col items-center justify-center py-12">
 <Search className="h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold text-muted-foreground mb-2">No patients found</h3>
 <p className="text-sm text-muted-foreground text-center">
 {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || clinicFilter !== "all"
 ? "Try adjusting your search or filter criteria"
 : "No patients in the queue at the moment"
 }
 </p>
 </CardContent>
 </Card>
 ) : (
 paginatedPatients.map((patient) => {
 const { arrival, wait } = getPatientTimeInfo(patient);
 const hasAlerts = patient.vitalsAlerts && patient.vitalsAlerts.length > 0;
 
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
 <CardHeader className="flex justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 {patient.name}
 {hasAlerts && (
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger>
 <AlertTriangle className="h-4 w-4 text-red-500" />
 </TooltipTrigger>
 <TooltipContent>
 <div className="text-sm">
 {patient.vitalsAlerts?.map((alert, index) => (
 <div key={index} className="text-red-600">{alert}</div>
 ))}
 </div>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 )}
 </CardTitle>
 <CardDescription>
 ID: {patient.id} | Personal #: {patient.personalNumber} | Visit ID: {patient.visitId} | Clinic: {patient.clinic} | Visit Type: {patient.visitType}
 </CardDescription>
 {/* Patient demographics */}
 <div className="text-xs text-muted-foreground mt-1">
 {patient.gender} • Age: {patient.age} • {patient.employeeCategory} • {patient.phoneNumber}
 </div>
 </div>

 <div className="flex flex-col items-end">
 <div className="flex items-center space-x-2">
 {patient.status === "Completed" && (patient.statusNote || patient.consultationRoom) ? (
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Badge className={getBadgeColor(patient.status)}>
 {patient.status}
 </Badge>
 </TooltipTrigger>
 <TooltipContent>
 <div className="text-sm">
 {patient.statusNote ?? `Sent to Consultation${patient.consultationRoom ? ` (${patient.consultationRoom})` : ""}`}
 {patient.completedAt && (
 <div className="text-xs text-muted-foreground mt-1">
 {new Date(patient.completedAt).toLocaleString()}
 </div>
 )}
 </div>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 ) : (
 <Badge className={getBadgeColor(patient.status)}>{patient.status}</Badge>
 )}
 <Badge className={getPriorityColor(patient.priority)} variant="outline">{patient.priority}</Badge>
 </div>
 {patient.status === "Completed" && (patient.statusNote || patient.consultationRoom) && (
 <span className="text-xs text-gray-500 mt-1">
 {patient.statusNote ? `• ${patient.statusNote}` : `• Sent to Consultation (${patient.consultationRoom})`}
 </span>
 )}
 </div>
 </CardHeader>

 <CardContent className="flex justify-between items-center">
 <div className="text-sm text-muted-foreground">
 Arrived: {arrival} • Waiting: {wait} min
 {patient.location ? <> • Location: {patient.location}</> : null}
 {patient.assignedNurse ? <> • Nurse: {patient.assignedNurse}</> : null}
 </div>

 <div className="flex gap-2 flex-wrap">
 <Button 
 size="sm" 
 variant="outline" 
 onClick={() => {
 const vitalsData = getPatientVitalsData(patient.id);
 if (vitalsData) {
 setViewVitalsPatient(vitalsData);
 }
 }}
 disabled={!patient.vitals}
 >
 <Eye className="h-4 w-4 mr-1" />
 View
 </Button>

 {patient.status === "Awaiting Vitals" && (
 <Button size="sm" onClick={() => handleRecordVitals(patient.id)} disabled={isLoading}>
 <Stethoscope className="h-4 w-4 mr-1" />
 Record Vitals
 </Button>
 )}

 {patient.status === "Vitals Complete" && (
 <>
 <Button 
 size="sm" 
 onClick={() => { 
 setSelectedPatientId(patient.id); 
 setDialogOpen(true); 
 }} 
 disabled={isLoading}
 >
 <ArrowRight className="h-4 w-4 mr-1" />
 Send to Consultation
 </Button>

 <Button 
 size="sm" 
 variant="outline" 
 onClick={() => handleEditVitals(patient.id)} 
 disabled={isLoading}
 >
 <Edit className="h-4 w-4 mr-1" />
 Edit Vitals
 </Button>

 <Button 
 size="sm" 
 variant="ghost" 
 onClick={() => handleSendToService(patient.id, "Injection")} 
 disabled={isLoading}
 >
 <Syringe className="h-4 w-4 mr-1" />
 Injection
 </Button>
 
 <Button 
 size="sm" 
 variant="ghost" 
 onClick={() => handleSendToService(patient.id, "Dressing")} 
 disabled={isLoading}
 >
 <ArrowRight className="h-4 w-4 mr-1" />
 Dressing
 </Button>
 
 <Button 
 size="sm" 
 variant="ghost" 
 onClick={() => handleSendToService(patient.id, "Ward")} 
 disabled={isLoading}
 >
 <ArrowRight className="h-4 w-4 mr-1" />
 Ward
 </Button>
 </>
 )}
 </div>
 </CardContent>
 </Card>
 );
 })
 )}
 </div>

 {/* Pagination */}
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

 {/* Vitals Dialog - Now using VitalsForm */}
 <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
 <DialogTitle>{editingVitalsPatientId ? "Edit Vitals" : "Record Vitals"}</DialogTitle>
 <VitalsForm 
 onSubmit={(data) => handleVitalsSubmit(data)} 
 initialData={
 editingVitalsPatientId
 ? getPatientVitals(editingVitalsPatientId)
 : patients.find((p) => p.id === vitalsPatientId)?.vitals
 }
 />
 </DialogContent>
 </Dialog>

 {/* Consultation Room Dialog */}
 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
 <DialogContent>
 <DialogTitle>Select Consultation Room</DialogTitle>
 <ConsultationRoomPicker
 onSelectRoom={handleSendToConsultation}
 rooms={[
 { id: "Room 1", name: "Room 1", status: "available" },
 { id: "Room 2", name: "Room 2", status: "occupied" },
 { id: "Room 3", name: "Room 3", status: "available" },
 { id: "Room 4", name: "Room 4", status: "available" },
 { id: "Room 5", name: "CMO", status: "available" },
 { id: "Room 6", name: "AGM", status: "available" },
 { id: "Room 7", name: "GM", status: "available" },
 { id: "Room 8", name: "Eye", status: "available" },
 { id: "Room 9", name: "Physio", status: "available" },
 { id: "Room 10", name: "Diamond", status: "available" },
 { id: "Room 11", name: "SS", status: "available" },
 ]}
 />
 </DialogContent>
 </Dialog>

 {/* View Vitals Modal */}
 <ViewVitalsModal
   record={viewVitalsPatient}
   open={!!viewVitalsPatient}
   onClose={() => setViewVitalsPatient(null)}
 />
 </main>
 );
};

export default PoolQueue;