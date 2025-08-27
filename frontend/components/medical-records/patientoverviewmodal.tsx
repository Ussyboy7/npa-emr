// PatientOverviewModalContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Download,
  FileText,
  Calendar,
  User,
  Heart,
  Activity,
  Edit,
  Phone,
  Mail,
  MapPin,
  Clock,
  Stethoscope,
  Plus,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

// Types matching your registration form
interface Patient {
  id: string;
  employeeCategory: "Employee" | "Retiree" | "NonNPA" | "Dependent";
  dependentType?: "Employee Dependent" | "Retiree Dependent";
  personalNumber: string;
  title: string;
  surname: string;
  firstName: string;
  lastName: string;
  type?: string;
  division?: string;
  location?: string;
  maritalStatus: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  email: string;
  phone: string;
  address: string;
  residentialAddress: string;
  stateOfResidence: string;
  permanentAddress: string;
  stateOfOrigin: string;
  bloodGroup: string;
  genotype: string;
  nonnpaType?: string;
  nextOfKin: {
    firstName: string;
    lastName: string;
    relationship: string;
    address: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface VitalReading {
  id: string;
  patientId: string;
  date: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  bloodSugar?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  recordedBy: string;
}

interface MedicalReport {
  id: string;
  patientId: string;
  fileNumber: string;
  reportName: string;
  reportType: string;
  date: string;
  doctor: string;
  status: "completed" | "pending" | "cancelled";
  downloadUrl?: string;
}

interface Visit {
  id: string;
  patientId: string;
  date: string;
  time: string;
  clinic: string;
  doctor: string;
  complaint: string;
  diagnosis?: string;
  treatment?: string;
  nextAppointment?: string;
  status: "completed" | "ongoing" | "cancelled";
}

interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: "registration" | "nursing" | "consultation" | "laboratory" | "radiology" | "pharmacy" | "discharge" | "admission";
  title: string;
  description: string;
  location: string;
  staff: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  duration?: number; // in minutes
  notes?: string;
  relatedRecordId?: string; // links to visit, report, or prescription
}

// Duplicate patients array here to fix the reference error
const patients = [
  { id: 1, personalNumber: "EMP001", name: "John Doe", category: "Employee", registeredAt: "2024-03-25" },
  { id: 2, personalNumber: "EMP-D01", name: "Jane Doe", category: "Employee Dependent", registeredAt: "2024-03-12" },
  { id: 3, personalNumber: "RET001", name: "Jane Smith", category: "Retiree", registeredAt: "2024-02-14" },
  { id: 4, personalNumber: "NPA001", name: "Mike Johnson", category: "Non-NPA", nonNpaType: "Police", registeredAt: "2024-01-10" },
  { id: 5, personalNumber: "NPA002", name: "Sarah Connor", category: "Non-NPA", nonNpaType: "NYSC", registeredAt: "2024-03-10" },
  { id: 6, personalNumber: "RET-D01", name: "Peter Obi", category: "Retiree Dependent", registeredAt: "2024-03-01" }, // Hidden
];

// Mock API functions (replace with actual API calls)
const getMockPatient = (id: number) => ({
  id: `PAT-${id}`,
  employeeCategory: "Employee",
  personalNumber: patients.find(p => p.id === id)?.personalNumber || "E-A2962",
  title: "Mr.",
  surname: "Doe",
  firstName: "John",
  lastName: "Smith",
  type: "Officer",
  division: "ICT",
  location: "Headquarters",
  maritalStatus: "Married",
  gender: "Male",
  dateOfBirth: "1979-03-15",
  age: "45",
  email: "john.doe@npa.gov.ng",
  phone: "+234-803-123-4567",
  address: "123 Main Street, Lagos",
  residentialAddress: "45 Victoria Island, Lagos",
  stateOfResidence: "Lagos",
  permanentAddress: "12 Ancestral Home, Ogun State",
  stateOfOrigin: "Ogun",
  bloodGroup: "A+",
  genotype: "AA",
  nextOfKin: {
    firstName: "Jane",
    lastName: "Doe",
    relationship: "Spouse",
    address: "45 Victoria Island, Lagos",
    phone: "+234-803-123-4568"
  },
  createdAt: "2023-01-15T00:00:00Z",
  updatedAt: "2024-04-01T00:00:00Z"
});

// Similarly, you can add logic for other mocks based on id if needed. For now, use same mocks.

const mockVitals: VitalReading[] = [
  { id: "V1", patientId: "PAT-001", date: "2024-01-15", systolic: 120, diastolic: 80, heartRate: 72, bloodSugar: 95, temperature: 36.5, weight: 75, height: 175, recordedBy: "Nurse Mary" },
  { id: "V2", patientId: "PAT-001", date: "2024-02-10", systolic: 125, diastolic: 82, heartRate: 75, bloodSugar: 102, temperature: 36.7, weight: 76, height: 175, recordedBy: "Nurse John" },
  { id: "V3", patientId: "PAT-001", date: "2024-03-05", systolic: 118, diastolic: 78, heartRate: 68, bloodSugar: 88, temperature: 36.4, weight: 74, height: 175, recordedBy: "Nurse Mary" },
  { id: "V4", patientId: "PAT-001", date: "2024-03-20", systolic: 122, diastolic: 81, heartRate: 71, bloodSugar: 91, temperature: 36.6, weight: 75, height: 175, recordedBy: "Dr. Smith" },
  { id: "V5", patientId: "PAT-001", date: "2024-04-01", systolic: 119, diastolic: 79, heartRate: 69, bloodSugar: 93, temperature: 36.5, weight: 74, height: 175, recordedBy: "Nurse John" },
];

const mockReports: MedicalReport[] = [
  { id: "R1", patientId: "PAT-001", fileNumber: "RPT-2024-001", reportName: "Complete Blood Count", reportType: "Laboratory", date: "2024-04-01", doctor: "Dr. Johnson", status: "completed", downloadUrl: "#" },
  { id: "R2", patientId: "PAT-001", fileNumber: "RPT-2024-002", reportName: "Chest X-Ray", reportType: "Radiology", date: "2024-03-20", doctor: "Dr. Wilson", status: "completed", downloadUrl: "#" },
  { id: "R3", patientId: "PAT-001", fileNumber: "RPT-2024-003", reportName: "ECG Report", reportType: "Cardiology", date: "2024-03-05", doctor: "Dr. Brown", status: "completed", downloadUrl: "#" },
  { id: "R4", patientId: "PAT-001", fileNumber: "RPT-2024-004", reportName: "Lipid Profile", reportType: "Laboratory", date: "2024-02-15", doctor: "Dr. Johnson", status: "pending" },
];

const mockVisits: Visit[] = [
  { id: "V1", patientId: "PAT-001", date: "2024-04-01", time: "10:30", clinic: "General Medicine", doctor: "Dr. Sarah Smith", complaint: "Routine check-up", diagnosis: "Mild hypertension", treatment: "Lifestyle modification recommended", nextAppointment: "2024-05-01", status: "completed" },
  { id: "V2", patientId: "PAT-001", date: "2024-03-20", time: "14:15", clinic: "Cardiology", doctor: "Dr. Brown", complaint: "Chest discomfort", diagnosis: "Normal ECG, stress-related", treatment: "Stress management counseling", status: "completed" },
  { id: "V3", patientId: "PAT-001", date: "2024-03-05", time: "11:00", clinic: "Radiology", doctor: "Dr. Wilson", complaint: "Chest X-ray", diagnosis: "Clear chest", treatment: "No treatment required", status: "completed" },
];

const mockTimeline: TimelineEvent[] = [
  {
    id: "TL1", patientId: "PAT-001", date: "2024-04-01", time: "08:30", type: "registration",
    title: "Patient Registration", description: "Patient registered for consultation", location: "Reception",
    staff: "Mrs. Johnson", status: "completed", duration: 15, notes: "Insurance verified, documents collected"
  },
  {
    id: "TL2", patientId: "PAT-001", date: "2024-04-01", time: "09:00", type: "nursing",
    title: "Vital Signs Assessment", description: "Blood pressure, weight, temperature recorded", location: "Nursing Station A",
    staff: "Nurse Mary", status: "completed", duration: 20, notes: "BP: 119/79, Weight: 74kg, Temp: 36.5°C"
  },
  {
    id: "TL3", patientId: "PAT-001", date: "2024-04-01", time: "09:30", type: "laboratory",
    title: "Blood Sample Collection", description: "Blood drawn for CBC and lipid profile", location: "Laboratory",
    staff: "Lab Tech John", status: "completed", duration: 10, notes: "2 vials collected, samples sent for analysis"
  },
  {
    id: "TL4", patientId: "PAT-001", date: "2024-04-01", time: "10:30", type: "consultation",
    title: "Doctor Consultation", description: "Consultation with Dr. Sarah Smith", location: "Consulting Room 3",
    staff: "Dr. Sarah Smith", status: "completed", duration: 30, notes: "Discussed test results, prescribed lifestyle changes", relatedRecordId: "V1"
  },
  {
    id: "TL5", patientId: "PAT-001", date: "2024-04-01", time: "11:15", type: "pharmacy",
    title: "Medication Dispensed", description: "Blood pressure medication provided", location: "Pharmacy",
    staff: "Pharmacist David", status: "completed", duration: 10, notes: "Lisinopril 10mg, 30 tablets dispensed with instructions"
  },
  {
    id: "TL6", patientId: "PAT-001", date: "2024-03-28", time: "08:00", type: "laboratory",
    title: "Lab Results Available", description: "CBC and lipid profile results ready", location: "Laboratory",
    staff: "Lab Supervisor", status: "completed", notes: "All values within normal range"
  },
  {
    id: "TL7", patientId: "PAT-001", date: "2024-03-20", time: "13:00", type: "nursing",
    title: "Pre-Consultation Assessment", description: "Initial assessment before cardiology consultation", location: "Cardiology Ward",
    staff: "Nurse Peter", status: "completed", duration: 15, notes: "Patient vitals stable, no immediate concerns"
  },
  {
    id: "TL8", patientId: "PAT-001", date: "2024-03-20", time: "14:15", type: "consultation",
    title: "Cardiology Consultation", description: "Specialist consultation for chest discomfort", location: "Cardiology Clinic",
    staff: "Dr. Brown", status: "completed", duration: 45, notes: "ECG performed, results normal", relatedRecordId: "V2"
  },
  {
    id: "TL9", patientId: "PAT-001", date: "2024-03-20", time: "15:30", type: "radiology",
    title: "ECG Procedure", description: "Electrocardiogram performed", location: "Radiology Department",
    staff: "Radiographer Sarah", status: "completed", duration: 20, notes: "Normal sinus rhythm observed"
  },
  {
    id: "TL10", patientId: "PAT-001", date: "2024-05-01", time: "10:00", type: "consultation",
    title: "Follow-up Appointment", description: "Scheduled follow-up for blood pressure monitoring", location: "Consulting Room 2",
    staff: "Dr. Sarah Smith", status: "pending", notes: "Follow-up for hypertension management"
  }
];

// VitalChart Component
interface VitalChartProps {
  title: string;
  icon: React.ReactNode;
  data: VitalReading[];
  dataKey: keyof VitalReading;
  secondaryDataKey?: keyof VitalReading;
  stroke: string;
  secondaryStroke?: string;
  name: string;
  secondaryName?: string;
  yAxisDomain: [number, number];
  unit: string;
  referenceLines?: { value: number; label: string; stroke: string }[];
}

const VitalChart: React.FC<VitalChartProps> = ({
  title,
  icon,
  data,
  dataKey,
  secondaryDataKey,
  stroke,
  secondaryStroke,
  name,
  secondaryName,
  yAxisDomain,
  unit,
  referenceLines,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="text-sm font-semibold">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.stroke }}>
              {entry.name}: {entry.value} {unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={stroke}
                strokeWidth={2}
                name={name}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              {secondaryDataKey && secondaryStroke && secondaryName && (
                <Line
                  type="monotone"
                  dataKey={secondaryDataKey}
                  stroke={secondaryStroke}
                  strokeWidth= {2}
                  name={secondaryName}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
              {referenceLines?.map((ref) => (
                <ReferenceLine
                  key={ref.label}
                  y={ref.value}
                  label={{ value: ref.label, position: "insideTopRight", fontSize: 10 }}
                  stroke={ref.stroke}
                  strokeDasharray="3 3"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function PatientOverviewModalContent({ patientId }: { patientId: number }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated API calls
  const fetchPatientData = async (id: number) => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, replace with actual API calls using patientId
      
      setPatient(getMockPatient(id));
      setVitals(mockVitals);
      setReports(mockReports);
      setVisits(mockVisits);
      setTimeline(mockTimeline);
    } catch (err) {
      setError("Failed to fetch patient data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timeline helper functions
  const getTimelineIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case "registration": return <User className="h-4 w-4" />;
      case "nursing": return <Stethoscope className="h-4 w-4" />;
      case "consultation": return <User className="h-4 w-4" />;
      case "laboratory": return <Activity className="h-4 w-4" />;
      case "radiology": return <FileText className="h-4 w-4" />;
      case "pharmacy": return <Plus className="h-4 w-4" />;
      case "discharge": return <CheckCircle className="h-4 w-4" />;
      case "admission": return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case "registration": return "bg-blue-100 text-blue-800 border-blue-200";
      case "nursing": return "bg-green-100 text-green-800 border-green-200";
      case "consultation": return "bg-purple-100 text-purple-800 border-purple-200";
      case "laboratory": return "bg-orange-100 text-orange-800 border-orange-200";
      case "radiology": return "bg-pink-100 text-pink-800 border-pink-200";
      case "pharmacy": return "bg-teal-100 text-teal-800 border-teal-200";
      case "discharge": return "bg-gray-100 text-gray-800 border-gray-200";
      case "admission": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientData(patientId);
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading patient data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <p>No patient data available.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Employee": return "bg-blue-100 text-blue-800";
      case "Retiree": return "bg-purple-100 text-purple-800";
      case "NonNPA": return "bg-orange-100 text-orange-800";
      case "Dependent": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Patient Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {patient.title} {patient.firstName} {patient.lastName} {patient.surname}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getCategoryBadgeColor(patient.employeeCategory)}>
                {patient.employeeCategory}
              </Badge>
              {patient.dependentType && (
                <Badge variant="outline">{patient.dependentType}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Patient ID</p>
              <p className="font-semibold">{patient.personalNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Age / Gender</p>
              <p className="font-semibold">{patient.age} years / {patient.gender}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <Badge variant="outline">{patient.bloodGroup}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Genotype</p>
              <Badge variant="outline">{patient.genotype}</Badge>
            </div>
            {patient.type && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Employee Type</p>
                <p className="font-semibold">{patient.type}</p>
              </div>
            )}
            {patient.division && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Division</p>
                <p className="font-semibold">{patient.division}</p>
              </div>
            )}
            {patient.location && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{patient.location}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Marital Status</p>
              <p className="font-semibold">{patient.maritalStatus}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Latest Vitals Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {vitals.length > 0 && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Blood Pressure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {vitals[vitals.length - 1].systolic}/{vitals[vitals.length - 1].diastolic}
                    </div>
                    <p className="text-xs text-muted-foreground">mmHg</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      Heart Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {vitals[vitals.length - 1].heartRate}
                    </div>
                    <p className="text-xs text-muted-foreground">BPM</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Blood Sugar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {vitals[vitals.length - 1].bloodSugar}
                    </div>
                    <p className="text-xs text-muted-foreground">mg/dL</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-purple-500" />
                      Weight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {vitals[vitals.length - 1].weight}
                    </div>
                    <p className="text-xs text-muted-foreground">kg</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Last Visit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visits.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Clinic</p>
                        <p className="font-medium">{visits[0].clinic}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(visits[0].date).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Doctor</p>
                        <p className="font-medium">{visits[0].doctor}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diagnosis</p>
                      <p className="text-sm mt-1">{visits[0].diagnosis || "No diagnosis recorded"}</p>
                    </div>
                    {visits[0].nextAppointment && (
                      <div>
                        <p className="text-sm text-muted-foreground">Next Appointment</p>
                        <p className="text-sm mt-1">{new Date(visits[0].nextAppointment).toLocaleDateString()}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.reportName}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.reportType} • {new Date(report.date).toLocaleDateString()}
                        </p>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      {report.downloadUrl && report.status === "completed" && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Patient Journey Timeline
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Timeline
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline Legend */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mr-4">Legend:</div>
                  {[
                    { type: "registration", label: "Registration" },
                    { type: "nursing", label: "Nursing" },
                    { type: "consultation", label: "Consultation" },
                    { type: "laboratory", label: "Laboratory" },
                    { type: "radiology", label: "Radiology" },
                    { type: "pharmacy", label: "Pharmacy" }
                  ].map((item) => (
                    <div key={item.type} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTimelineColor(item.type as TimelineEvent['type'])}`}>
                      {getTimelineIcon(item.type as TimelineEvent['type'])}
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Timeline Events */}
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {timeline
                      .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
                      .map((event) => (
                        <div key={event.id} className="relative flex items-start gap-4">
                          {/* Timeline dot */}
                          <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center ${getTimelineColor(event.type)}`}>
                            {getTimelineIcon(event.type)}
                          </div>
                          
                          {/* Event content */}
                          <div className="flex-1 min-w-0">
                            <Card className={`${event.status === 'pending' ? 'border-dashed' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(event.status)}>
                                      {event.status}
                                    </Badge>
                                    {event.status === 'pending' && (
                                      <Badge variant="outline" className="text-xs">
                                        Scheduled
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Date & Time</p>
                                    <p className="font-medium">
                                      {new Date(event.date).toLocaleDateString()} at {event.time}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Location</p>
                                    <p className="font-medium">{event.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Staff</p>
                                    <p className="font-medium">{event.staff}</p>
                                  </div>
                                  {event.duration && (
                                    <div>
                                      <p className="text-muted-foreground">Duration</p>
                                      <p className="font-medium">{formatDuration(event.duration)}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {event.notes && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                                    <p className="text-sm">{event.notes}</p>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-2">
                                    {event.relatedRecordId && (
                                      <Badge variant="outline" className="text-xs">
                                        ID: {event.relatedRecordId}
                                      </Badge>
                                    )}
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTimelineColor(event.type)}`}>
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {event.relatedRecordId && (
                                      <Button variant="ghost" size="sm">
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {timeline.filter(e => e.status === 'completed').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {timeline.filter(e => e.status === 'pending').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Pending Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {timeline.filter(e => e.type === 'consultation').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Consultations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(timeline.filter(e => e.duration).reduce((acc, e) => acc + (e.duration || 0), 0) / 60 * 10) / 10}h
                        </div>
                        <div className="text-sm text-muted-foreground">Total Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VitalChart
              title="Blood Pressure Trend"
              icon={<Heart className="h-4 w-4 text-red-500" />}
              data={vitals}
              dataKey="systolic"
              secondaryDataKey="diastolic"
              stroke="#ef4444"
              secondaryStroke="#f97316"
              name="Systolic"
              secondaryName="Diastolic"
              yAxisDomain={[60, 200]}
              unit="mmHg"
              referenceLines={[
                { value: 120, label: "Normal", stroke: "#22c55e" },
                { value: 140, label: "High", stroke: "#ef4444" },
              ]}
            />
            <VitalChart
              title="Heart Rate Trend"
              icon={<Activity className="h-4 w-4 text-green-500" />}
              data={vitals}
              dataKey="heartRate"
              stroke="#22c55e"
              name="Heart Rate"
              yAxisDomain={[40, 120]}
              unit="BPM"
              referenceLines={[
                { value: 60, label: "Normal Low", stroke: "#22c55e" },
                { value: 100, label: "Normal High", stroke: "#22c55e" },
              ]}
            />
            <VitalChart
              title="Blood Sugar Trend"
              icon={<Activity className="h-4 w-4 text-blue-500" />}
              data={vitals}
              dataKey="bloodSugar"
              stroke="#3b82f6"
              name="Blood Sugar"
              yAxisDomain={[50, 200]}
              unit="mg/dL"
              referenceLines={[
                { value: 100, label: "Normal", stroke: "#22c55e" },
                { value: 140, label: "Pre-diabetic", stroke: "#eab308" },
              ]}
            />
            <VitalChart
              title="Weight Trend"
              icon={<Stethoscope className="h-4 w-4 text-purple-500" />}
              data={vitals}
              dataKey="weight"
              stroke="#8b5cf6"
              name="Weight"
              yAxisDomain={[50, 100]}
              unit="kg"
            />
          </div>
          
          {/* Add New Vital Reading Button */}
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record New Vitals
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="visits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Visit History
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div key={visit.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{visit.clinic}</h3>
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date & Time</p>
                            <p>{new Date(visit.date).toLocaleDateString()} at {visit.time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Doctor</p>
                            <p>{visit.doctor}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Complaint</p>
                            <p>{visit.complaint}</p>
                          </div>
                        </div>
                        {visit.diagnosis && (
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Diagnosis</p>
                            <p className="text-sm">{visit.diagnosis}</p>
                          </div>
                        )}
                        {visit.treatment && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Treatment</p>
                            <p className="text-sm">{visit.treatment}</p>
                          </div>
                        )}
                        {visit.nextAppointment && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Next Appointment</p>
                            <p className="text-sm">{new Date(visit.nextAppointment).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Reports
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{report.reportName}</h4>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>File: {report.fileNumber}</div>
                        <div>Type: {report.reportType}</div>
                        <div>Date: {new Date(report.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Doctor: {report.doctor}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {report.downloadUrl && report.status === "completed" && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Residential Address</p>
                      <p className="font-medium">{patient.residentialAddress}</p>
                      <p className="text-sm text-muted-foreground">{patient.stateOfResidence}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Permanent Address</p>
                      <p className="font-medium">{patient.permanentAddress}</p>
                      <p className="text-sm text-muted-foreground">{patient.stateOfOrigin}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Next of Kin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {patient.nextOfKin.firstName} {patient.nextOfKin.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">{patient.nextOfKin.relationship}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient.nextOfKin.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{patient.nextOfKin.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact Information
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}