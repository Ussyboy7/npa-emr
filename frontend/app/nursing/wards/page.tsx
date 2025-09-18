"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bed,
  User,
  Plus,
  Eye,
  Edit,
  ClipboardList,
  Droplets,
  Activity,
  Syringe,
  Heart,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  Thermometer,
  TrendingUp,
  Save,
  Users,
  UserPlus,
  Stethoscope,
  RefreshCw,
} from "lucide-react";

// Interfaces
interface WardPatient {
  id: string;
  patientId: string;
  name: string;
  personalNumber: string;
  age: number;
  gender: "Male" | "Female";
  bedNumber: number;
  diagnosis: string;
  admissionDate: string;
  admissionTime: string;
  status: "Stable" | "Critical" | "Recovering" | "Discharge Ready";
  assignedNurse: string;
  orders: DoctorOrder[];
  treatmentSheet: TreatmentRecord[];
  urineMonitoring: UrineRecord[];
  observationChart: ObservationRecord[];
  fluidRecord: FluidRecord[];
  glucoseRecord: GlucoseRecord[];
  slidingScale: SlidingScaleRecord[];
  bloodGlucose: BloodGlucoseRecord[];
}

interface DoctorOrder {
  id: string;
  orderedBy: string;
  orderDate: string;
  orderTime: string;
  type: "Medication" | "Treatment" | "Investigation" | "Diet" | "Activity";
  description: string;
  frequency?: string;
  duration?: string;
  status: "Pending" | "In Progress" | "Completed" | "Discontinued";
  notes?: string;
}

interface TreatmentRecord {
  id: string;
  date: string;
  time: string;
  treatment: string;
  notes: string;
  recordedBy: string;
  status: "Completed" | "Partial" | "Not Done";
}

interface UrineRecord {
  id: string;
  date: string;
  time: string;
  volume: string;
  color: string;
  clarity: string;
  specificGravity?: string;
  notes?: string;
  recordedBy: string;
}

interface ObservationRecord {
  id: string;
  date: string;
  time: string;
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  bloodPressure: string;
  oxygenSaturation: string;
  consciousness: string;
  notes?: string;
  recordedBy: string;
}

interface FluidRecord {
  id: string;
  date: string;
  time: string;
  intake: {
    oral: string;
    iv: string;
    others: string;
  };
  output: {
    urine: string;
    vomit: string;
    drainage: string;
    others: string;
  };
  balance: string;
  recordedBy: string;
}

interface GlucoseRecord {
  id: string;
  date: string;
  time: string;
  bloodGlucose: string;
  method: "Finger stick" | "Lab" | "Continuous monitor";
  notes?: string;
  recordedBy: string;
}

interface SlidingScaleRecord {
  id: string;
  date: string;
  time: string;
  bloodGlucose: string;
  insulinGiven: string;
  insulinType: string;
  notes?: string;
  recordedBy: string;
}

interface BloodGlucoseRecord {
  id: string;
  date: string;
  time: string;
  value: string;
  method: "Fasting" | "Random" | "Post-meal" | "Bedtime";
  action: string;
  recordedBy: string;
}

