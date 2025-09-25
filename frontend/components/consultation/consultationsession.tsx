"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  FileText,
  TestTube,
  Pill,
  Stethoscope,
  Building,
  Syringe,
  Activity,
  Save,
  AlertTriangle,
  Clock,
  ScanLine,
  MapPin,
  Users,
  CheckCircle,
  History as HistoryIcon,
} from "lucide-react";
import MedicalNotes from "@/components/consultation/medicalnotes";
import VitalsSection from "@/components/consultation/vitalssection";
import LabOrders from "@/components/consultation/laborders";
import Prescriptions from "@/components/consultation/prescriptions";
import NursingOrders from "@/components/consultation/nursingorders";
import Referrals from "@/components/consultation/referrals";
import PatientHistory from "@/components/consultation/patienthistory";
import SystemicExamination from "@/components/consultation/systemicexamination";
import RadiologyOrders from "@/components/consultation/radiologyorders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VitalsData, ConsultationProgress } from "@/types/consultation";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Patient {
  id: string;
  visitId: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  allergies: string[];
  NextOfKin?: string;
  chiefComplaint: string;
  assignedTo?: string;
  consultationRoom?: string;
  assignmentStatus: "Assigned" | "Unassigned" | "In Progress" | "Queued";
  waitTime: number;
  vitalsCompleted: boolean;
  sentFromNurse?: boolean;
  priority: "Emergency" | "High" | "Medium" | "Low";
  visitDate: string;
  visitTime: string;
  vitals?: VitalsData;
  vitalsAlerts?: string[];
}

interface ConsultationRoom {
  id: string;
  name: string;
  status: "available" | "occupied";
  currentPatient?: string;
  startTime?: string;
  doctor?: {
    id: string;
    name: string;
  };
  specialtyFocus?: string;
  totalConsultationsToday?: number;
  averageConsultationTime?: number;
  lastPatient?: string;
  queue?: any[];
}

interface ConsultationSessionProps {
  roomId: string;
  initialPatient?: Patient | null;
}

