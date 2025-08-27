"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Search, Eye, Edit, Clock, Calendar, Users, Stethoscope, User, ArrowRight, UserCheck, X, FileText, Activity, Heart, Pill, AlertTriangle, TestTube, Shield } from "lucide-react";

type Priority = "High" | "Medium" | "Low";
type AssignmentStatus = "Assigned" | "Unassigned" | "In Progress";

interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  priority: Priority;
  waitTime: string;
  complaint: string;
  assignedTo: string;
  assignmentStatus: AssignmentStatus;
  queueTime: string;
  queueDate: string;
  clinic: string;
  visitType: string;
  age: number;
  gender: string;
  phoneNumber: string;
  employeeCategory: string;
  location?: string;
  consultationRoom?: string; // Room assigned from nurse pool
  sentFromNurse?: boolean; // Flag to indicate patient came from nurse
  vitalsRecorded?: boolean; // Indicates if vitals were taken
  nurseNotes?: string; // Any notes from nursing staff
}

interface MedicalHistory {
  consultations: ConsultationRecord[];
  medications: MedicationRecord[];
  allergies: AllergyRecord[];
  vitals: VitalRecord[];
  labResults: LabResult[];
  immunizations: ImmunizationRecord[];
}

interface ConsultationRecord {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  followUpDate?: string;
  status: "Completed" | "Pending Follow-up" | "Referred";
}

interface MedicationRecord {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: "Active" | "Completed" | "Discontinued";
  notes?: string;
}

interface AllergyRecord {
  id: string;
  allergen: string;
  reaction: string;
  severity: "Mild" | "Moderate" | "Severe";
  dateRecorded: string;
  notes?: string;
}

interface VitalRecord {
  id: string;
  date: string;
  time: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height?: number;
  bmi?: number;
  recordedBy: string;
}

interface LabResult {
  id: string;
  testName: string;
  result: string;
  normalRange: string;
  status: "Normal" | "Abnormal" | "Critical";
  date: string;
  orderedBy: string;
  notes?: string;
}

interface ImmunizationRecord {
  id: string;
  vaccine: string;
  date: string;
  dose: string;
  administeredBy: string;
  batchNumber?: string;
  nextDueDate?: string;
  reactions?: string;
}

// Mock consultation queue data - simulating patients sent from nurse pool
const queueMock: QueueItem[] = [
  {
    id: "C001",
    patientId: "P001",
    patientName: "John Doe",
    priority: "High",
    waitTime: "25 min",
    complaint: "Chest pain and shortness of breath",
    assignedTo: "Dr. Smith",
    assignmentStatus: "Assigned",
    queueTime: "08:30 AM",
    queueDate: "2025-08-15",
    clinic: "GOP",
    visitType: "Emergency",
    age: 45,
    gender: "Male",
    phoneNumber: "123-456-7890",
    employeeCategory: "Employee",
    location: "Headquarters",
    consultationRoom: "Room 1",
    sentFromNurse: true,
    vitalsRecorded: true,
    nurseNotes: "Vitals completed, patient stable"
  },
  {
    id: "C002",
    patientId: "P002",
    patientName: "Jane Smith",
    priority: "Medium",
    waitTime: "18 min",
    complaint: "Persistent headache for 3 days",
    assignedTo: "Unassigned",
    assignmentStatus: "Unassigned",
    queueTime: "09:15 AM",
    queueDate: "2025-08-15",
    clinic: "GOP",
    visitType: "Consultation",
    age: 34,
    gender: "Female",
    phoneNumber: "987-654-3210",
    employeeCategory: "Employee",
    location: "Branch Office",
    consultationRoom: "Room 3",
    sentFromNurse: true,
    vitalsRecorded: true
  },
  {
    id: "C003",
    patientId: "P003",
    patientName: "Robert Johnson",
    priority: "Low",
    waitTime: "32 min",
    complaint: "Routine health checkup",
    assignedTo: "Dr. Johnson",
    assignmentStatus: "In Progress",
    queueTime: "08:00 AM",
    queueDate: "2025-08-15",
    clinic: "GOP",
    visitType: "Routine",
    age: 28,
    gender: "Male",
    phoneNumber: "555-123-4567",
    employeeCategory: "Employee",
    location: "Headquarters",
    consultationRoom: "Room 2",
    sentFromNurse: true,
    vitalsRecorded: true,
    nurseNotes: "Annual checkup, all vitals normal"
  },
  {
    id: "C004",
    patientId: "P004",
    patientName: "Sarah Wilson",
    priority: "High",
    waitTime: "8 min",
    complaint: "Severe shortness of breath",
    assignedTo: "Unassigned",
    assignmentStatus: "Unassigned",
    queueTime: "10:00 AM",
    queueDate: "2025-08-15",
    clinic: "GOP",
    visitType: "Emergency",
    age: 52,
    gender: "Female",
    phoneNumber: "444-987-6543",
    employeeCategory: "Retiree",
    location: "Remote",
    consultationRoom: "Room 4",
    sentFromNurse: true,
    vitalsRecorded: true
  },
  {
    id: "C005",
    patientId: "P005",
    patientName: "Michael Brown",
    priority: "Medium",
    waitTime: "15 min",
    complaint: "Follow-up on diabetes management",
    assignedTo: "Dr. Davis",
    assignmentStatus: "Assigned",
    queueTime: "09:45 AM",
    queueDate: "2025-08-15",
    clinic: "Endocrinology",
    visitType: "Follow-up",
    age: 58,
    gender: "Male",
    phoneNumber: "333-555-7777",
    employeeCategory: "Employee",
    location: "Headquarters",
    consultationRoom: "Room 5",
    sentFromNurse: false, // Direct appointment
    vitalsRecorded: false
  },
  {
    id: "C006",
    patientId: "P006",
    patientName: "Emily Davis",
    priority: "Low",
    waitTime: "22 min",
    complaint: "Annual physical examination",
    assignedTo: "Dr. Wilson",
    assignmentStatus: "Assigned",
    queueTime: "08:45 AM",
    queueDate: "2025-08-15",
    clinic: "GOP",
    visitType: "Physical",
    age: 29,
    gender: "Female",
    phoneNumber: "222-444-8888",
    employeeCategory: "Employee",
    location: "Branch Office",
    consultationRoom: "Room 6",
    sentFromNurse: true,
    vitalsRecorded: true,
    nurseNotes: "Patient ready for consultation"
  }
];