const WardManagement = () => {
  // State management
  const [selectedWard, setSelectedWard] = useState<"Male" | "Female">("Male");
  const [selectedPatient, setSelectedPatient] = useState<WardPatient | null>(
    null
  );
  const [selectedBed, setSelectedBed] = useState<number | null>(null);
  const [showAdmitDialog, setShowAdmitDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [recordType, setRecordType] = useState<string>("");
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyType, setHistoryType] = useState<string>("");
  const [expandedRecords, setExpandedRecords] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for wards
  const [maleWardPatients, setMaleWardPatients] = useState<WardPatient[]>([
    {
      id: "WP001",
      patientId: "P001",
      name: "John Doe",
      personalNumber: "EMP001",
      age: 45,
      gender: "Male",
      bedNumber: 1,
      diagnosis: "Hypertension",
      admissionDate: "2025-08-28",
      admissionTime: "08:30",
      status: "Stable",
      assignedNurse: "Nurse Mary",
      orders: [
        {
          id: "O001",
          orderedBy: "Dr. Smith",
          orderDate: "2025-08-28",
          orderTime: "09:00",
          type: "Medication",
          description: "Amlodipine 5mg PO daily",
          frequency: "Once daily",
          duration: "7 days",
          status: "In Progress",
        },
      ],
      treatmentSheet: [],
      urineMonitoring: [],
      observationChart: [],
      fluidRecord: [],
      glucoseRecord: [],
      slidingScale: [],
      bloodGlucose: [],
    },
    {
      id: "WP002",
      patientId: "P003",
      name: "Michael Johnson",
      personalNumber: "EMP003",
      age: 42,
      gender: "Male",
      bedNumber: 3,
      diagnosis: "Chest Pain Investigation",
      admissionDate: "2025-08-28",
      admissionTime: "10:15",
      status: "Critical",
      assignedNurse: "Nurse John",
      orders: [
        {
          id: "O002",
          orderedBy: "Dr. Williams",
          orderDate: "2025-08-28",
          orderTime: "11:00",
          type: "Investigation",
          description: "ECG every 4 hours",
          frequency: "Every 4 hours",
          duration: "24 hours",
          status: "In Progress",
        },
      ],
      treatmentSheet: [],
      urineMonitoring: [],
      observationChart: [],
      fluidRecord: [],
      glucoseRecord: [],
      slidingScale: [],
      bloodGlucose: [],
    },
  ]);

  const [femaleWardPatients, setFemaleWardPatients] = useState<WardPatient[]>([
    {
      id: "WP003",
      patientId: "P002",
      name: "Jane Smith",
      personalNumber: "EMP002",
      age: 55,
      gender: "Female",
      bedNumber: 2,
      diagnosis: "Diabetes Mellitus Type 2",
      admissionDate: "2025-08-27",
      admissionTime: "14:20",
      status: "Stable",
      assignedNurse: "Nurse Sarah",
      orders: [
        {
          id: "O003",
          orderedBy: "Dr. Johnson",
          orderDate: "2025-08-28",
          orderTime: "08:00",
          type: "Medication",
          description: "Metformin 500mg PO BID",
          frequency: "Twice daily",
          duration: "Ongoing",
          status: "In Progress",
        },
      ],
      treatmentSheet: [],
      urineMonitoring: [],
      observationChart: [],
      fluidRecord: [],
      glucoseRecord: [],
      slidingScale: [],
      bloodGlucose: [],
    },
  ]);

  const currentWardPatients =
    selectedWard === "Male" ? maleWardPatients : femaleWardPatients;
  const setCurrentWardPatients =
    selectedWard === "Male" ? setMaleWardPatients : setFemaleWardPatients;

  // Get bed occupancy
  const getBedsData = () => {
    const beds = Array.from({ length: 5 }, (_, i) => ({
      number: i + 1,
      patient: currentWardPatients.find((p) => p.bedNumber === i + 1) || null,
    }));
    return beds;
  };

  const bedsData = getBedsData();
  const occupiedBeds = currentWardPatients.length;
  const availableBeds = 5 - occupiedBeds;

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Stable":
        return "bg-green-100 text-green-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Recovering":
        return "bg-blue-100 text-blue-800";
      case "Discharge Ready":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle bed assignment
  const handleAdmitPatient = (bedNumber: number) => {
    setSelectedBed(bedNumber);
    setShowAdmitDialog(true);
  };

  // Handle record creation
  const handleAddRecord = (patientId: string, type: string) => {
    const patient = currentWardPatients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
    setRecordType(type);
    setShowRecordDialog(true);
  };

  // Handle history viewing
  const handleViewHistory = (patientId: string, type: string) => {
    const patient = currentWardPatients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
    setHistoryType(type);
    setShowHistoryDialog(true);
  };

  // Submit handlers for different record types
  const handleRecordSubmit = (data: any) => {
    if (!selectedPatient) return;

    const newRecord = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      recordedBy: "Current Nurse", // Replace with actual nurse
    };

    setCurrentWardPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedPatient.id
          ? {
              ...patient,
              [getRecordArrayName(recordType)]: [
                ...(patient[
                  getRecordArrayName(recordType) as keyof WardPatient
                ] as any[]),
                newRecord,
              ],
            }
          : patient
      )
    );

    setShowRecordDialog(false);
    setSelectedPatient(null);
    setRecordType("");
  };

  const getRecordArrayName = (type: string) => {
    switch (type) {
      case "treatment":
        return "treatmentSheet";
      case "urine":
        return "urineMonitoring";
      case "observation":
        return "observationChart";
      case "fluid":
        return "fluidRecord";
      case "glucose":
        return "glucoseRecord";
      case "sliding":
        return "slidingScale";
      case "blood-glucose":
        return "bloodGlucose";
      default:
        return "treatmentSheet";
    }
  };

  const toggleRecord = (recordId: string) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ward Management</h1>
          <p className="text-muted-foreground">
            Manage admitted patients and their medical records
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Ward Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Male Ward Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maleWardPatients.length}/5
            </div>
            <p className="text-xs text-muted-foreground">beds occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Female Ward Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {femaleWardPatients.length}/5
            </div>
            <p className="text-xs text-muted-foreground">beds occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                [...maleWardPatients, ...femaleWardPatients].filter(
                  (p) => p.status === "Critical"
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Discharge Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                [...maleWardPatients, ...femaleWardPatients].filter(
                  (p) => p.status === "Discharge Ready"
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ward Tabs */}
      <Tabs
        value={selectedWard}
        onValueChange={(value) => setSelectedWard(value as "Male" | "Female")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Male" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Male Ward ({maleWardPatients.length}/5)
          </TabsTrigger>
          <TabsTrigger value="Female" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Female Ward ({femaleWardPatients.length}/5)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedWard} className="space-y-6">
          {/* Bed Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                {selectedWard} Ward - Bed Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {bedsData.map((bed) => (
                  <Card
                    key={bed.number}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      bed.patient
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    onClick={() =>
                      bed.patient
                        ? setSelectedPatient(bed.patient)
                        : handleAdmitPatient(bed.number)
                    }
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Bed
                          className={`h-8 w-8 ${
                            bed.patient ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                        <div className="text-sm font-medium">
                          Bed {bed.number}
                        </div>
                        {bed.patient ? (
                          <div className="space-y-1">
                            <div className="text-xs font-semibold">
                              {bed.patient.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {bed.patient.personalNumber}
                            </div>
                            <Badge
                              className={getStatusColor(bed.patient.status)}
                              variant="outline"
                            >
                              {bed.patient.status}
                            </Badge>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Admit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Additional bed option */}
                <Card className="cursor-pointer transition-all hover:shadow-md bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Plus className="h-8 w-8 text-yellow-600" />
                      <div className="text-sm font-medium">Additional Bed</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdmitPatient(6)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Bed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedPatient.name} - Bed {selectedPatient.bedNumber}
                  </div>
                  <Badge className={getStatusColor(selectedPatient.status)}>
                    {selectedPatient.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {selectedPatient.personalNumber} | Age: {selectedPatient.age}{" "}
                  | Diagnosis: {selectedPatient.diagnosis}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Doctor Orders */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Doctor Orders
                  </h3>
                  <div className="space-y-2">
                    {selectedPatient.orders.map((order) => (
                      <Card key={order.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {order.description}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.frequency} • {order.duration} • Ordered by{" "}
                              {order.orderedBy}
                            </div>
                          </div>
                          <Badge
                            variant={
                              order.status === "Completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAddRecord(selectedPatient.id, "treatment")
                    }
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Treatment Sheet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecord(selectedPatient.id, "urine")}
                    className="flex items-center gap-2"
                  >
                    <Droplets className="h-4 w-4" />
                    Urine Monitor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAddRecord(selectedPatient.id, "observation")
                    }
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Observation Chart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecord(selectedPatient.id, "fluid")}
                    className="flex items-center gap-2"
                  >
                    <Droplets className="h-4 w-4" />
                    Fluid I/O
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAddRecord(selectedPatient.id, "glucose")
                    }
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Glucose Record
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAddRecord(selectedPatient.id, "sliding")
                    }
                    className="flex items-center gap-2"
                  >
                    <Syringe className="h-4 w-4" />
                    Sliding Scale
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAddRecord(selectedPatient.id, "blood-glucose")
                    }
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Blood Glucose
                  </Button>
                </div>

                {/* View History Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleViewHistory(selectedPatient.id, "treatment")
                    }
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Treatment History
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleViewHistory(selectedPatient.id, "urine")
                    }
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Urine History
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleViewHistory(selectedPatient.id, "observation")
                    }
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Observation History
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleViewHistory(selectedPatient.id, "fluid")
                    }
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Fluid History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Record Addition Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add {getRecordTitle(recordType)}</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              {renderRecordForm(recordType, handleRecordSubmit)}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {getRecordTitle(historyType)} History - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            {selectedPatient &&
              renderHistoryContent(
                selectedPatient,
                historyType,
                expandedRecords,
                toggleRecord
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowHistoryDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowHistoryDialog(false);
                handleAddRecord(selectedPatient?.id || "", historyType);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admit Patient Dialog */}
      <Dialog open={showAdmitDialog} onOpenChange={setShowAdmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admit Patient to Bed {selectedBed}</DialogTitle>
          </DialogHeader>
          <AdmitPatientForm
            bedNumber={selectedBed || 1}
            wardType={selectedWard}
            onSubmit={(patientData) => {
              const newPatient: WardPatient = {
                ...patientData,
                id: Math.random().toString(36).substr(2, 9),
                bedNumber: selectedBed || 6,
                gender: selectedWard,
                orders: [],
                treatmentSheet: [],
                urineMonitoring: [],
                observationChart: [],
                fluidRecord: [],
                glucoseRecord: [],
                slidingScale: [],
                bloodGlucose: [],
              };
              setCurrentWardPatients((prev) => [...prev, newPatient]);
              setShowAdmitDialog(false);
              setSelectedBed(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to get record title
const getRecordTitle = (type: string) => {
  switch (type) {
    case "treatment":
      return "Treatment Sheet";
    case "urine":
      return "Urine Monitoring";
    case "observation":
      return "Observation Chart";
    case "fluid":
      return "Fluid Intake & Output";
    case "glucose":
      return "Glucose Record";
    case "sliding":
      return "Sliding Scale";
    case "blood-glucose":
      return "Blood Glucose Record";
    default:
      return "Record";
  }
};

// Form components for different record types
const renderRecordForm = (type: string, onSubmit: (data: any) => void) => {
  switch (type) {
    case "treatment":
      return <TreatmentForm onSubmit={onSubmit} />;
    case "urine":
      return <UrineForm onSubmit={onSubmit} />;
    case "observation":
      return <ObservationForm onSubmit={onSubmit} />;
    case "fluid":
      return <FluidForm onSubmit={onSubmit} />;
    case "glucose":
      return <GlucoseForm onSubmit={onSubmit} />;
    case "sliding":
      return <SlidingScaleForm onSubmit={onSubmit} />;
    case "blood-glucose":
      return <BloodGlucoseForm onSubmit={onSubmit} />;
    default:
      return null;
  }
};

// Treatment Sheet Form
const TreatmentForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Completed");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ treatment, notes, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="treatment">Treatment Given</Label>
        <Input
          id="treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          placeholder="Describe treatment provided..."
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Not Done">Not Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
        />
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Treatment Record
      </Button>
    </form>
  );
};

// Urine Monitoring Form
const UrineForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [volume, setVolume] = useState("");
  const [color, setColor] = useState("");
  const [clarity, setClarity] = useState("");
  const [specificGravity, setSpecificGravity] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ volume, color, clarity, specificGravity, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="volume">Volume (mL)</Label>
          <Input
            id="volume"
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="500"
            required
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yellow">Yellow</SelectItem>
              <SelectItem value="Dark Yellow">Dark Yellow</SelectItem>
              <SelectItem value="Amber">Amber</SelectItem>
              <SelectItem value="Red">Red</SelectItem>
              <SelectItem value="Brown">Brown</SelectItem>
              <SelectItem value="Clear">Clear</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clarity">Clarity</Label>
          <Select value={clarity} onValueChange={setClarity}>
            <SelectTrigger>
              <SelectValue placeholder="Select clarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Clear">Clear</SelectItem>
              <SelectItem value="Slightly Cloudy">Slightly Cloudy</SelectItem>
              <SelectItem value="Cloudy">Cloudy</SelectItem>
              <SelectItem value="Turbid">Turbid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="specificGravity">Specific Gravity</Label>
          <Input
            id="specificGravity"
            value={specificGravity}
            onChange={(e) => setSpecificGravity(e.target.value)}
            placeholder="1.020"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional observations..."
        />
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Urine Record
      </Button>
    </form>
  );
};