const ConsultationSession: React.FC<ConsultationSessionProps> = ({ roomId, initialPatient }) => {
  const router = useRouter();
  const [room, setRoom] = useState<ConsultationRoom | null>(null);
  const [showRoomQueueModal, setShowRoomQueueModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(initialPatient || null);
  const [activeTab, setActiveTab] = useState<string>("notes");
  const [showEndDialog, setShowEndDialog] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [consultationProgress, setConsultationProgress] = useState<ConsultationProgress>({
    notes: false,
    vitals: false,
    assessment: false,
    plan: false,
    lab: false,
    prescriptions: false,
    nursing: false,
    referrals: false,
    history: false,
    systemic: false,
    radiology: false,
  });
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState<number>(0);
  const [consultationStartTime] = useState<Date>(new Date());
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);

  // Fetch room details
  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else {
        toast.error("Failed to fetch room details");
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Failed to fetch room details");
    }
  }, [roomId]);

  // Fetch patients assigned to this room (queued or in progress)
  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/visits/?consultation_room=${roomId}&status__in=Queued,In%20Progress`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const patientsData = (data.results || data).map((visit: any) => ({
          id: visit.id,
          visitId: visit.id,
          patientId: visit.patient?.id || "",
          name: visit.patient_name,
          age: visit.patient.age,
          gender: visit.patient.gender,
          mrn: visit.personal_number,
          allergies: visit.patient.allergies || [],
          NextOfKin: visit.patient.nok_first_name ? `${visit.patient.nok_first_name} ${visit.patient.nok_last_name || ''}` : '',
          chiefComplaint: visit.special_instructions || "Not specified",
          assignedTo: visit.assigned_nurse,
          consultationRoom: roomId,
          assignmentStatus: visit.status as "Assigned" | "Unassigned" | "In Progress" | "Queued",
          waitTime: getMinutesDifference(visit.visit_date, visit.visit_time),
          vitalsCompleted: false, // Updated after fetching vitals
          sentFromNurse: visit.nursing_received_at !== null,
          priority: visit.priority,
          visitDate: visit.visit_date,
          visitTime: visit.visit_time,
        }));
        
        setPatients(patientsData);
        // Update vitalsCompleted for each patient
        for (const patient of patientsData) {
          if (patient.patientId) {
            await fetchPatientVitals(patient.patientId);
          }
        }
      } else {
        toast.error("Failed to fetch patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to fetch patients");
    }
  }, [roomId]);

  // Fetch vitals for the current patient
  const fetchPatientVitals = useCallback(async (patientId: string): Promise<VitalsData & { vitalsAlerts: string[] } | undefined> => {
    if (!patientId) return undefined;
    try {
      const response = await fetch(`${API_URL}/api/vitals/?patient=${patientId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        console.warn(`Failed to fetch vitals for patient ${patientId}: ${response.statusText}`);
        return undefined;
      }

      const data = await response.json();
      const vitalsList = data.results || data;

      if (vitalsList.length === 0) {
        return undefined;
      }

      const latestVitals = vitalsList.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      const height = latestVitals.height?.toString() || '';
      const weight = latestVitals.weight?.toString() || '';
      const vitals: VitalsData & { vitalsAlerts: string[] } = {
        id: latestVitals.id,
        height,
        weight,
        temperature: latestVitals.temperature?.toString() || '',
        pulse: latestVitals.heart_rate?.toString() || '',
        bloodPressureSystolic: latestVitals.systolic?.toString() || '',
        bloodPressureDiastolic: latestVitals.diastolic?.toString() || '',
        fbs: latestVitals.blood_sugar?.toString() || '',
        bodymassindex: height && weight ? calculateBMI(height, weight) : '',
        recordedAt: latestVitals.date,
        recordedBy: latestVitals.recorded_by || 'Unknown',
        vitalsAlerts: [],
      };

      // Calculate vitals alerts
      const vitalFields = [
        { id: 'temperature', label: 'Temperature', unit: '°C' },
        { id: 'bloodPressureSystolic', label: 'Systolic BP', unit: 'mmHg' },
        { id: 'bloodPressureDiastolic', label: 'Diastolic BP', unit: 'mmHg' },
        { id: 'pulse', label: 'Pulse', unit: 'bpm' },
        { id: 'fbs', label: 'Blood Sugar', unit: 'mg/dL' },
      ];

      vitalFields.forEach(({ id, label, unit }) => {
        const value = vitals[id as keyof VitalsData];
        const status = getVitalStatus(id, value);
        if (status !== 'normal') {
          vitals.vitalsAlerts.push(`${status.charAt(0).toUpperCase() + status.slice(1)} ${label}: ${value || 'Not recorded'}${unit}`);
        }
      });

      setCurrentPatient((prev) => {
        if (prev && prev.patientId === patientId && !prev.vitals) {
          return { ...prev, vitals, vitalsAlerts: vitals.vitalsAlerts, vitalsCompleted: !!vitals };
        }
        return prev;
      });
      setPatients((prev) =>
        prev.map((p) => {
          if (p.patientId === patientId && !p.vitals) {
            return { ...p, vitals, vitalsAlerts: vitals.vitalsAlerts, vitalsCompleted: !!vitals };
          }
          return p;
        })
      );
      return vitals;
    } catch (err) {
      console.error(`Error fetching vitals for patient ${patientId}:`, err);
      return undefined;
    }
  }, []);

  // Unified getVitalStatus
  const getVitalStatus = (type: string, value: string | undefined): 'normal' | 'high' | 'low' | 'critical' => {
    if (!value || value === '') return 'normal';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';

    switch (type) {
      case "bloodPressureSystolic":
        if (numValue >= 180) return 'critical';
        if (numValue >= 140) return 'high';
        if (numValue < 90) return 'low';
        return 'normal';
      case "bloodPressureDiastolic":
        if (numValue >= 120) return 'critical';
        if (numValue >= 90) return 'high';
        if (numValue < 60) return 'low';
        return 'normal';
      case "temperature":
        if (numValue >= 39) return 'critical';
        if (numValue >= 38) return 'high';
        if (numValue < 36) return 'low';
        return 'normal';
      case "pulse":
        if (numValue >= 120) return 'critical';
        if (numValue >= 100) return 'high';
        if (numValue < 60) return 'low';
        return 'normal';
      case "fbs":
        if (numValue >= 400) return 'critical';
        if (numValue >= 126) return 'high';
        if (numValue < 70) return 'low';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const calculateBMI = (height: string, weight: string): string => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum === 0) {
      return '';
    }

    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);
    return bmi.toFixed(2);
  };

  // Fetch room and patients on mount
  useEffect(() => {
    fetchRoom();
    fetchPatients();
  }, [fetchRoom, fetchPatients]);

  // Separate effect for fetching current patient vitals
  useEffect(() => {
    if (currentPatient && !currentPatient.vitals && currentPatient.patientId) {
      fetchPatientVitals(currentPatient.patientId);
    }
  }, [currentPatient, fetchPatientVitals]);

  // Calculate elapsed session time and edit permissions
  useEffect(() => {
    const checkEditPermission = () => {
      const now = new Date();
      const timeDiff = now.getTime() - consultationStartTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      setCanEdit(hoursDiff < 24);
    };

    const updateElapsedTime = () => {
      const now = new Date();
      const timeDiff = now.getTime() - consultationStartTime.getTime();
      const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
      setSessionTimeElapsed(minutesElapsed);
    };

    checkEditPermission();
    updateElapsedTime();

    const interval = setInterval(() => {
      checkEditPermission();
      updateElapsedTime();
    }, 60000);
    return () => clearInterval(interval);
  }, [consultationStartTime]);

  // Save all consultation data
  const handleSaveAll = useCallback(async () => {
    try {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success("Consultation data saved successfully");
      // TODO: Implement API call to save all consultation data to /api/sessions/
    } catch (error) {
      console.error("Error saving consultation data:", error);
      toast.error("Failed to save consultation data");
    }
  }, []);

  // End consultation
  const handleEndConsultation = () => {
    setShowEndDialog(true);
  };

  const confirmEndConsultation = async () => {
    setIsEnding(true);
    try {
      await handleSaveAll();
      await generateConsultationSummary();

      if (rescheduleAppointment && appointmentDate && appointmentTime) {
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}Z`);
        await fetch(`${API_URL}/api/visits/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            patient: currentPatient?.patientId,
            visit_date: appointmentDate,
            visit_time: appointmentTime,
            visit_type: "follow-up",
            clinic: room?.specialtyFocus || "General",
            priority: currentPatient?.priority || "Medium",
            status: "Scheduled",
            visit_location: room?.name || "Unknown",
          }),
        });
        toast.success("Appointment rescheduled successfully");
      }

      // Update visit status instead of session
      await fetch(`${API_URL}/api/visits/${currentPatient?.visitId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "completed",
          consultation_end_time: new Date().toISOString(),
        }),
      });

      // Update room status
      await fetch(`${API_URL}/api/rooms/${roomId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "available",
          current_patient: null,
          end_time: new Date().toISOString(),
        }),
      });

      toast.success("Consultation ended successfully");
      router.push("/consultation/start-consultation");
    } catch (error) {
      console.error("Error ending consultation:", error);
      toast.error("Failed to end consultation");
    } finally {
      setIsEnding(false);
      setShowEndDialog(false);
    }
  };

  // Generate consultation summary
  const generateConsultationSummary = async () => {
    try {
      toast("Generating consultation summary...");
      // TODO: Implement API call to generate summary
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    }
  };

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setConsultationProgress((prev) => ({
      ...prev,
      [newTab]: true,
    }));
    setHasUnsavedChanges(true);
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const completed = Object.values(consultationProgress).filter(Boolean).length;
    return (completed / Object.keys(consultationProgress).length) * 100;
  };

  // Format elapsed time
  const formatTimeElapsed = (minutes: number) => {
    return `${minutes} min`;
  };

  // Handle starting consultation with a specific patient
  const handleStartWithPatient = async (patient: Patient) => {
    try {
      // Update visit status
      await fetch(`${API_URL}/api/visits/${patient.visitId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "In Progress",
          consultation_start_time: new Date().toISOString(),
          assigned_doctor: room?.doctor?.id || "current-doctor",  // From user context
        }),
      });

      // Update room: occupied, remove from queue, set current_patient
      const currentQueue = room?.queue || [];
      const updatedQueue = currentQueue.filter((q: any) => q.patient_id !== patient.visitId);
      await fetch(`${API_URL}/api/rooms/${roomId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "occupied",
          current_patient: patient.patientId,
          queue: updatedQueue,
          start_time: new Date().toISOString(),
        }),
      });

      // Update room state
      setRoom((prev) => prev ? { 
        ...prev, 
        currentPatient: patient.patientId, 
        queue: updatedQueue, 
        status: "occupied", 
        startTime: new Date().toISOString() 
      } : prev);
      
      setCurrentPatient(patient);
      setShowRoomQueueModal(false);
      toast.success(`Started consultation with ${patient.name}`);
      
      // Refresh patients to update the queue
      fetchPatients();
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast.error("Failed to start consultation");
    }
  };

  // Handle starting consultation with the next patient
  const handleStartWithNextPatient = async () => {
    const waitingPatients = patients
      .filter((p) => (p.assignmentStatus === "Queued" || p.assignmentStatus === "In Progress") && p.consultationRoom === roomId)
      .sort((a, b) => {
        const priorityOrder = { Emergency: 1, High: 2, Medium: 3, Low: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || getMinutesDifference(a.visitDate, a.visitTime) - getMinutesDifference(b.visitDate, b.visitTime);
      });

    const nextPatient = waitingPatients[0];
    if (nextPatient) {
      // Update visit status
      await fetch(`${API_URL}/api/visits/${nextPatient.visitId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "In Progress",
          consultation_start_time: new Date().toISOString(),
          assigned_doctor: "current-doctor",  // From user context
        }),
      });

      // Update room: occupied, remove from queue, set current_patient
      const currentQueue = room?.queue || [];
      const updatedQueue = currentQueue.filter((q: any) => q.patient_id !== nextPatient.visitId);
      await fetch(`${API_URL}/api/rooms/${roomId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "occupied",
          current_patient: nextPatient.patientId,
          queue: updatedQueue,
          start_time: new Date().toISOString(),
        }),
      });

      // Update room state
      setRoom((prev) => prev ? { 
        ...prev, 
        currentPatient: nextPatient.patientId, 
        queue: updatedQueue, 
        status: "occupied", 
        startTime: new Date().toISOString() 
      } : prev);
      
      setCurrentPatient(nextPatient);
      fetchPatients();  // Refresh queue
      toast.success(`Started consultation with ${nextPatient.name}`);
    } else {
      toast("No waiting patients");
    }
  };

  // Helper function for waiting time
  const getMinutesDifference = (visitDate: string, visitTime: string, toDate: Date = new Date()): number => {
    const from = new Date(`${visitDate}T${visitTime}Z`);
    if (isNaN(from.getTime())) return 0;
    return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
  };

  // Badge color helpers
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "occupied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string): string => {
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

  // Format arrived time
  const formatTime = (dateString: string, timeString: string): string => {
    const date = new Date(`${dateString}T${timeString}Z`);
    return isNaN(date.getTime())
      ? "Invalid Time"
      : date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Africa/Lagos",
        });
  };

  // Helper to get current patient details from ID
  const getCurrentPatientDetails = () => {
    if (!room?.currentPatient || !currentPatient) return null;
    return patients.find(p => p.patientId === room.currentPatient) || currentPatient;
  };

  if (!room || !currentPatient) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Active Consultation</CardTitle>
            <CardDescription>
              No patient is currently assigned to Room {room?.name || "selected room"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/consultation/start-consultation")}>
              Back to Consultation Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPatientDetails = getCurrentPatientDetails();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Session</h1>
            <p className="text-gray-600">Room: {room.name} • {room.doctor?.name || "Unknown Doctor"}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Session Duration: {formatTimeElapsed(sessionTimeElapsed)}</span>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              {lastSaved && (
                <span>
                  Last saved: {lastSaved.toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" })}
                </span>
              )}
              {!canEdit && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Edit period expired
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveAll}>
              <Save className="mr-2 h-4 w-4" />
              Save All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowRoomQueueModal(true)}>
              <MapPin className="mr-2 h-4 w-4" />
              Room Queue
            </Button>
            <Button onClick={handleEndConsultation} variant="destructive" size="sm">
              End Consultation
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Consultation Progress</span>
            <span>{Math.round(getProgressPercentage())}% completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
              role="progressbar"
              aria-valuenow={getProgressPercentage()}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Consultation progress"
            />
          </div>
        </div>
      </div>

      {/* Room Queue Modal */}
      <Dialog open={showRoomQueueModal} onOpenChange={() => setShowRoomQueueModal(false)}>
        <DialogContent className="max-w-5xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{room.name} Queue</DialogTitle>
            <DialogDescription>Patients waiting for {room.name}</DialogDescription>
          </DialogHeader>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>
                      {room.doctor?.name && `${room.doctor.name}`}
                      {room.specialtyFocus && ` • ${room.specialtyFocus}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(room.status)}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Today: {room.totalConsultationsToday || 0} consultations • Avg: {room.averageConsultationTime || 0} min
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {room.currentPatient && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Currently Consulting</span>
                    <Badge className={getPriorityColor(currentPatientDetails?.priority || "Medium")}>
                      {currentPatientDetails?.priority || "Medium"}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{currentPatientDetails?.name || room.currentPatient}</div>
                    <div className="text-gray-600">{currentPatientDetails?.chiefComplaint || "No complaint available"}</div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Duration: {formatTimeElapsed(sessionTimeElapsed)}</span>
                      {room.startTime && (
                        <span>Started: {new Date(room.startTime).toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" })}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Waiting Patients ({patients.filter((p) => (p.assignmentStatus === "Queued" || p.assignmentStatus === "In Progress") && p.consultationRoom === roomId).length})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartWithNextPatient}
                    disabled={patients.filter((p) => (p.assignmentStatus === "Queued" || p.assignmentStatus === "In Progress") && p.consultationRoom === roomId).length === 0}
                  >
                    Start with Next Patient
                  </Button>
                </div>
                {patients.filter((p) => (p.assignmentStatus === "Queued" || p.assignmentStatus === "In Progress") && p.consultationRoom === roomId).length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {patients
                      .filter((p) => (p.assignmentStatus === "Queued" || p.assignmentStatus === "In Progress") && p.consultationRoom === roomId)
                      .sort((a, b) => {
                        const priorityOrder = { Emergency: 1, High: 2, Medium: 3, Low: 4 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority] || getMinutesDifference(a.visitDate, a.visitTime) - getMinutesDifference(b.visitDate, b.visitTime);
                      })
                      .map((patient, index) => (
                        <div key={patient.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <Badge className={getPriorityColor(patient.priority)} variant="outline">
                                {patient.priority}
                              </Badge>
                              {patient.vitalsCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                              {patient.sentFromNurse && (
                                <Badge className="bg-green-100 text-green-800 text-xs" variant="outline">
                                  From Nurse
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {getMinutesDifference(patient.visitDate, patient.visitTime)}m
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartWithPatient(patient)}
                              >
                                Start Consultation
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-gray-600 text-xs">Patient ID: {patient.patientId} | Visit ID: {patient.visitId}</div>
                            <div className="text-gray-600 text-xs">{patient.chiefComplaint}</div>
                            <div className="text-gray-600 text-xs">
                              Arrived: {formatTime(patient.visitDate, patient.visitTime)} | Age: {patient.age}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No patients waiting</p>
                    {room.status === "available" && <p className="text-xs">Room ready for new assignments</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentPatient.name}</CardTitle>
                <CardDescription>
                  Patient ID: {currentPatient.patientId} | Visit ID: {currentPatient.visitId} | 
                  MRN: {currentPatient.mrn} | Age: {currentPatient.age} | 
                  Gender: {currentPatient.gender} | 
                  Arrived: {formatTime(currentPatient.visitDate, currentPatient.visitTime)} | 
                  Waiting: {getMinutesDifference(currentPatient.visitDate, currentPatient.visitTime)} min
                </CardDescription>
                {currentPatient.NextOfKin && (
                  <div className="text-sm text-gray-600 mt-1">
                    Next of Kin Contact: {currentPatient.NextOfKin}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <Badge variant="destructive" className="mb-1">Allergies</Badge>
                <div className="text-sm text-gray-600">{currentPatient.allergies.join(", ") || "None"}</div>
              </div>
              {currentPatient.vitalsAlerts && currentPatient.vitalsAlerts.length > 0 && (
                <div>
                  <Badge variant="destructive" className="mb-1">Vitals Alerts</Badge>
                  <div className="text-sm text-gray-600">{currentPatient.vitalsAlerts.join(", ")}</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="notes" className="flex items-center gap-1 text-xs">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline-block">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-1 text-xs">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline-block">Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="systemic" className="flex items-center gap-1 text-xs">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline-block">Systemic</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center gap-1 text-xs">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline-block">Lab</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-1 text-xs">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline-block">Prescription</span>
          </TabsTrigger>
          <TabsTrigger value="nursing" className="flex items-center gap-1 text-xs">
            <Syringe className="h-4 w-4" />
            <span className="hidden sm:inline-block">Nursing</span>
          </TabsTrigger>
          <TabsTrigger value="radiology" className="flex items-center gap-1 text-xs">
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline-block">Radiology</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-1 text-xs">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline-block">Referrals</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
            <HistoryIcon className="h-4 w-4" />
            <span className="hidden sm:inline-block">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <MedicalNotes visitId={currentPatient.visitId} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="vitals">
          <VitalsSection
            visitId={currentPatient.visitId}
            vitals={currentPatient.vitals}
            patientId={currentPatient.patientId}
          />
        </TabsContent>
        <TabsContent value="systemic">
          <SystemicExamination visitId={currentPatient.visitId} />
        </TabsContent>
        <TabsContent value="lab">
          <LabOrders visitId={currentPatient.visitId} />
        </TabsContent>
        <TabsContent value="prescriptions">
          <Prescriptions visitId={currentPatient.visitId} />
        </TabsContent>
        <TabsContent value="nursing">
          <NursingOrders visitId={currentPatient.visitId} />
        </TabsContent>
        <TabsContent value="radiology">
          <RadiologyOrders visitId={currentPatient.visitId} />
        </TabsContent>
        <TabsContent value="referrals">
          <Referrals visitId={currentPatient.visitId} />
        </TabsContent>
        <TabsContent value="history">
          <PatientHistory visitId={currentPatient.visitId} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Consultation</AlertDialogTitle>
            <AlertDialogDescription>
              {hasUnsavedChanges
                ? "You have unsaved changes. Ending the consultation will save all data and generate a summary report."
                : "Are you sure you want to end this consultation? This will generate a summary report and close the session."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 my-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reschedule"
                checked={rescheduleAppointment}
                onChange={(e) => setRescheduleAppointment(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="reschedule">Reschedule patient appointment</Label>
            </div>

            {rescheduleAppointment && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Appointment Time</Label>
                  <Input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEnding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndConsultation} disabled={isEnding}>
              {isEnding ? "Ending..." : "End Consultation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ); 
};

export default ConsultationSession;