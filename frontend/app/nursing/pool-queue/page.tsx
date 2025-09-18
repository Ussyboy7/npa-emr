"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Edit,
  Activity,
  Stethoscope,
  UserCheck,
  ArrowRight,
  Clock,
  Syringe,
  AlertTriangle,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VitalsForm from "@/components/nurse/vitalsform";
import { ViewVitalsModal } from "@/components/nurse/viewvitals";
import ConsultationRoomPicker from "@/components/nurse/consultationroompicker";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

// Standardized interfaces
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

interface ConsultationRoom {
  id: string;
  name: string;
  status: "available" | "occupied";
}

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
  status:
    | "Scheduled"
    | "Confirmed"
    | "In Progress"
    | "In Nursing Pool"
    | "Completed"
    | "Cancelled"
    | "Rescheduled"
    | "Sent to Injection"
    | "Sent to Dressing"
    | "Sent to Ward";
  location: string;
  assignedNurse?: string;
  consultationRoom?: string;
  queuePosition?: number | null;
  vitals?: VitalsData;
  vitalsAlerts?: string[];
  statusNote?: string;
  completedAt?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
  employeeCategory?: string;
  doctorOrders?: string[];
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

// Helper functions
const formatTime = (dateString: string, timeString: string) => {
  const date = new Date(`${dateString}T${timeString}`);
  return isNaN(date.getTime())
    ? "Invalid Time"
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Lagos",
      });
};

const formatTimeWithAMPM = (dateString: string) => {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Invalid Time"
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Lagos",
      });
};

const getMinutesDifference = (visitDate: string, visitTime: string, toDate: Date = new Date()) => {
  const from = new Date(`${visitDate}T${visitTime}`);
  if (isNaN(from.getTime())) return 0;
  return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
};

// Normal ranges and validation
const normalRanges = {
  temperature: {
    min: 36.1,
    max: 37.2,
    unit: "°C",
    critical: { min: 35, max: 39 },
  },
  bloodPressureSystolic: {
    min: 90,
    max: 140,
    unit: "mmHg",
    critical: { min: 70, max: 180 },
  },
  bloodPressureDiastolic: {
    min: 60,
    max: 90,
    unit: "mmHg",
    critical: { min: 40, max: 120 },
  },
  pulse: { min: 60, max: 100, unit: "bpm", critical: { min: 50, max: 120 } },
  respiratoryRate: {
    min: 12,
    max: 20,
    unit: "/min",
    critical: { min: 8, max: 30 },
  },
  oxygenSaturation: {
    min: 95,
    max: 100,
    unit: "%",
    critical: { min: 90, max: 100 },
  },
  fbs: { min: 70, max: 99, unit: "mg/dL", critical: { min: 40, max: 400 } },
  rbs: { min: 70, max: 140, unit: "mg/dL", critical: { min: 40, max: 400 } },
  painScale: { min: 0, max: 3, unit: "/10", critical: { min: 0, max: 10 } },
};

// Status checking functions
const getVitalStatus = (
  field: keyof typeof normalRanges,
  value: string
): "normal" | "high" | "low" | "critical" => {
  if (!value || value === "") return "normal";
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "normal";
  
  const range = normalRanges[field];
  if (!range) return "normal";
  
  if (numValue <= range.critical.min || numValue >= range.critical.max)
    return "critical";
  
  if (numValue >= range.min && numValue <= range.max) return "normal";
  if (numValue > range.max) return "high";
  if (numValue < range.min) return "low";
  return "normal";
};

const getRecordOverallStatus = (record: Patient): "normal" | "alert" => {
  if (!record.vitals) return "normal";
  const vitalsToCheck = [
    { field: "temperature", value: record.vitals.temperature },
    { field: "pulse", value: record.vitals.pulse },
    { field: "oxygenSaturation", value: record.vitals.oxygenSaturation },
  ];
  for (const vital of vitalsToCheck) {
    if (vital.value) {
      const status = getVitalStatus(
        vital.field as keyof typeof normalRanges,
        vital.value
      );
      if (status === "critical" || status === "high" || status === "low") {
        return "alert";
      }
    }
  }
  return "normal";
};