// Observation Chart Form
const ObservationForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [consciousness, setConsciousness] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      temperature,
      pulse,
      respiratoryRate,
      bloodPressure,
      oxygenSaturation,
      consciousness,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="temp">Temperature (°C)</Label>
          <Input
            id="temp"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="36.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="pulse">Pulse (bpm)</Label>
          <Input
            id="pulse"
            type="number"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            placeholder="72"
            required
          />
        </div>
        <div>
          <Label htmlFor="resp">Respiratory Rate (/min)</Label>
          <Input
            id="resp"
            type="number"
            value={respiratoryRate}
            onChange={(e) => setRespiratoryRate(e.target.value)}
            placeholder="16"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
          <Input
            id="bp"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            placeholder="120/80"
            required
          />
        </div>
        <div>
          <Label htmlFor="spo2">Oxygen Saturation (%)</Label>
          <Input
            id="spo2"
            type="number"
            value={oxygenSaturation}
            onChange={(e) => setOxygenSaturation(e.target.value)}
            placeholder="98"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="consciousness">Level of Consciousness</Label>
        <Select value={consciousness} onValueChange={setConsciousness}>
          <SelectTrigger>
            <SelectValue placeholder="Select consciousness level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alert">Alert</SelectItem>
            <SelectItem value="Drowsy">Drowsy</SelectItem>
            <SelectItem value="Confused">Confused</SelectItem>
            <SelectItem value="Unconscious">Unconscious</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="obs-notes">Observations</Label>
        <Textarea
          id="obs-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Clinical observations..."
        />
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Observation
      </Button>
    </form>
  );
};

