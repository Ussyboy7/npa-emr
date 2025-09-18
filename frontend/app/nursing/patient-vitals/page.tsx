"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, TrendingUp, TrendingDown, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VitalsForm from "@/components/nurse/vitalsform";
import { ViewVitalsModal } from "@/components/nurse/viewvitals";
import { VitalsData, VitalRecord } from "@/types/vitals";

// Standardized interfaces
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
  status: string;
  location: string;
  assignedNurse?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
  employeeCategory?: string;
  vitals?: VitalsData;
  vitalsAlerts?: string[];
}

interface PatientVitalsHistory {
  id: string;
  patientName: string;
  personalNumber: string;
  vitalsHistory: VitalRecord[];
}

// Helper functions
const formatTimeWithAMPM = (dateString: string | undefined): string => {
  if (!dateString) return "Not Recorded";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Not Recorded"
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Lagos",
      });
};

const getVitalStatus = (type: string, value: string | undefined): "normal" | "high" | "low" | "critical" => {
  if (!value || value === "") return "normal";

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "normal";

  switch (type) {
    case "bloodPressureSystolic":
      if (numValue >= 180) return "critical";
      if (numValue >= 140) return "high";
      if (numValue < 90) return "low";
      return "normal";
    case "bloodPressureDiastolic":
      if (numValue >= 120) return "critical";
      if (numValue >= 90) return "high";
      if (numValue < 60) return "low";
      return "normal";
    case "temperature":
      if (numValue >= 39) return "critical";
      if (numValue >= 38) return "high";
      if (numValue < 36) return "low";
      return "normal";
    case "pulse":
      if (numValue >= 120) return "critical";
      if (numValue >= 100) return "high";
      if (numValue < 60) return "low";
      return "normal";
    case "respiratoryRate":
      if (numValue >= 30) return "critical";
      if (numValue >= 20) return "high";
      if (numValue < 12) return "low";
      return "normal";
    case "oxygenSaturation":
      if (numValue < 90) return "critical";
      if (numValue < 95) return "low";
      return "normal";
    case "fbs":
      if (numValue >= 400) return "critical";
      if (numValue >= 126) return "high";
      if (numValue < 70) return "low";
      return "normal";
    case "rbs":
      if (numValue >= 400) return "critical";
      if (numValue >= 200) return "high";
      if (numValue < 70) return "low";
      return "normal";
    case "painScale":
      if (numValue >= 8) return "critical";
      if (numValue >= 5) return "high";
      return "normal";
    default:
      return "normal";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "normal":
      return "bg-green-100 text-green-700 border-green-200";
    case "low":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "alert":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "high":
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    case "low":
      return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    case "alert":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-green-500" />;
  }
};

const computeVitalsAlerts = (vitals: VitalsData): string[] => {
  const alerts: string[] = [];
  if (!vitals) return alerts;

  const vitalFields = [
    { id: "temperature", label: "Temperature", unit: "°C" },
    { id: "pulse", label: "Pulse", unit: "bpm" },
    { id: "bloodPressureSystolic", label: "Systolic BP", unit: "mmHg" },
    { id: "bloodPressureDiastolic", label: "Diastolic BP", unit: "mmHg" },
    { id: "respiratoryRate", label: "Respiratory Rate", unit: "/min" },
    { id: "oxygenSaturation", label: "Oxygen Saturation", unit: "%" },
    { id: "fbs", label: "FBS", unit: "mg/dL" },
    { id: "rbs", label: "RBS", unit: "mg/dL" },
    { id: "painScale", label: "Pain Scale", unit: "/10" },
  ];

  vitalFields.forEach(({ id, label, unit }) => {
    const value = vitals[id as keyof VitalsData];
    const status = getVitalStatus(id, value);
    if (status !== "normal") {
      alerts.push(`${status.charAt(0).toUpperCase() + status.slice(1)} ${label}: ${value || "Not recorded"}${unit}`);
    }
  });

  return alerts;
};

const calculateBMI = (height: string | undefined, weight: string | undefined): string => {
  if (!height || !weight) return "";
  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);

  if (isNaN(heightNum) || isNaN(weightNum) || heightNum === 0) {
    return "";
  }

  const heightInMeters = heightNum / 100;
  const bmi = weightNum / (heightInMeters * heightInMeters);
  return bmi.toFixed(2);
};