// Helper function: compute vitals alerts
const computeVitalsAlerts = (vitals: VitalsData): string[] => {
  const alerts: string[] = [];
  if (!vitals) return alerts;
  
  const {
    temperature,
    pulse,
    respiratoryRate,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    oxygenSaturation,
    fbs,
    rbs,
  } = vitals;
  
  if (temperature && !isNaN(Number(temperature)) && Number(temperature) >= 38) {
    alerts.push("High Temperature");
  }
  
  if (pulse && !isNaN(Number(pulse)) && (Number(pulse) < 50 || Number(pulse) > 100)) {
    alerts.push("Abnormal Pulse");
  }
  
  if (
    respiratoryRate &&
    !isNaN(Number(respiratoryRate)) &&
    (Number(respiratoryRate) < 12 || Number(respiratoryRate) > 20)
  ) {
    alerts.push("Abnormal Respiratory Rate");
  }
  
  if (bloodPressureSystolic && bloodPressureDiastolic &&
      !isNaN(Number(bloodPressureSystolic)) && !isNaN(Number(bloodPressureDiastolic))) {
    const systolic = Number(bloodPressureSystolic);
    const diastolic = Number(bloodPressureDiastolic);
    if (systolic >= 140 || diastolic >= 90) {
      alerts.push("High Blood Pressure");
    } else if (systolic < 90 || diastolic < 60) {
      alerts.push("Low Blood Pressure");
    }
  }
  
  if (oxygenSaturation && !isNaN(parseInt(oxygenSaturation))) {
    const spo2 = parseInt(oxygenSaturation);
    if (spo2 < 90) {
      alerts.push("Critical Low O2 Saturation (<90%)");
    } else if (spo2 < 95) {
      alerts.push("Low O2 Saturation (<95%)");
    }
  }
  
  if (fbs && !isNaN(parseInt(fbs))) {
    const fbsValue = parseInt(fbs);
    if (fbsValue < 70) {
      alerts.push("Low Fasting Blood Sugar (<70 mg/dL)");
    } else if (fbsValue >= 126) {
      alerts.push("High Fasting Blood Sugar (≥126 mg/dL)");
    }
  }
  
  if (rbs && !isNaN(parseInt(rbs))) {
    const rbsValue = parseInt(rbs);
    if (rbsValue < 70) {
      alerts.push("Low Random Blood Sugar (<70 mg/dL)");
    } else if (rbsValue >= 200) {
      alerts.push("High Random Blood Sugar (≥200 mg/dL)");
    }
  }
  
  return alerts;
};