// Fluid Intake & Output Form
const FluidForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [oral, setOral] = useState("");
  const [iv, setIv] = useState("");
  const [otherIntake, setOtherIntake] = useState("");
  const [urine, setUrine] = useState("");
  const [vomit, setVomit] = useState("");
  const [drainage, setDrainage] = useState("");
  const [otherOutput, setOtherOutput] = useState("");

  const calculateBalance = () => {
    const totalIntake =
      (parseFloat(oral) || 0) +
      (parseFloat(iv) || 0) +
      (parseFloat(otherIntake) || 0);
    const totalOutput =
      (parseFloat(urine) || 0) +
      (parseFloat(vomit) || 0) +
      (parseFloat(drainage) || 0) +
      (parseFloat(otherOutput) || 0);
    return (totalIntake - totalOutput).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      intake: { oral, iv, others: otherIntake },
      output: { urine, vomit, drainage, others: otherOutput },
      balance: calculateBalance(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h4 className="font-semibold text-green-700 mb-3">Fluid Intake (mL)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="oral">Oral</Label>
            <Input
              id="oral"
              type="number"
              value={oral}
              onChange={(e) => setOral(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="iv">IV Fluids</Label>
            <Input
              id="iv"
              type="number"
              value={iv}
              onChange={(e) => setIv(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="other-intake">Others</Label>
            <Input
              id="other-intake"
              type="number"
              value={otherIntake}
              onChange={(e) => setOtherIntake(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-red-700 mb-3">Fluid Output (mL)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="urine-out">Urine</Label>
            <Input
              id="urine-out"
              type="number"
              value={urine}
              onChange={(e) => setUrine(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="vomit">Vomit</Label>
            <Input
              id="vomit"
              type="number"
              value={vomit}
              onChange={(e) => setVomit(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="drainage">Drainage</Label>
            <Input
              id="drainage"
              type="number"
              value={drainage}
              onChange={(e) => setDrainage(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="other-output">Others</Label>
            <Input
              id="other-output"
              type="number"
              value={otherOutput}
              onChange={(e) => setOtherOutput(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <Label className="font-semibold">Fluid Balance</Label>
        <div className="text-lg font-bold text-blue-700">
          {calculateBalance()} mL
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Fluid Record
      </Button>
    </form>
  );
};

// Glucose Record Form
const GlucoseForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ bloodGlucose, method, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="glucose-value">Blood Glucose (mg/dL)</Label>
          <Input
            id="glucose-value"
            type="number"
            value={bloodGlucose}
            onChange={(e) => setBloodGlucose(e.target.value)}
            placeholder="120"
            required
          />
        </div>
        <div>
          <Label htmlFor="method">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Finger stick">Finger stick</SelectItem>
              <SelectItem value="Lab">Lab</SelectItem>
              <SelectItem value="Continuous monitor">
                Continuous monitor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="glucose-notes">Notes</Label>
        <Textarea
          id="glucose-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
        />
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Glucose Record
      </Button>
    </form>
  );
};

// Sliding Scale Form
const SlidingScaleForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [insulinGiven, setInsulinGiven] = useState("");
  const [insulinType, setInsulinType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ bloodGlucose, insulinGiven, insulinType, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ss-glucose">Blood Glucose (mg/dL)</Label>
          <Input
            id="ss-glucose"
            type="number"
            value={bloodGlucose}
            onChange={(e) => setBloodGlucose(e.target.value)}
            placeholder="180"
            required
          />
        </div>
        <div>
          <Label htmlFor="insulin-given">Insulin Given (units)</Label>
          <Input
            id="insulin-given"
            type="number"
            value={insulinGiven}
            onChange={(e) => setInsulinGiven(e.target.value)}
            placeholder="4"
            required
          />
        </div>
        <div>
          <Label htmlFor="insulin-type">Insulin Type</Label>
          <Select value={insulinType} onValueChange={setInsulinType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="NPH">NPH</SelectItem>
              <SelectItem value="Lispro">Lispro</SelectItem>
              <SelectItem value="Aspart">Aspart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="ss-notes">Notes</Label>
        <Textarea
          id="ss-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
        />
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Sliding Scale Record
      </Button>
    </form>
  );
};

// Blood Glucose Form
const BloodGlucoseForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [value, setValue] = useState("");
  const [method, setMethod] = useState("");
  const [action, setAction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ value, method, action });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="bg-value">Blood Glucose (mg/dL)</Label>
          <Input
            id="bg-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="95"
            required
          />
        </div>
        <div>
          <Label htmlFor="bg-method">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fasting">Fasting</SelectItem>
              <SelectItem value="Random">Random</SelectItem>
              <SelectItem value="Post-meal">Post-meal</SelectItem>
              <SelectItem value="Bedtime">Bedtime</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="bg-action">Action Taken</Label>
          <Input
            id="bg-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="No action required"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Blood Glucose Record
      </Button>
    </form>
  );
};

// Admit Patient Form
const AdmitPatientForm = ({
  bedNumber,
  wardType,
  onSubmit,
}: {
  bedNumber: number;
  wardType: string;
  onSubmit: (data: any) => void;
}) => {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [assignedNurse, setAssignedNurse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patientId,
      name,
      personalNumber,
      age: parseInt(age),
      diagnosis,
      assignedNurse,
      admissionDate: new Date().toISOString().split("T")[0],
      admissionTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
      status: "Stable",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="patient-id">Patient ID</Label>
        <Input
          id="patient-id"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="P004"
          required
        />
      </div>
      <div>
        <Label htmlFor="patient-name">Patient Name</Label>
        <Input
          id="patient-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter patient name"
          required
        />
      </div>
      <div>
        <Label htmlFor="personal-num">Personal Number</Label>
        <Input
          id="personal-num"
          value={personalNumber}
          onChange={(e) => setPersonalNumber(e.target.value)}
          placeholder="EMP004"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            required
          />
        </div>
        <div>
          <Label htmlFor="nurse">Assigned Nurse</Label>
          <Select value={assignedNurse} onValueChange={setAssignedNurse}>
            <SelectTrigger>
              <SelectValue placeholder="Select nurse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nurse Mary">Nurse Mary</SelectItem>
              <SelectItem value="Nurse John">Nurse John</SelectItem>
              <SelectItem value="Nurse Sarah">Nurse Sarah</SelectItem>
              <SelectItem value="Nurse Alice">Nurse Alice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea
          id="diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Enter primary diagnosis..."
          required
        />
      </div>
      <Button type="submit" className="w-full">
        <UserPlus className="h-4 w-4 mr-2" />
        Admit to Bed {bedNumber}
      </Button>
    </form>
  );
};

// History rendering function
const renderHistoryContent = (
  patient: WardPatient,
  type: string,
  expandedRecords: { [key: string]: boolean },
  toggleRecord: (recordId: string) => void
) => {
  const getRecords = () => {
    switch (type) {
      case "treatment":
        return patient.treatmentSheet;
      case "urine":
        return patient.urineMonitoring;
      case "observation":
        return patient.observationChart;
      case "fluid":
        return patient.fluidRecord;
      case "glucose":
        return patient.glucoseRecord;
      case "sliding":
        return patient.slidingScale;
      case "blood-glucose":
        return patient.bloodGlucose;
      default:
        return [];
    }
  };

  const records = getRecords();

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No {getRecordTitle(type).toLowerCase()} records found
        </p>
      </div>
    );
  }

  // Group records by date
  const groupedRecords = records.reduce(
    (acc: { [key: string]: any[] }, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedRecords).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date} className="border rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-3">
            {new Date(date).toLocaleDateString()}
          </h4>
          <div className="space-y-2">
            {groupedRecords[date]
              .sort((a, b) => b.time.localeCompare(a.time))
              .map((record) => {
                const recordKey = `${record.date}_${record.time}_${record.id}`;
                const isExpanded = expandedRecords[recordKey];

                return (
                  <div key={record.id} className="border rounded-md">
                    <div className="flex items-center justify-between p-3">
                      <div className="text-sm">
                        <div className="font-medium">
                          {record.time} — {getRecordSummary(record, type)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Recorded by {record.recordedBy}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRecord(recordKey)}
                      >
                        {isExpanded ? "▼ Hide" : "▶ Show"}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="p-3 pt-0 bg-gray-50">
                        {renderRecordDetails(record, type)}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions
const getRecordSummary = (record: any, type: string) => {
  switch (type) {
    case "treatment":
      return record.treatment;
    case "urine":
      return `${record.volume}mL, ${record.color}`;
    case "observation":
      return `T:${record.temperature}°C, P:${record.pulse}, BP:${record.bloodPressure}`;
    case "fluid":
      return `Balance: ${record.balance}mL`;
    case "glucose":
      return `${record.bloodGlucose}mg/dL (${record.method})`;
    case "sliding":
      return `${record.bloodGlucose}mg/dL → ${record.insulinGiven}u ${record.insulinType}`;
    case "blood-glucose":
      return `${record.value}mg/dL (${record.method})`;
    default:
      return "Record";
  }
};

const renderRecordDetails = (record: any, type: string) => {
  switch (type) {
    case "treatment":
      return (
        <div className="space-y-2">
          <div>
            <strong>Treatment:</strong> {record.treatment}
          </div>
          <div>
            <strong>Status:</strong> {record.status}
          </div>
          {record.notes && (
            <div>
              <strong>Notes:</strong> {record.notes}
            </div>
          )}
        </div>
      );
    case "urine":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Volume:</strong> {record.volume} mL
          </div>
          <div>
            <strong>Color:</strong> {record.color}
          </div>
          <div>
            <strong>Clarity:</strong> {record.clarity}
          </div>
          {record.specificGravity && (
            <div>
              <strong>Specific Gravity:</strong> {record.specificGravity}
            </div>
          )}
          {record.notes && (
            <div className="col-span-2">
              <strong>Notes:</strong> {record.notes}
            </div>
          )}
        </div>
      );
    case "observation":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <strong>Temperature:</strong> {record.temperature}°C
          </div>
          <div>
            <strong>Pulse:</strong> {record.pulse} bpm
          </div>
          <div>
            <strong>Respiratory Rate:</strong> {record.respiratoryRate}/min
          </div>
          <div>
            <strong>Blood Pressure:</strong> {record.bloodPressure}
          </div>
          <div>
            <strong>O2 Saturation:</strong> {record.oxygenSaturation}%
          </div>
          <div>
            <strong>Consciousness:</strong> {record.consciousness}
          </div>
          {record.notes && (
            <div className="col-span-full">
              <strong>Notes:</strong> {record.notes}
            </div>
          )}
        </div>
      );
    case "fluid":
      return (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-700 mb-2">Intake (mL)</h5>
            <div className="space-y-1 text-sm">
              <div>Oral: {record.intake.oral}</div>
              <div>IV: {record.intake.iv}</div>
              <div>Others: {record.intake.others}</div>
            </div>
          </div>
          <div>
            <h5 className="font-medium text-red-700 mb-2">Output (mL)</h5>
            <div className="space-y-1 text-sm">
              <div>Urine: {record.output.urine}</div>
              <div>Vomit: {record.output.vomit}</div>
              <div>Drainage: {record.output.drainage}</div>
              <div>Others: {record.output.others}</div>
            </div>
          </div>
          <div className="col-span-2 pt-2 border-t">
            <strong>Balance: {record.balance} mL</strong>
          </div>
        </div>
      );
    case "glucose":
    case "sliding":
    case "blood-glucose":
      return (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(record).map(([key, value]) =>
            key !== "id" &&
            key !== "date" &&
            key !== "time" &&
            key !== "recordedBy" &&
            value ? (
              <div key={key}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                {value as string}
              </div>
            ) : null
          )}
        </div>
      );
    default:
      return <div>Record details</div>;
  }
};

export default WardManagement;