// Mock medical history data
const mockMedicalHistory: { [patientId: string]: MedicalHistory } = {
  "P001": {
    consultations: [
      {
        id: "CONS001",
        date: "2025-08-10",
        time: "10:30 AM",
        doctor: "Dr. Smith",
        specialty: "General Medicine",
        chiefComplaint: "Chest pain and shortness of breath",
        diagnosis: "Acute bronchitis",
        treatment: "Prescribed antibiotics and bronchodilator",
        followUpDate: "2025-08-17",
        status: "Pending Follow-up"
      },
      {
        id: "CONS002",
        date: "2025-07-15",
        time: "02:00 PM",
        doctor: "Dr. Johnson",
        specialty: "Cardiology",
        chiefComplaint: "Chest pain during exercise",
        diagnosis: "Exercise-induced angina",
        treatment: "Lifestyle modification, medication adjustment",
        status: "Completed"
      },
      {
        id: "CONS003",
        date: "2025-06-20",
        time: "09:15 AM",
        doctor: "Dr. Williams",
        specialty: "General Medicine",
        chiefComplaint: "Annual physical examination",
        diagnosis: "Hypertension, well controlled",
        treatment: "Continue current medication",
        followUpDate: "2026-06-20",
        status: "Completed"
      }
    ],
    medications: [
      {
        id: "MED001",
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2025-01-15",
        prescribedBy: "Dr. Williams",
        status: "Active",
        notes: "For hypertension control"
      },
      {
        id: "MED002",
        medication: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        startDate: "2025-08-10",
        endDate: "2025-08-17",
        prescribedBy: "Dr. Smith",
        status: "Active",
        notes: "For bronchitis treatment"
      }
    ],
    allergies: [
      {
        id: "ALL001",
        allergen: "Penicillin",
        reaction: "Skin rash, itching",
        severity: "Moderate",
        dateRecorded: "2024-03-10",
        notes: "Developed rash after taking penicillin for throat infection"
      }
    ],
    vitals: [
      {
        id: "VIT001",
        date: "2025-08-15",
        time: "08:30 AM",
        bloodPressure: "130/85",
        heartRate: 78,
        temperature: 98.6,
        weight: 180,
        height: 70,
        bmi: 25.8,
        recordedBy: "Nurse Johnson"
      },
      {
        id: "VIT002",
        date: "2025-08-10",
        time: "10:30 AM",
        bloodPressure: "135/88",
        heartRate: 82,
        temperature: 99.2,
        weight: 182,
        recordedBy: "Nurse Smith"
      }
    ],
    labResults: [
      {
        id: "LAB001",
        testName: "Complete Blood Count",
        result: "WBC: 8.5, RBC: 4.2, Hemoglobin: 14.1",
        normalRange: "WBC: 4.0-11.0, RBC: 4.0-5.5, Hgb: 12.0-15.5",
        status: "Normal",
        date: "2025-08-05",
        orderedBy: "Dr. Smith"
      },
      {
        id: "LAB002",
        testName: "Lipid Panel",
        result: "Total Cholesterol: 220, HDL: 45, LDL: 140",
        normalRange: "Total: <200, HDL: >40, LDL: <130",
        status: "Abnormal",
        date: "2025-07-01",
        orderedBy: "Dr. Williams",
        notes: "Elevated LDL cholesterol"
      }
    ],
    immunizations: [
      {
        id: "IMM001",
        vaccine: "COVID-19 Booster",
        date: "2025-01-15",
        dose: "0.3mL",
        administeredBy: "Nurse Davis",
        batchNumber: "ABC123",
        reactions: "None reported"
      },
      {
        id: "IMM002",
        vaccine: "Influenza",
        date: "2024-10-01",
        dose: "0.5mL",
        administeredBy: "Nurse Wilson",
        nextDueDate: "2025-10-01",
        reactions: "Mild soreness at injection site"
      }
    ]
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });
};