// Calculate BMI safely
const calculateBMI = (height: string, weight: string): string => {
  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  
  if (isNaN(heightNum) || isNaN(weightNum) || heightNum === 0) {
    return "";
  }
  
  const heightInMeters = heightNum / 100;
  const bmi = weightNum / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

// Ward Picker Component
const WardPicker = ({
  onSelectWardAndBed,
}: {
  onSelectWardAndBed: (wardType: "Male" | "Female", bedNumber: number) => void;
}) => {
  const [selectedWard, setSelectedWard] = useState<"Male" | "Female">("Male");
  const [selectedBed, setSelectedBed] = useState<number>(1);
  
  const handleSubmit = () => {
    onSelectWardAndBed(selectedWard, selectedBed);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ward-type">Ward Type</Label>
        <Select
          value={selectedWard}
          onValueChange={(value: "Male" | "Female") => setSelectedWard(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male Ward</SelectItem>
            <SelectItem value="Female">Female Ward</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="bed-number">Bed Number</Label>
        <Select
          value={selectedBed.toString()}
          onValueChange={(value) => setSelectedBed(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((bed) => (
              <SelectItem key={bed} value={bed.toString()}>
                Bed {bed}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Admit to {selectedWard} Ward Bed {selectedBed}
      </Button>
    </div>
  );
};

const PoolQueue = () => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  // State management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [vitalsPatientId, setVitalsPatientId] = useState<string | null>(null);
  const [editingVitalsPatientId, setEditingVitalsPatientId] = useState<string | null>(null);
  const [editingVitalsData, setEditingVitalsData] = useState<VitalsData | null>(null);
  const [viewVitalsPatient, setViewVitalsPatient] = useState<ViewVitalsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wardAdmissionOpen, setWardAdmissionOpen] = useState(false);
  const [wardAdmissionPatient, setWardAdmissionPatient] = useState<Patient | null>(null);
  
  // Consultation rooms state
  const [consultationRooms, setConsultationRooms] = useState<ConsultationRoom[]>([
    { id: "room-1", name: "Consultation Room 1", status: "available" },
    { id: "room-2", name: "Consultation Room 2", status: "available" },
    { id: "room-3", name: "Consultation Room 3", status: "available" },
    { id: "room-4", name: "Consultation Room 4", status: "available" },
    { id: "room-5", name: "Consultation Room 5", status: "available" },
    { id: "room-6", name: "CMO", status: "available" },
    { id: "room-7", name: "AGM", status: "available" },
    { id: "room-8", name: "GM", status: "available" },
    { id: "room-9", name: "Eye", status: "available" },
    { id: "room-10", name: "Physio", status: "available" },
    { id: "room-11", name: "Diamond", status: "available" },
    { id: "room-12", name: "SS", status: "available" },
  ]);
  
  const pageSize = 10;
  
  // Fetch patients from API
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== "all" && { status: statusFilter }),
        page: String(currentPage),
        page_size: String(pageSize),
        ...(searchTerm && { search: searchTerm }),
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
      const mappedPatients = (data.results || data).map((v: any) => {
        let vitals = v.vitals;
        if (vitals && vitals.height && vitals.weight) {
          vitals = {
            ...vitals,
            bodymassindex: calculateBMI(vitals.height, vitals.weight)
          };
        }
        
        return {
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
          location: v.location || "Nurse Queue",
          assignedNurse: v.assigned_nurse,
          consultationRoom: v.consultation_room,
          queuePosition: v.queue_position || null,
          vitals: vitals,
          vitalsAlerts: v.vitals_alerts || [],
          statusNote: v.status_note,
          completedAt: v.completed_at,
          gender: v.gender,
          age: v.age,
          phoneNumber: v.phone,
          email: v.email,
          employeeCategory: v.employee_category,
          doctorOrders: v.doctor_orders || [],
        };
      });
      
      setPatients(mappedPatients);
    } catch (err) {
      setError("Failed to fetch patient data");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, currentPage, pageSize, searchTerm, statusFilter, priorityFilter, clinicFilter]);
  
  // Fetch consultation rooms status
  const fetchConsultationRooms = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsultationRooms(data.results || data);
      }
    } catch (err) {
      // Use default rooms if endpoint fails
    }
  }, [API_URL]);
  
  // Auto-refresh every 30s
  useEffect(() => {
    fetchPatients();
    fetchConsultationRooms();
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPatients, fetchConsultationRooms]);
  
  // Initialize vitals alerts for existing patients
  useEffect(() => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => ({
        ...patient,
        vitalsAlerts:
          patient.vitals && !patient.vitalsAlerts
            ? computeVitalsAlerts(patient.vitals)
            : patient.vitalsAlerts || [],
      }))
    );
  }, []);
  
  // Mock API refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPatients();
      await fetchConsultationRooms();
    } catch (err) {
      setError("Failed to refresh patient data");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPatients, fetchConsultationRooms]);
  
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
          p.patientId.toLowerCase().includes(term) ||
          p.personalNumber?.toLowerCase().includes(term) ||
          p.clinic.toLowerCase().includes(term) ||
          p.assignedNurse?.toLowerCase().includes(term) ||
          p.visitType.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [patients, statusFilter, priorityFilter, clinicFilter, searchTerm]);
  
  // Enhanced sorting
  const priorityOrder = { Emergency: 0, High: 1, Medium: 2, Low: 3 };
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      const prioDiff =
        (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      if (prioDiff !== 0) return prioDiff;
      return new Date(`${a.visitDate}T${a.visitTime}`).getTime() - 
             new Date(`${b.visitDate}T${b.visitTime}`).getTime();
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
    const arrival = formatTime(patient.visitDate, patient.visitTime);
    const wait = getMinutesDifference(patient.visitDate, patient.visitTime);
    return { arrival, wait };
  };
  
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "In Nursing Pool":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Sent to Injection":
      case "Sent to Dressing":
      case "Sent to Ward":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Scheduled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Confirmed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Rescheduled":
        return "bg-orange-100 text-orange-800 border-orange-200";
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
  
  // Check if patient has doctor orders for services
  const hasDoctorOrders = (patient: Patient, service: string) => {
    return patient.doctorOrders?.includes(service.toLowerCase()) || false;
  };
  
  // Action handlers with error handling
  const handleRecordVitals = useCallback((patientId: string) => {
    try {
      setVitalsPatientId(patientId);
      setEditingVitalsPatientId(null);
      setEditingVitalsData(null);
      setVitalsDialogOpen(true);
      setError(null);
    } catch (err) {
      setError("Failed to open vitals form");
    }
  }, []);
  
  const handleEditVitals = useCallback((patientId: string) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      if (patient && patient.vitals) {
        setVitalsPatientId(null);
        setEditingVitalsPatientId(patientId);
        setEditingVitalsData(patient.vitals);
        setVitalsDialogOpen(true);
        setError(null);
      } else {
        setError("No vitals data found for this patient");
      }
    } catch (err) {
      setError("Failed to open vitals form");
    }
  }, [patients]);
  
  const getPatientVitals = useCallback((patientId: string): VitalsData | undefined => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.vitals;
  }, [patients]);
  
  const handleVitalsSubmit = useCallback(async (data: VitalsData) => {
    const targetId = editingVitalsPatientId ?? vitalsPatientId;
    if (!targetId) return;
  
    setIsLoading(true);
    try {
      const patient = patients.find((p) => p.id === targetId);
      if (!patient) throw new Error("Patient not found");

      // Save vitals to /api/vitals/
      const payload = {
        patient: patient.patientId,
        systolic: data.bloodPressureSystolic ? parseInt(data.bloodPressureSystolic) : null,
        diastolic: data.bloodPressureDiastolic ? parseInt(data.bloodPressureDiastolic) : null,
        heart_rate: data.pulse ? parseInt(data.pulse) : null,
        blood_sugar: data.fbs ? parseFloat(data.fbs) : null,
        rbs: data.rbs ? parseFloat(data.rbs) : null,
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        respiratory_rate: data.respiratoryRate ? parseInt(data.respiratoryRate) : null,
        oxygen_saturation: data.oxygenSaturation ? parseFloat(data.oxygenSaturation) : null,
        pain_scale: data.painScale ? parseInt(data.painScale) : null,
        comment: data.comment || null,
        recorded_by: "Current Nurse",
      };

      const vitalsResponse = await fetch(`${API_URL}/api/vitals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!vitalsResponse.ok) throw new Error("Failed to save vitals");

      // Update visit to "In Progress"
      const visitResponse = await fetch(`${API_URL}/api/visits/${patient.visitId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "In Progress",
          location: "Waiting for Doctor",
          nursing_received_at: new Date().toISOString(),
        }),
      });

      if (!visitResponse.ok) throw new Error("Failed to update visit");

      // Local update + auto-open picker
      const bmi = calculateBMI(data.height, data.weight);
      const alerts = computeVitalsAlerts({ ...data, bodymassindex: bmi });
      setPatients((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? { ...p, status: "In Progress", location: "Waiting for Doctor", vitals: { ...data, bodymassindex: bmi, recordedAt: new Date().toISOString(), recordedBy: "Current Nurse" }, vitalsAlerts: alerts }
            : p
        )
      );

      setVitalsDialogOpen(false);
      setSelectedPatientId(targetId);  // Trigger picker
      setDialogOpen(true);  // Auto-open ConsultationRoomPicker
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save vitals data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, editingVitalsPatientId, vitalsPatientId, patients]);
  
  const handleSendToConsultation = useCallback(async (roomId: string) => {
    if (!selectedPatientId) return;
  
    setIsLoading(true);
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) throw new Error("Patient not found");

      // Fetch room for queue/status
      const roomResponse = await fetch(`${API_URL}/api/rooms/${roomId}/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!roomResponse.ok) throw new Error("Failed to fetch room");
      const roomData = await roomResponse.json();
      const currentQueue = roomData.queue || [];
      const queuePosition = currentQueue.length + 1;
      const newStatus = roomData.status === "available" ? "In Progress" : "Queued";

      // Update visit
      const visitResponse = await fetch(`${API_URL}/api/visits/${selectedPatientId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          location: `${roomData.name} (Queue Position: ${queuePosition})`,
          consultation_room: roomId,
          queue_position: queuePosition,
          status_note: `Sent to ${roomData.name}${roomData.status === "occupied" ? " (Joined Queue)" : ""}`,
        }),
      });
      if (!visitResponse.ok) throw new Error("Failed to update visit");

      // Update room queue (PATCH)
      const updatedQueue = [...currentQueue, { patient_id: selectedPatientId, position: queuePosition }];
      await fetch(`${API_URL}/api/rooms/${roomId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ queue: updatedQueue }),
      });

      // Local update
      setPatients(prev => prev.map(p => p.id === selectedPatientId ? { ...p, status: newStatus, location: `${roomData.name} (Queue Position: ${queuePosition})`, consultationRoom: roomId, queuePosition } : p));

      setDialogOpen(false);
      setSelectedPatientId(null);
    } catch (err) {
      setError("Failed to assign room");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, selectedPatientId, patients]);
  
  const handleSendToService = useCallback(async (
    patientId: string,
    service: "Injection" | "Dressing" | "Ward"
  ) => {
    if (service === "Ward") {
      const selectedPatient = patients.find((p) => p.id === patientId);
      if (selectedPatient) {
        setWardAdmissionPatient(selectedPatient);
        setWardAdmissionOpen(true);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      const statusMap = {
        Injection: "Sent to Injection",
        Dressing: "Sent to Dressing",
        Ward: "Sent to Ward",
      };
      
      const locationMap = {
        Injection: "Injection Room",
        Dressing: "Dressing Room",
        Ward: "Ward",
      };
      
      // Update API
      const response = await fetch(`${API_URL}/api/visits/${patientId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: statusMap[service],
          location: locationMap[service],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send patient to ${service}`);
      }
      
      // Update local state
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: statusMap[service] as
                  | "Completed"
                  | "Sent to Injection"
                  | "Sent to Dressing"
                  | "Sent to Ward",
                location: locationMap[service],
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
  }, [API_URL, patients]);
  
  const handleWardAdmissionSubmit = useCallback(async (
    wardType: "Male" | "Female",
    bedNumber: number
  ) => {
    if (!wardAdmissionPatient) return;
    
    setIsLoading(true);
    try {
      // Update API
      const response = await fetch(
        `${API_URL}/api/visits/${wardAdmissionPatient.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: "Sent to Ward",
            location: `${wardType} Ward Bed ${bedNumber}`,
            assigned_nurse: "Current Nurse",
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to admit patient to ward");
      }
      
      // Update local state
      setPatients((prev) =>
        prev.map((p) =>
          p.id === wardAdmissionPatient.id
            ? {
                ...p,
                status: "Sent to Ward" as const,
                location: `${wardType} Ward Bed ${bedNumber}`,
                assignedNurse: "Current Nurse",
              }
            : p
        )
      );
      
      setWardAdmissionOpen(false);
      setWardAdmissionPatient(null);
      setError(null);
    } catch (err) {
      setError("Failed to admit patient to ward");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, wardAdmissionPatient]);
  
  // Fixed getPatientVitalsData function
  const getPatientVitalsData = useCallback((id: string): ViewVitalsData | null => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return null;

    const defaultVitals: VitalsData = {
      height: "",
      weight: "",
      temperature: "",
      pulse: "",
      respiratoryRate: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      oxygenSaturation: "",
      fbs: "",
      rbs: "",
      painScale: "",
      bodymassindex: "",
      comment: "",
      recordedAt: patient.vitals?.recordedAt || new Date().toISOString(),
      recordedBy: patient.vitals?.recordedBy || "Unknown",
    };

    const vitals = patient.vitals || defaultVitals;
    const alerts = patient.vitals ? computeVitalsAlerts(vitals) : [];

    return {
      id,
      patientName: patient.name,
      personalNumber: patient.personalNumber || "N/A",
      date: patient.vitals?.recordedAt?.split('T')[0] || patient.visitDate,
      time: patient.vitals?.recordedAt
        ? formatTimeWithAMPM(patient.vitals.recordedAt)
        : formatTimeWithAMPM(`${patient.visitDate}T${patient.visitTime}`),
      vitals: {
        ...vitals,
        bodymassindex: vitals.height && vitals.weight ? calculateBMI(vitals.height, vitals.weight) : "",
      },
      recordedBy: vitals.recordedBy || patient.assignedNurse || "N/A",
      alerts,
    };
  }, [patients]);

  // Calculate stats
  const averageWait = patients.length
    ? Math.round(
        patients.reduce(
          (sum, p) => sum + getMinutesDifference(p.visitDate, p.visitTime),
          0
        ) / patients.length
      )
    : 0;
  
  const stats = {
    total: patients.length,
    inNursingPool: patients.filter((p) => p.status === "In Nursing Pool").length,
    inProgress: patients.filter((p) => p.status === "In Progress").length,
    completed: patients.filter((p) => p.status === "Completed").length,
    emergencyPatients: patients.filter((p) => p.priority === "Emergency").length,
    averageWait,
    patientsWithAlerts: patients.filter(
      (p) => p.vitalsAlerts && p.vitalsAlerts.length > 0
    ).length,
  };
  
  const uniqueClinics = useMemo(() => [...new Set(patients.map((p) => p.clinic))], [patients]);
  
  const getVitalsInitialData = useCallback(() => {
    if (editingVitalsData) {
      return editingVitalsData;
    }
    return editingVitalsPatientId
      ? getPatientVitals(editingVitalsPatientId)
      : patients.find((p) => p.id === vitalsPatientId)?.vitals;
  }, [editingVitalsData, editingVitalsPatientId, vitalsPatientId, patients, getPatientVitals]);
  
  return (
    <Card className="max-w-7xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Nursing Pool Queue
          </CardTitle>
          <div className="flex gap-2">
            <Button
              className="bg-gray-900 hover:bg-gray-900 text-white"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
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
        
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                In Nursing Pool
              </CardTitle>
              <Users className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                {stats.inNursingPool}
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <UserCheck className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Wait (min)
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.averageWait}
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Emergency
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.emergencyPatients}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search & filter section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients, ID, personal number, clinic..."
                    className="pl-10"
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
                  <SelectItem value="In Nursing Pool">In Nursing Pool</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="Sent to Injection">Sent to Injection</SelectItem>
                  <SelectItem value="Sent to Dressing">Sent to Dressing</SelectItem>
                  <SelectItem value="Sent to Ward">Sent to Ward</SelectItem>
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
                  {uniqueClinics.map((clinic) => (
                    <SelectItem key={clinic} value={clinic}>
                      {clinic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {paginatedPatients.length} of {filteredPatients.length}{" "}
              patients
              {filteredPatients.length !== patients.length && (
                <span className="ml-2 text-blue-600">
                  (filtered from {patients.length} total)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Patient list */}
        <div className="space-y-4">
          {paginatedPatients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No patients found
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  clinicFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No patients in the queue at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedPatients.map((patient) => {
              const { arrival, wait } = getPatientTimeInfo(patient);
              const hasAlerts =
                patient.vitalsAlerts && patient.vitalsAlerts.length > 0;
              
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
                      <CardTitle className="text-lg flex items-center gap-2">
                        {patient.name}
                        {hasAlerts && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        Patient ID: {patient.patientId} | Personal #: {patient.personalNumber || "N/A"} | 
                        Clinic: {patient.clinic} | Visit Type: {patient.visitType}
                      </CardDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        {patient.gender ? `${patient.gender} • ` : ""} 
                        Age: {patient.age || "N/A"} • 
                        {patient.employeeCategory ? `${patient.employeeCategory} • ` : ""}
                        {patient.phoneNumber || "No Phone"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2">
                        {patient.status === "Completed" &&
                        (patient.statusNote || patient.consultationRoom) ? (
                          <Badge className={getBadgeColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        ) : (
                          <Badge className={getBadgeColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        )}
                        <Badge
                          className={getPriorityColor(patient.priority)}
                          variant="outline"
                        >
                          {patient.priority}
                        </Badge>
                      </div>
                      {patient.status === "Completed" &&
                        (patient.statusNote || patient.consultationRoom) && (
                          <span className="text-xs text-gray-500 mt-1">
                            {patient.statusNote
                              ? `• ${patient.statusNote}`
                              : `• Sent to Consultation (${patient.consultationRoom})`}
                          </span>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Arrived: {arrival} • Waiting: {wait} min
                      {patient.location ? (
                        <> • Location: {patient.location}</>
                      ) : null}
                      {patient.assignedNurse ? (
                        <> • Nurse: {patient.assignedNurse}</>
                      ) : null}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const vitalsData = getPatientVitalsData(patient.id);
                          if (vitalsData && patient.vitals) {
                            setViewVitalsPatient(vitalsData);
                          } else {
                            setError("No vitals data available to view");
                          }
                        }}
                        disabled={!patient.vitals}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {patient.status === "In Nursing Pool" && !patient.vitals && (
                        <Button
                          size="sm"
                          onClick={() => handleRecordVitals(patient.id)}
                          disabled={isLoading}
                          className="bg-gray-900 hover:bg-gray-900 text-white"
                        >
                          <Stethoscope className="h-4 w-4 mr-1" />
                          Record Vitals
                        </Button>
                      )}
                      
                      {patient.status === "In Progress" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setDialogOpen(true);
                            }}
                            disabled={isLoading}
                            className="bg-gray-900 hover:bg-gray-900 text-white"
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
                        </>
                      )}
                      
                      {patient.status === "Completed" && (
                        <>
                          {hasDoctorOrders(patient, 'injection') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleSendToService(patient.id, "Injection")
                              }
                              disabled={isLoading}
                            >
                              <Syringe className="h-4 w-4 mr-1" />
                              Injection
                            </Button>
                          )}
                          
                          {hasDoctorOrders(patient, 'dressing') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleSendToService(patient.id, "Dressing")
                              }
                              disabled={isLoading}
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Dressing
                            </Button>
                          )}
                          
                          {hasDoctorOrders(patient, 'ward') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleSendToService(patient.id, "Ward")
                              }
                              disabled={isLoading}
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Ward
                            </Button>
                          )}
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
        
        {/* Vitals Dialog */}
        <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>
              {editingVitalsPatientId ? "Edit Vitals" : "Record Vitals"}
            </DialogTitle>
            <VitalsForm
              onSubmit={handleVitalsSubmit}
              initialData={getVitalsInitialData()}
            />
          </DialogContent>
        </Dialog>
        
        {/* Consultation Room Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogTitle>Select Consultation Room</DialogTitle>
            <ConsultationRoomPicker
              isOpen={dialogOpen}
              onClose={() => setDialogOpen(false)}
              onSelectRoom={handleSendToConsultation}
              rooms={consultationRooms}
              title="Select Consultation Room"
              description="Choose a consultation room for the patient. Occupied rooms will add the patient to the queue."
            />
          </DialogContent>
        </Dialog>
        
        {/* View Vitals Modal */}
        <ViewVitalsModal
          record={viewVitalsPatient}
          open={!!viewVitalsPatient}
          onClose={() => setViewVitalsPatient(null)}
        />
        
        {/* Ward Admission Dialog */}
        <Dialog open={wardAdmissionOpen} onOpenChange={setWardAdmissionOpen}>
          <DialogContent>
            <DialogTitle>Admit to Ward</DialogTitle>
            <WardPicker
              onSelectWardAndBed={(wardType, bedNumber) => {
                if (wardAdmissionPatient) {
                  handleWardAdmissionSubmit(wardType, bedNumber);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PoolQueue;