const labelFromKey = (key: string): string => {
  const labels: Record<string, string> = {
    height: "Height",
    weight: "Weight",
    temperature: "Temperature",
    pulse: "Pulse",
    respiratoryRate: "Respiratory Rate",
    bloodPressureSystolic: "Systolic BP",
    bloodPressureDiastolic: "Diastolic BP",
    oxygenSaturation: "Oxygen Saturation",
    fbs: "Fasting Blood Sugar",
    rbs: "Random Blood Sugar",
    painScale: "Pain Scale",
    bodymassindex: "BMI",
    comment: "Comment",
  };
  return labels[key] || key;
};

const unitForKey = (key: string): string => {
  const units: Record<string, string> = {
    height: "cm",
    weight: "kg",
    temperature: "°C",
    pulse: "bpm",
    respiratoryRate: "/min",
    bloodPressureSystolic: "mmHg",
    bloodPressureDiastolic: "mmHg",
    oxygenSaturation: "%",
    fbs: "mg/dL",
    rbs: "mg/dL",
    painScale: "/10",
    bodymassindex: "kg/m²",
  };
  return units[key] || "";
};

export default function PatientVitals() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addVitalsOpen, setAddVitalsOpen] = useState(false);
  const [viewVitalsOpen, setViewVitalsOpen] = useState(false);
  const [selectedPatientVitals, setSelectedPatientVitals] = useState<PatientVitalsHistory | null>(null);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<Patient | null>(null);
  const [selectedVitalRecord, setSelectedVitalRecord] = useState<VitalRecord | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedTimes, setExpandedTimes] = useState<Record<string, boolean>>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Toggle expanded state for a vital record
  const toggleTime = (id: string) => {
    setExpandedTimes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch patients with vitals from API
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const visitsResponse = await fetch(`${API_URL}/api/visits/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!visitsResponse.ok) {
        throw new Error(`Failed to fetch visits: ${visitsResponse.statusText}`);
      }

      const visitsData = await visitsResponse.json();
      const visits = visitsData.results || visitsData;

      const patientIds = [...new Set(visits.map((v: any) => v.patient))];
      const patientsWithVitals: Patient[] = [];

      for (const patientId of patientIds) {
        try {
          const patientResponse = await fetch(`${API_URL}/api/patients/${patientId}/`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (!patientResponse.ok) {
            console.warn(`Patient ${patientId} not found`);
            continue;
          }

          const patientData = await patientResponse.json();
          const vitalsResponse = await fetch(`${API_URL}/api/vitals/?patient=${patientId}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          let vitalsData: VitalsData | undefined;
          let vitalsAlerts: string[] = [];

          if (vitalsResponse.ok) {
            const vitalsResult = await vitalsResponse.json();
            const vitalsList = vitalsResult.results || vitalsResult;

            if (vitalsList.length > 0) {
              const latestVitals = vitalsList.sort((a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0];

              vitalsData = {
                id: latestVitals.id,
                height: latestVitals.height?.toString() || "",
                weight: latestVitals.weight?.toString() || "",
                temperature: latestVitals.temperature?.toString() || "",
                pulse: latestVitals.heart_rate?.toString() || "",
                respiratoryRate: latestVitals.respiratory_rate?.toString() || "",
                bloodPressureSystolic: latestVitals.systolic?.toString() || "",
                bloodPressureDiastolic: latestVitals.diastolic?.toString() || "",
                oxygenSaturation: latestVitals.oxygen_saturation?.toString() || "",
                fbs: latestVitals.blood_sugar?.toString() || "",
                rbs: latestVitals.rbs?.toString() || "",
                painScale: latestVitals.pain_scale?.toString() || "",
                bodymassindex: latestVitals.height && latestVitals.weight
                  ? calculateBMI(latestVitals.height.toString(), latestVitals.weight.toString())
                  : "",
                comment: latestVitals.comment || "",
                recordedAt: latestVitals.date,
                recordedBy: latestVitals.recorded_by || "Unknown",
              };

              vitalsAlerts = computeVitalsAlerts(vitalsData);
            }
          } else {
            console.warn(`No vitals found for patient ${patientId}`);
          }

          const patientVisits = visits.filter((v: any) => v.patient === patientId);
          const latestVisit = patientVisits.sort((a: any, b: any) =>
            new Date(b.visit_date + "T" + b.visit_time + "Z").getTime() -
            new Date(a.visit_date + "T" + a.visit_time + "Z").getTime()
          )[0];

          if (latestVisit) {
            patientsWithVitals.push({
              id: String(patientId),
              patientId: String(patientId),
              name: `${patientData.surname} ${patientData.first_name}`,
              personalNumber: patientData.personal_number || "",
              visitId: latestVisit.id,
              clinic: latestVisit.clinic,
              visitDate: latestVisit.visit_date,
              visitTime: latestVisit.visit_time,
              visitType: latestVisit.visit_type,
              priority: latestVisit.priority,
              status: latestVisit.status,
              location: latestVisit.visit_location || "Unknown",
              assignedNurse: latestVisit.assigned_nurse,
              gender: patientData.gender,
              age: patientData.age,
              phoneNumber: patientData.phone,
              email: patientData.email,
              employeeCategory: patientData.patient_type,
              vitals: vitalsData,
              vitalsAlerts,
            });
          }
        } catch (err) {
          console.error(`Error processing patient ${patientId}:`, err);
        }
      }

      setPatients(patientsWithVitals);
    } catch (err) {
      setError(`Failed to fetch patient data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Fetch patient vitals history
  const fetchPatientVitalsHistory = useCallback(async (patientId: string): Promise<VitalRecord[]> => {
    try {
      const response = await fetch(`${API_URL}/api/vitals/?patient=${patientId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vitals: ${response.statusText}`);
      }

      const patientResponse = await fetch(`${API_URL}/api/patients/${patientId}/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!patientResponse.ok) {
        throw new Error(`Failed to fetch patient details: ${patientResponse.statusText}`);
      }

      const patientData = await patientResponse.json();
      const patientName = `${patientData.surname} ${patientData.first_name}`;
      const personalNumber = patientData.personal_number || "";

      const data = await response.json();
      const vitalsList = data.results || data;

      if (!vitalsList.length) {
        return [];
      }

      return vitalsList
        .map((v: any) => {
          const vitals: VitalsData = {
            id: v.id,
            height: v.height?.toString() || "",
            weight: v.weight?.toString() || "",
            temperature: v.temperature?.toString() || "",
            pulse: v.heart_rate?.toString() || "",
            respiratoryRate: v.respiratory_rate?.toString() || "",
            bloodPressureSystolic: v.systolic?.toString() || "",
            bloodPressureDiastolic: v.diastolic?.toString() || "",
            oxygenSaturation: v.oxygen_saturation?.toString() || "",
            fbs: v.blood_sugar?.toString() || "",
            rbs: v.rbs?.toString() || "",
            painScale: v.pain_scale?.toString() || "",
            bodymassindex: v.height && v.weight
              ? calculateBMI(v.height.toString(), v.weight.toString())
              : "",
            comment: v.comment || "",
            recordedAt: v.date,
            recordedBy: v.recorded_by || "Unknown",
          };

          return {
            id: v.id,
            patientName,
            personalNumber,
            date: v.date.split("T")[0],
            time: formatTimeWithAMPM(v.date),
            vitals,
            recordedBy: v.recorded_by || "Unknown",
            alerts: computeVitalsAlerts(vitals),
          };
        })
        .sort((a: VitalRecord, b: VitalRecord) =>
          new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
        );
    } catch (err) {
      console.error(`Error fetching vitals history for patient ${patientId}:`, err);
      setError(`Failed to fetch vitals history: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }, [API_URL]);

  // Auto-refresh every 30s
  useEffect(() => {
    fetchPatients();

    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPatients]);

  useEffect(() => {
    if (historyOpen) {
      setHistoryPage(1);
    }
  }, [historyOpen]);

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;

    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.personalNumber?.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  // Compute latest vitals for display
  const latestVitals = useMemo(() => {
    return filteredPatients
      .filter((patient) => patient.vitals)
      .map((patient) => {
        const vitals = patient.vitals!;
        const status = [
          "temperature",
          "pulse",
          "bloodPressureSystolic",
          "bloodPressureDiastolic",
          "respiratoryRate",
          "oxygenSaturation",
          "fbs",
          "rbs",
          "painScale",
        ].some((field) => getVitalStatus(field, vitals[field as keyof VitalsData]) !== "normal")
          ? "alert"
          : "normal";
        return {
          id: patient.id,
          patient: patient.name,
          lastRecorded: vitals.recordedAt
            ? `${vitals.recordedAt.split("T")[0]} ${formatTimeWithAMPM(vitals.recordedAt)}`
            : `${patient.visitDate} ${formatTimeWithAMPM(`${patient.visitDate}T${patient.visitTime}`)}`,
          bp: `${vitals.bloodPressureSystolic || "-"}/${vitals.bloodPressureDiastolic || "-"}`,
          pulse: vitals.pulse || "-",
          temp: vitals.temperature || "-",
          respiratoryRate: vitals.respiratoryRate || "-",
          oxygenSaturation: vitals.oxygenSaturation || "-",
          fbs: vitals.fbs || "-",
          rbs: vitals.rbs || "-",
          painScale: vitals.painScale || "-",
          bmi: vitals.bodymassindex || "-",
          status,
        };
      });
  }, [filteredPatients]);

  // Handle adding new vitals
  const handleAddVitals = async (data: VitalsData) => {
    if (!selectedPatientForVitals) return;

    setIsLoading(true);
    try {
      const bmi = calculateBMI(data.height, data.weight);
      const alerts = computeVitalsAlerts({ ...data, bodymassindex: bmi });

      const payload = {
        patient: selectedPatientForVitals.patientId,
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

      const response = await fetch(`${API_URL}/api/vitals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || "Failed to save vitals data";
        throw new Error(errorMessage);
      }

      const newVitals = await response.json();
      const vitalsWithMetadata: VitalsData = {
        ...data,
        id: newVitals.id,
        bodymassindex: bmi,
        recordedAt: newVitals.date,
        recordedBy: "Current Nurse",
      };

      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatientForVitals.id
            ? {
                ...p,
                vitals: vitalsWithMetadata,
                vitalsAlerts: alerts,
              }
            : p
        )
      );

      setAddVitalsOpen(false);
      setSelectedPatientForVitals(null);
      setError(null);
    } catch (err) {
      setError(`Failed to save vitals: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // View patient vitals history
  const viewPatientHistory = useCallback(async (patient: Patient) => {
    setIsLoading(true);
    try {
      const vitalsHistory = await fetchPatientVitalsHistory(patient.id);
      setSelectedPatientVitals({
        id: patient.id,
        patientName: patient.name,
        personalNumber: patient.personalNumber || "",
        vitalsHistory,
      });
      setHistoryOpen(true);
    } catch (err) {
      setError(`Failed to fetch vitals history for ${patient.name}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPatientVitalsHistory]);

  // Open modal to add vitals
  const openAddVitalsModalForPatient = (patient: Patient) => {
    setSelectedPatientForVitals(patient);
    setAddVitalsOpen(true);
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPatients();
    } catch (err) {
      setError(`Failed to refresh data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPatients]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Patient Vitals</CardTitle>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
          <CardDescription>Monitor and manage patient vitals</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
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

          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name, ID, or personal number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-12">
                <div className="text-lg text-muted-foreground">Loading...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {latestVitals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No patients with vitals found
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "No patients with vitals records found. Record vitals in the Nursing Pool Queue first."}
                    </p>
                    <Button className="mt-4" onClick={handleRefresh} disabled={isRefreshing}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                      Refresh Data
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                latestVitals.map((vital) => (
                  <Card key={vital.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {vital.patient}
                            {getStatusIcon(vital.status)}
                          </CardTitle>
                          <CardDescription>
                            Patient ID: {vital.id} | Last recorded: {vital.lastRecorded}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(vital.status)}>{vital.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const patient = patients.find((p) => p.id === vital.id);
                              if (patient) {
                                viewPatientHistory(patient);
                              }
                            }}
                          >
                            View History
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const patient = patients.find((p) => p.id === vital.id);
                              if (patient) {
                                openAddVitalsModalForPatient(patient);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Vitals
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Blood Pressure</p>
                          <p className="text-2xl font-bold">{vital.bp}</p>
                          <p className="text-xs text-muted-foreground">mmHg</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pulse</p>
                          <p className="text-2xl font-bold">{vital.pulse}</p>
                          <p className="text-xs text-muted-foreground">bpm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Temperature</p>
                          <p className="text-2xl font-bold">{vital.temp}</p>
                          <p className="text-xs text-muted-foreground">°C</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                          <p className="text-2xl font-bold">{vital.respiratoryRate}</p>
                          <p className="text-xs text-muted-foreground">/min</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Oxygen Saturation</p>
                          <p className="text-2xl font-bold">{vital.oxygenSaturation}</p>
                          <p className="text-xs text-muted-foreground">%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">FBS</p>
                          <p className="text-2xl font-bold">{vital.fbs}</p>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">RBS</p>
                          <p className="text-2xl font-bold">{vital.rbs}</p>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pain Scale</p>
                          <p className="text-2xl font-bold">{vital.painScale}</p>
                          <p className="text-xs text-muted-foreground">/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">BMI</p>
                          <p className="text-2xl font-bold">{vital.bmi}</p>
                          <p className="text-xs text-muted-foreground">kg/m²</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vitals Dialog */}
      <Dialog open={addVitalsOpen} onOpenChange={setAddVitalsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPatientForVitals
                ? `Add Vitals for ${selectedPatientForVitals.name}`
                : "Add Vitals"}
            </DialogTitle>
          </DialogHeader>
          <VitalsForm onSubmit={handleAddVitals} initialData={selectedPatientForVitals?.vitals} />
        </DialogContent>
      </Dialog>

      {/* Vitals History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Vitals History for {selectedPatientVitals?.patientName || "Patient"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            {selectedPatientVitals ? (
              selectedPatientVitals.vitalsHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No vitals history found for this patient.</p>
                </div>
              ) : (
                (() => {
                  const allVitals = selectedPatientVitals.vitalsHistory || [];
                  const grouped: Record<string, VitalRecord[]> = {};
                  allVitals.forEach((v) => {
                    if (!grouped[v.date]) grouped[v.date] = [];
                    grouped[v.date].push(v);
                  });
                  const uniqueDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                  const currentDate = uniqueDates[historyPage - 1];
                  let records: VitalRecord[] = [];
                  if (currentDate) {
                    records = grouped[currentDate].slice().sort((a, b) => b.time.localeCompare(a.time));
                  }
                  const currentVisitGroup = currentDate ? [{ date: currentDate, records }] : [];

                  return (
                    <>
                      {currentVisitGroup.map(({ date, records }) => (
                        <div key={date} className="space-y-3 border rounded-lg p-4 mb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {selectedPatientVitals.patientName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Personal Number: {selectedPatientVitals.personalNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {records[0]?.alerts.length ? (
                                <>
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  <Badge className="bg-red-100 text-red-800">Alerts</Badge>
                                </>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Normal</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {records.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No records for this date.</p>
                            ) : (
                              records.map((rec: VitalRecord) => (
                                <div key={rec.id} className="border rounded-md">
                                  <div className="flex items-center justify-between p-3">
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {rec.time} — Recorded by {rec.recordedBy}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {rec.alerts.length > 0 && (
                                          <div className="text-red-600">
                                            {rec.alerts.join(" • ")}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleTime(rec.id)}
                                      >
                                        {expandedTimes[rec.id] ? "▼ Hide" : "▶ Show"}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedVitalRecord(rec);
                                          setViewVitalsOpen(true);
                                        }}
                                      >
                                        View Details
                                      </Button>
                                    </div>
                                  </div>
                                  {expandedTimes[rec.id] && (
                                    <div className="p-3 pt-0 space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {Object.entries(rec.vitals)
                                          .filter(([key]) => key !== "comment" && key !== "id" && key !== "recordedAt" && key !== "recordedBy")
                                          .map(([key, value]) => (
                                            <div key={key} className="p-3 border rounded-lg">
                                              <label className="text-sm font-medium text-gray-600">
                                                {labelFromKey(key)}
                                              </label>
                                              <p className="text-lg font-semibold text-gray-900">
                                                {value || "Not recorded"} {unitForKey(key)}
                                              </p>
                                            </div>
                                          ))}
                                      </div>
                                      {rec.vitals.comment && (
                                        <div className="p-3 border rounded-lg bg-blue-50">
                                          <label className="text-sm font-medium text-gray-600">
                                            Comments/Notes
                                          </label>
                                          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                            {rec.vitals.comment}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()
              )
            ) : (
              <div className="text-sm text-muted-foreground">No patient selected.</div>
            )}
          </div>

          {/* Pagination */}
          {selectedPatientVitals && selectedPatientVitals.vitalsHistory && (() => {
            const allVitals = selectedPatientVitals.vitalsHistory || [];
            const grouped: Record<string, VitalRecord[]> = {};
            allVitals.forEach((v) => {
              if (!grouped[v.date]) grouped[v.date] = [];
              grouped[v.date].push(v);
            });
            const uniqueDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

            return uniqueDates.length > 1 ? (
              <div className="mt-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      />
                    </PaginationItem>
                    {Array.from({ length: uniqueDates.length }).map((_, i) => (
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
                        onClick={() => setHistoryPage((p) => Math.min(uniqueDates.length, p + 1))}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>

      {/* View Vitals Details Modal */}
      <ViewVitalsModal
        record={selectedVitalRecord}
        open={viewVitalsOpen}
        onClose={() => {
          setViewVitalsOpen(false);
          setSelectedVitalRecord(null);
        }}
      />
    </div>
  );
}