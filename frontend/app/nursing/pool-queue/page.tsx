"use client";

import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import type { VitalsData } from "@/components/nurse/vitalsform";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Activity, Stethoscope, UserCheck, ArrowRight, Clock, Syringe, Bandage, AlertTriangle, RefreshCw } from "lucide-react";

import { Dialog, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import VitalsForm from "@/components/nurse/vitalsform";
import ConsultationRoomPicker from "@/components/nurse/consultationroompicker";

// Helper function: compute vitals alerts based on thresholds
const computeVitalsAlerts = (vitals: VitalsData): string[] => {
  const alerts: string[] = [];

  if (!vitals) return alerts;

  const { temperature, pulse, respiratoryRate, bloodPressure, oxygenSaturation, fbs, rbs } = vitals;

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
  if (bloodPressure) {
    const [systolicStr, diastolicStr] = bloodPressure.split("/"); 
    const systolic = Number(systolicStr);
    const diastolic = Number(diastolicStr);
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

interface Patient {
  id: string;
  name: string;
  personalNumber?: string;
  visitId: string;
  status:
    | "Awaiting Vitals"
    | "Vitals Complete"
    | "Completed"
    | "Sent to Injection"
    | "Sent to Dressing";
  priority: "High" | "Medium" | "Low";
  location: string;
  clinic: string;
  visitType: string;
  visitDate: string;
  visitTime: string;
  assignedNurse?: string;
  consultationRoom?: string;
  vitals?: VitalsData;
  vitalsAlerts?: string[]; 
  statusNote?: string;
  completedAt?: string;
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

const PoolQueue = () => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "P001",
      name: "John Doe",
      personalNumber: "EMP001",
      visitId: "V001",
      status: "Awaiting Vitals",
      priority: "High",
      location: "Nurse Queue",
      clinic: "GOP",
      visitType: "Consultation",
      visitDate: "2025-08-01",
      visitTime: dayjs().subtract(45, "minute").toISOString(),
      assignedNurse: "Nurse Sarah",
    },
    {
      id: "P002",
      name: "Jane Smith",
      personalNumber: "EMP002",
      visitId: "V002",
      status: "Vitals Complete",
      priority: "Medium",
      location: "Waiting for Doctor",
      clinic: "Physiotherapy",
      visitType: "Follow Up",
      visitDate: "2025-08-01",
      visitTime: dayjs().subtract(30, "minute").toISOString(),
      assignedNurse: "Nurse Mary",
      vitals: {
        bloodPressure: "120/80",
        temperature: "36.8",
        pulse: "75",
        respiratoryRate: "16",
        oxygenSaturation: "99",
        height: "165",
        weight: "60",
        fbs: "90",
        rbs:  "110",
        comment: "",
      },
      vitalsAlerts: [],
    },
    {
      id: "P003",
      name: "Mary Smith",
      personalNumber: "EMP003",
      visitId: "V003",
      status: "Vitals Complete",
      priority: "Medium",
      location: "Waiting for Doctor",
      clinic: "Physiotherapy",
      visitType: "Follow Up",
      visitDate: "2025-08-01",
      visitTime: dayjs().subtract(10, "minute").toISOString(),
      assignedNurse: "Nurse Mary",
      vitals: {
        bloodPressure: "145/95",
        temperature: "38.8",
        pulse: "85",
        respiratoryRate: "18",
        oxygenSaturation: "96",
        height: "170",
        weight: "65",
        fbs: "90",
        rbs:  "110",
        comment: "Patient reports feeling unwell",
      },
      vitalsAlerts: ["High Temperature", "High Blood Pressure"],
    },
  ]);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [vitalsPatientId, setVitalsPatientId] = useState<string | null>(null);
  const [editingVitalsPatientId, setEditingVitalsPatientId] = useState<string | null>(null);
  const [viewVitalsPatient, setViewVitalsPatient] = useState<ViewVitalsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pageSize = 6;

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
  }, []); // Only run once on mount

  // Mock API refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // In real implementation, this would be an API call
      // await fetchPatientsFromAPI();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just update timestamps to show refresh worked
      setPatients(prev => [...prev]);
    } catch (err) {
      setError("Failed to refresh patient data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced search - includes more fields
  const filteredPatients = useMemo(() => {
    let filtered = patients;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
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
  }, [patients, statusFilter, searchTerm]);

  // Sort by priority + arrival time
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };
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
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPatients.slice(start, start + pageSize);
  }, [sortedPatients, currentPage, pageSize]);

  const getPatientTimeInfo = (patient: Patient) => {
    const arrivalTime = dayjs(patient.visitTime);
    const arrival = arrivalTime.format("HH:mm");
    const wait = dayjs().diff(arrivalTime, "minute");
    return { arrival, wait };
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Awaiting Vitals":
        return "bg-red-100 text-red-800";
      case "Vitals Complete":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Sent to Injection":
      case "Sent to Dressing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Actions with error handling
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
      // Compute alerts for the new vitals data
      const alerts = computeVitalsAlerts(data);

      // Update patient with vitals and computed alerts
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
                completedAt: dayjs().toISOString(),
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

  const handleSendToService = async (patientId: string, service: "Injection" | "Dressing") => {
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

  // Fixed: Use actual patient data with proper vitals structure
  const getPatientVitalsData = (id: string): ViewVitalsData | null => {
    const patient = patients.find((p) => p.id === id);
    if (!patient || !patient.vitals) return null;

    return {
      id,
      patientName: patient.name,
      personalNumber: patient.personalNumber || "N/A",
      date: patient.visitDate,
      time: dayjs(patient.visitTime).format("HH:mm A"),
      vitals: patient.vitals,
      recordedBy: patient.assignedNurse || "N/A",
      alerts: patient.vitalsAlerts || [],
    };
  };

  // Derived stats
  const vitalsRecordedCount = patients.filter((p) => !!p.vitals).length;
  const awaitingCount = patients.filter((p) => p.status === "Awaiting Vitals").length;
  const waitingForDoctorCount = patients.filter((p) => p.status === "Vitals Complete").length;
  const averageWait = patients.length
    ? Math.round(patients.reduce((sum, p) => sum + dayjs().diff(dayjs(p.visitTime), "minute"), 0) / patients.length)
    : 0;

  return (
    <main className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Pool Queue</h1>
          <p className="text-muted-foreground">
            Nurse view — record vitals, send to consultation, and follow doctor orders.
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

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Vitals</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awaitingCount}</div>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vitals Recorded</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitalsRecordedCount}</div>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Wait (min)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWait}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & filter */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, ID, personal number, clinic..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Awaiting Vitals">Awaiting Vitals</SelectItem>
            <SelectItem value="Vitals Complete">Vitals Complete</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Sent to Injection">Sent to Injection</SelectItem>
            <SelectItem value="Sent to Dressing">Sent to Dressing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient list */}
      <div className="space-y-4">
        {paginatedPatients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No patients found</h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchTerm || statusFilter !== "all" 
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
                  hasAlerts || patient.priority === "High" 
                    ? "border-2 border-red-500 bg-red-50/30" 
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
                                    {dayjs(patient.completedAt).format("DD MMM YYYY, HH:mm")}
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
                          <Bandage className="h-4 w-4 mr-1" />
                          Dressing
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

      {/* Vitals Dialog */}
      <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
        <DialogContent>
          <DialogTitle>{editingVitalsPatientId ? "Edit Vitals" : "Record Vitals"}</DialogTitle>
          <VitalsForm
            onSubmit={handleVitalsSubmit}
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
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSelectRoom={handleSendToConsultation}
            rooms={[
              { id: "R1", name: "Room 1", status: "available" },
              { id: "R2", name: "Room 2", status: "occupied" },
              { id: "R3", name: "Room 3", status: "available" },
              { id: "R4", name: "Room 4", status: "available" },
            ]}
          />
        </DialogContent>
      </Dialog>

      {/* View Vitals Modal */}
      <Dialog open={!!viewVitalsPatient} onOpenChange={() => setViewVitalsPatient(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>View Vitals</DialogTitle>
          {viewVitalsPatient && (
            <div className="space-y-6">
              {/* Patient Info Header */}
              <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewVitalsPatient.patientName}</h3>
                  <p className="text-sm text-gray-600">
                    Personal Number: {viewVitalsPatient.personalNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(viewVitalsPatient.date).toLocaleDateString()} at {viewVitalsPatient.time}
                  </p>
                  <p className="text-xs text-gray-500">Recorded by: {viewVitalsPatient.recordedBy}</p>
                </div>

                {viewVitalsPatient.alerts.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-700 mb-1">Health Alerts:</div>
                      {viewVitalsPatient.alerts.map((alert: string, index: number) => (
                        <span key={index} className="block text-xs text-red-600 bg-red-100 px-2 py-1 rounded mb-1">
                          {alert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vitals Data - Same layout as form */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">Vital Signs</h4>
                
                {/* Physical Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <label className="text-sm font-medium text-gray-600">Height</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewVitalsPatient.vitals.height || "Not recorded"} 
                        {viewVitalsPatient.vitals.height && <span className="text-sm text-gray-500 ml-1">cm</span>}
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <label className="text-sm font-medium text-gray-600">Weight</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewVitalsPatient.vitals.weight || "Not recorded"}
                        {viewVitalsPatient.vitals.weight && <span className="text-sm text-gray-500 ml-1">kg</span>}
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <label className="text-sm font-medium text-gray-600">Temperature</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewVitalsPatient.vitals.temperature || "Not recorded"}
                        {viewVitalsPatient.vitals.temperature && <span className="text-sm text-gray-500 ml-1">°C</span>}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <label className="text-sm font-medium text-gray-600">Pulse</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewVitalsPatient.vitals.pulse || "Not recorded"}
                        {viewVitalsPatient.vitals.pulse && <span className="text-sm text-gray-500 ml-1">bpm</span>}
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <label className="text-sm font-medium text-gray-600">Respiratory Rate</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewVitalsPatient.vitals.respiratoryRate || "Not recorded"}
                        {viewVitalsPatient.vitals.respiratoryRate && <span className="text-sm text-gray-500 ml-1">/min</span>}
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <label className="text-sm font-medium text-gray-600">Blood Pressure</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewVitalsPatient.vitals.bloodPressure || "Not recorded"}
                        {viewVitalsPatient.vitals.bloodPressure && <span className="text-sm text-gray-500 ml-1">mmHg</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Oxygen Saturation - Full width */}
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Oxygen Saturation (SpO2)</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {viewVitalsPatient.vitals.oxygenSaturation || "Not recorded"}
                    {viewVitalsPatient.vitals.oxygenSaturation && <span className="text-sm text-gray-500 ml-1">%</span>}
                  </p>
                </div>

                {/* Comments section */}
                {viewVitalsPatient.vitals.comment && (
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <label className="text-sm font-medium text-gray-600">Comments/Notes</label>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                      {viewVitalsPatient.vitals.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewVitalsPatient(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default PoolQueue;