export default function ConsultationPoolQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState("consultations");
  const itemsPerPage = 5;

  // Sort queue by priority (High > Medium > Low) and then by wait time
  const [queue, setQueue] = useState<QueueItem[]>(
    [...queueMock].sort((a, b) => {
      const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by wait time (longer wait first)
      const aWaitMinutes = parseInt(a.waitTime.split(' ')[0]);
      const bWaitMinutes = parseInt(b.waitTime.split(' ')[0]);
      return bWaitMinutes - aWaitMinutes;
    })
  );

  // Handle assignment actions
  const handleAssignToMe = (queueId: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, assignedTo: "Dr. Current User", assignmentStatus: "Assigned" as AssignmentStatus }
          : item
      )
    );
  };

  const handleStartConsultation = (queueId: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, assignmentStatus: "In Progress" as AssignmentStatus }
          : item
      )
    );
  };

  // Get badge colors
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Assigned": return "bg-green-100 text-green-800 border-green-200";
      case "Unassigned": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filters
  const filteredQueue = queue.filter((item) => {
    const matchesSearch = item.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      item.complaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || item.assignmentStatus === statusFilter;
    const matchesDate = !dateFilter || item.queueDate === dateFilter;
    return matchesSearch && matchesPriority && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredQueue.length / itemsPerPage);
  const paginatedQueue = filteredQueue.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary statistics
  const stats = {
    total: queue.length,
    highPriority: queue.filter(item => item.priority === "High").length,
    unassigned: queue.filter(item => item.assignmentStatus === "Unassigned").length,
    inProgress: queue.filter(item => item.assignmentStatus === "In Progress").length,
    assigned: queue.filter(item => item.assignmentStatus === "Assigned").length,
    fromNurse: queue.filter(item => item.sentFromNurse).length,
    vitalsCompleted: queue.filter(item => item.vitalsRecorded).length,
    avgWaitTime: Math.round(
      queue.reduce((sum, item) => sum + parseInt(item.waitTime.split(' ')[0]), 0) / queue.length
    )
  };

  // Get medical history for selected patient
  const selectedPatientHistory = selectedPatientId ? mockMedicalHistory[selectedPatientId] : null;

  // Patient History Modal Component
  const PatientHistoryModal = () => {
    if (!selectedPatientId || !selectedPatientHistory) return null;

    const patient = queue.find(q => q.patientId === selectedPatientId);
    if (!patient) return null;

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Active": case "Normal": case "Completed": 
          return "bg-green-100 text-green-800 border-green-200";
        case "Pending Follow-up": case "Abnormal": 
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Critical": case "Severe": 
          return "bg-red-100 text-red-800 border-red-200";
        default: 
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const tabButtons = [
      { id: "consultations", label: "Consultations", icon: Stethoscope },
      { id: "medications", label: "Medications", icon: Pill },
      { id: "allergies", label: "Allergies", icon: AlertTriangle },
      { id: "vitals", label: "Vital Signs", icon: Heart },
      { id: "labs", label: "Lab Results", icon: TestTube },
      { id: "immunizations", label: "Immunizations", icon: Shield }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">{patient.patientName} - Medical History</h2>
              <p className="text-gray-600">Patient ID: {patient.patientId} | Age: {patient.age} | Gender: {patient.gender}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPatientId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex border-b">
            {tabButtons.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveHistoryTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeHistoryTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeHistoryTab === "consultations" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Consultation History</h3>
                {selectedPatientHistory.consultations.map((consultation) => (
                  <Card key={consultation.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{consultation.specialty}</CardTitle>
                          <CardDescription>
                            {formatDate(consultation.date)} at {consultation.time} | Dr. {consultation.doctor}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(consultation.status)} variant="outline">
                          {consultation.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><strong>Chief Complaint:</strong> {consultation.chiefComplaint}</div>
                        <div><strong>Diagnosis:</strong> {consultation.diagnosis}</div>
                        <div><strong>Treatment:</strong> {consultation.treatment}</div>
                        {consultation.followUpDate && (
                          <div><strong>Follow-up:</strong> {formatDate(consultation.followUpDate)}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "medications" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Current & Past Medications</h3>
                {selectedPatientHistory.medications.map((medication) => (
                  <Card key={medication.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{medication.medication}</CardTitle>
                          <CardDescription>
                            {medication.dosage} - {medication.frequency}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(medication.status)} variant="outline">
                          {medication.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><strong>Prescribed by:</strong> {medication.prescribedBy}</div>
                        <div><strong>Start Date:</strong> {formatDate(medication.startDate)}</div>
                        {medication.endDate && (
                          <div><strong>End Date:</strong> {formatDate(medication.endDate)}</div>
                        )}
                        {medication.notes && (
                          <div><strong>Notes:</strong> {medication.notes}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "allergies" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Known Allergies</h3>
                {selectedPatientHistory.allergies.map((allergy) => (
                  <Card key={allergy.id} className="border-l-4 border-l-red-400">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base text-red-700">{allergy.allergen}</CardTitle>
                        <Badge className={getStatusColor(allergy.severity)} variant="outline">
                          {allergy.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><strong>Reaction:</strong> {allergy.reaction}</div>
                        <div><strong>Date Recorded:</strong> {formatDate(allergy.dateRecorded)}</div>
                        {allergy.notes && (
                          <div><strong>Notes:</strong> {allergy.notes}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "vitals" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Vital Signs History</h3>
                {selectedPatientHistory.vitals.map((vital) => (
                  <Card key={vital.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {formatDate(vital.date)} at {vital.time}
                      </CardTitle>
                      <CardDescription>Recorded by {vital.recordedBy}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <strong>BP:</strong> {vital.bloodPressure} mmHg
                        </div>
                        <div>
                          <strong>HR:</strong> {vital.heartRate} bpm
                        </div>
                        <div>
                          <strong>Temp:</strong> {vital.temperature}°F
                        </div>
                        <div>
                          <strong>Weight:</strong> {vital.weight} lbs
                        </div>
                        {vital.height && (
                          <div>
                            <strong>Height:</strong> {vital.height}"
                          </div>
                        )}
                        {vital.bmi && (
                          <div>
                            <strong>BMI:</strong> {vital.bmi}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "labs" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Laboratory Results</h3>
                {selectedPatientHistory.labResults.map((lab) => (
                  <Card key={lab.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{lab.testName}</CardTitle>
                          <CardDescription>
                            {formatDate(lab.date)} | Ordered by {lab.orderedBy}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(lab.status)} variant="outline">
                          {lab.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><strong>Result:</strong> {lab.result}</div>
                        <div><strong>Normal Range:</strong> {lab.normalRange}</div>
                        {lab.notes && (
                          <div><strong>Notes:</strong> {lab.notes}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "immunizations" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Immunization History</h3>
                {selectedPatientHistory.immunizations.map((immunization) => (
                  <Card key={immunization.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{immunization.vaccine}</CardTitle>
                      <CardDescription>
                        {formatDate(immunization.date)} | {immunization.dose}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><strong>Administered by:</strong> {immunization.administeredBy}</div>
                        {immunization.batchNumber && (
                          <div><strong>Batch Number:</strong> {immunization.batchNumber}</div>
                        )}
                        {immunization.nextDueDate && (
                          <div><strong>Next Due:</strong> {formatDate(immunization.nextDueDate)}</div>
                        )}
                        {immunization.reactions && (
                          <div><strong>Reactions:</strong> {immunization.reactions}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Consultation Pool Queue</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.highPriority} high priority</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">From Nursing</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.fromNurse}</div>
            <p className="text-xs text-muted-foreground">Vitals completed</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.unassigned}</div>
            <p className="text-xs text-muted-foreground">Need assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.assigned}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently consulting</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">Across all priorities</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search Queue</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient or complaint"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Priority Filter</Label>
            <Select 
              value={priorityFilter} 
              onValueChange={(value: Priority | "All") => {
                setPriorityFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="High">High Priority</SelectItem>
                <SelectItem value="Medium">Medium Priority</SelectItem>
                <SelectItem value="Low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Assignment Status</Label>
            <Select 
              value={statusFilter} 
              onValueChange={(value: AssignmentStatus | "All") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-filter">Date Filter</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedQueue.length} of {filteredQueue.length} patients in queue
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {paginatedQueue.length > 0 ? (
          paginatedQueue.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span>{item.patientName}</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        Queue ID: {item.id}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-orange-600 font-medium">
                          Waiting: {item.waitTime}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span><strong>Location:</strong> {item.location}</span>
                          <span><strong>Gender:</strong> {item.gender}</span>
                          <span><strong>Age:</strong> {item.age} yrs</span>
                          <span><strong>Category:</strong> {item.employeeCategory}</span>
                          {item.consultationRoom && (
                            <span className="text-blue-600 font-medium">
                              <strong>Room:</strong> {item.consultationRoom}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>Phone:</strong> {item.phoneNumber}
                        </div>
                        <div>
                          <strong>Chief Complaint:</strong> {item.complaint}
                        </div>
                        {item.sentFromNurse && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 text-xs font-medium">
                              From Nursing - {item.vitalsRecorded ? 'Vitals Completed' : 'Direct Transfer'}
                            </span>
                          </div>
                        )}
                        {item.nurseNotes && (
                          <div className="text-xs text-gray-600">
                            <strong>Nurse Notes:</strong> {item.nurseNotes}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={getPriorityColor(item.priority)} variant="outline">
                      {item.priority}
                    </Badge>
                    <Badge className={getStatusColor(item.assignmentStatus)} variant="outline">
                      {item.assignmentStatus}
                    </Badge>
                    {item.sentFromNurse && (
                      <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                        From Nurse
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" className="hover:bg-blue-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-green-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm text-muted-foreground mb-4">
                  <div>
                    <strong className="text-foreground">Clinic:</strong>
                    <div>{item.clinic}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Date:</strong>
                    <div>{formatDate(item.queueDate)}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Queue Time:</strong>
                    <div>{item.queueTime}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Visit Type:</strong>
                    <div>{item.visitType}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Assigned to:</strong>
                    <div>{item.assignedTo}</div>
                  </div>
                  {item.consultationRoom && (
                    <div>
                      <strong className="text-foreground">Room:</strong>
                      <div className="text-blue-600 font-medium">{item.consultationRoom}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  {item.assignmentStatus === "Unassigned" && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignToMe(item.id)}
                      className="hover:bg-blue-600"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Assign to Me
                    </Button>
                  )}
                  {item.assignmentStatus === "Assigned" && (
                    <Button 
                      size="sm"
                      onClick={() => handleStartConsultation(item.id)}
                      className="hover:bg-green-600"
                    >
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Start Consultation
                      {item.consultationRoom && <span className="ml-1">({item.consultationRoom})</span>}
                    </Button>
                  )}
                  {item.assignmentStatus === "In Progress" && (
                    <Button size="sm" variant="outline" disabled>
                      <ArrowRight className="h-4 w-4 mr-1" />
                      In Progress {item.consultationRoom && `(${item.consultationRoom})`}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-blue-50"
                    onClick={() => setSelectedPatientId(item.patientId)}
                  >
                    View Patient History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-1">No patients in queue</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatientId && <PatientHistoryModal />}
    </div>
  );
}