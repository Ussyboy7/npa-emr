"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Search, Eye, Edit, Clock, Calendar, Users, Pill, User, ArrowRight, UserCheck, X, FileText, Activity, Heart, AlertTriangle, TestTube, Shield, Package, CheckCircle, AlertCircle, Stethoscope, Phone, MapPin, RefreshCw, Plus, Minus } from "lucide-react";

type Priority = "High" | "Medium" | "Normal";
type PharmacyStatus = "Pending" | "Processing" | "Ready" | "Partially Dispensed" | "Dispensed" | "On Hold";
type PrescriptionStatus = "Pending" | "Available" | "Out of Stock" | "Dispensed" | "Substituted";

interface PrescriptionItem {
  id: string;
  medication: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  genericAvailable: boolean;
  inStock: boolean;
  stockLevel?: number;
  status: PrescriptionStatus;
  substitutedWith?: {
    medication: string;
    strength: string;
    reason: string;
    approvedBy: string;
  };
  dispensedQuantity?: number;
  dispensedDate?: string;
  dispensedBy?: string;
}

interface PharmacyQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  priority: Priority;
  waitTime: string;
  prescribedBy: string;
  assignedTo: string;
  status: PharmacyStatus;
  orderTime: string;
  orderDate: string;
  estimatedCompletionTime: string;
  age: number;
  gender: string;
  phoneNumber: string;
  employeeCategory: string;
  location?: string;
  prescriptions: PrescriptionItem[];
  allergies: string[];
  specialInstructions?: string;
  consultationRoom?: string;
  sentFromConsultation?: boolean;
  pharmacistNotes?: string;
  lastDispensedDate?: string;
}

interface PrescriptionHistory {
  dispensedMedications: DispensedMedication[];
  interactions: DrugInteraction[];
  adherenceRecords: AdherenceRecord[];
}

interface DispensedMedication {
  id: string;
  medication: string;
  strength: string;
  quantity: number;
  dispensedDate: string;
  dispensedBy: string;
  prescribedBy: string;
  refillsRemaining: number;
  nextRefillDate?: string;
  adherenceScore?: number;
}

interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  interactionType: "Major" | "Moderate" | "Minor";
  description: string;
  recommendation: string;
  dateIdentified: string;
}

interface AdherenceRecord {
  id: string;
  medication: string;
  period: string;
  adherencePercentage: number;
  missedDoses: number;
  notes?: string;
}

// Mock pharmacy queue data
const pharmacyQueueMock: PharmacyQueueItem[] = [
  {
    id: "RX001",
    patientId: "P001",
    patientName: "John Doe",
    priority: "High",
    waitTime: "35 min",
    prescribedBy: "Dr. Smith",
    assignedTo: "Pharm. Johnson",
    status: "Processing",
    orderTime: "08:30 AM",
    orderDate: "2025-08-15",
    estimatedCompletionTime: "09:15 AM",
    age: 45,
    gender: "Male",
    phoneNumber: "123-456-7890",
    employeeCategory: "Employee",
    location: "Headquarters",
    allergies: ["Penicillin", "Sulfa"],
    prescriptions: [
      {
        id: "PRES001",
        medication: "Amoxicillin",
        strength: "500mg",
        dosage: "1 tablet",
        frequency: "Three times daily",
        duration: "7 days",
        quantity: 21,
        instructions: "Take with food",
        genericAvailable: true,
        inStock: true,
        stockLevel: 150,
        status: "Available"
      },
      {
        id: "PRES002",
        medication: "Paracetamol",
        strength: "500mg",
        dosage: "1-2 tablets",
        frequency: "Every 4-6 hours as needed",
        duration: "As needed",
        quantity: 30,
        instructions: "Do not exceed 8 tablets in 24 hours",
        genericAvailable: true,
        inStock: true,
        stockLevel: 200,
        status: "Available"
      },
      {
        id: "PRES003",
        medication: "Cough Syrup",
        strength: "100ml",
        dosage: "10ml",
        frequency: "Three times daily",
        duration: "5 days",
        quantity: 1,
        instructions: "Shake well before use",
        genericAvailable: false,
        inStock: false,
        stockLevel: 0,
        status: "Out of Stock"
      }
    ],
    consultationRoom: "Room 1",
    sentFromConsultation: true,
    specialInstructions: "Patient has difficulty swallowing large tablets"
  },
  {
    id: "RX002",
    patientId: "P002",
    patientName: "Jane Smith",
    priority: "Medium",
    waitTime: "22 min",
    prescribedBy: "Dr. Wilson",
    assignedTo: "Unassigned",
    status: "Pending",
    orderTime: "09:15 AM",
    orderDate: "2025-08-15",
    estimatedCompletionTime: "09:45 AM",
    age: 34,
    gender: "Female",
    phoneNumber: "987-654-3210",
    employeeCategory: "Employee",
    location: "Branch Office",
    allergies: [],
    prescriptions: [
      {
        id: "PRES004",
        medication: "Ibuprofen",
        strength: "400mg",
        dosage: "1 tablet",
        frequency: "Three times daily",
        duration: "5 days",
        quantity: 15,
        instructions: "Take with food to prevent stomach upset",
        genericAvailable: true,
        inStock: true,
        stockLevel: 75,
        status: "Available"
      },
      {
        id: "PRES005",
        medication: "Vitamin D3",
        strength: "1000 IU",
        dosage: "1 capsule",
        frequency: "Once daily",
        duration: "30 days",
        quantity: 30,
        instructions: "Take with largest meal of the day",
        genericAvailable: false,
        inStock: false,
        stockLevel: 0,
        status: "Out of Stock"
      }
    ],
    sentFromConsultation: true
  },
  {
    id: "RX003",
    patientId: "P003",
    patientName: "Robert Johnson",
    priority: "Normal",
    waitTime: "15 min",
    prescribedBy: "Dr. Davis",
    assignedTo: "Pharm. Williams",
    status: "Partially Dispensed",
    orderTime: "10:00 AM",
    orderDate: "2025-08-15",
    estimatedCompletionTime: "10:30 AM",
    age: 58,
    gender: "Male",
    phoneNumber: "555-123-4567",
    employeeCategory: "Retiree",
    location: "Remote",
    allergies: ["Aspirin"],
    prescriptions: [
      {
        id: "PRES006",
        medication: "Lisinopril",
        strength: "10mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
        quantity: 30,
        instructions: "Take at the same time each day",
        genericAvailable: true,
        inStock: true,
        stockLevel: 120,
        status: "Dispensed",
        dispensedQuantity: 30,
        dispensedDate: "2025-08-15",
        dispensedBy: "Pharm. Williams"
      },
      {
        id: "PRES007",
        medication: "Metformin",
        strength: "500mg",
        dosage: "1 tablet",
        frequency: "Twice daily",
        duration: "30 days",
        quantity: 60,
        instructions: "Take with meals",
        genericAvailable: true,
        inStock: true,
        stockLevel: 180,
        status: "Available"
      },
      {
        id: "PRES008",
        medication: "Aspirin",
        strength: "75mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
        quantity: 30,
        instructions: "Take with food",
        genericAvailable: true,
        inStock: false,
        stockLevel: 0,
        status: "Out of Stock"
      }
    ],
    lastDispensedDate: "2025-07-15",
    pharmacistNotes: "Lisinopril dispensed, waiting for Aspirin stock"
  },
  {
    id: "RX004",
    patientId: "P004",
    patientName: "Sarah Wilson",
    priority: "High",
    waitTime: "8 min",
    prescribedBy: "Dr. Brown",
    assignedTo: "Pharm. Johnson",
    status: "Ready",
    orderTime: "10:30 AM",
    orderDate: "2025-08-15",
    estimatedCompletionTime: "11:00 AM",
    age: 52,
    gender: "Female",
    phoneNumber: "444-987-6543",
    employeeCategory: "Employee",
    location: "Headquarters",
    allergies: ["Codeine", "Latex"],
    prescriptions: [
      {
        id: "PRES009",
        medication: "Albuterol Inhaler",
        strength: "90 mcg",
        dosage: "2 puffs",
        frequency: "Every 4-6 hours as needed",
        duration: "As needed",
        quantity: 1,
        instructions: "Shake well before use. Rinse mouth after use",
        genericAvailable: false,
        inStock: true,
        stockLevel: 25,
        status: "Available"
      },
      {
        id: "PRES010",
        medication: "Prednisone",
        strength: "10mg",
        dosage: "2 tablets",
        frequency: "Once daily with food",
        duration: "5 days",
        quantity: 10,
        instructions: "Take in the morning. Do not stop abruptly",
        genericAvailable: true,
        inStock: true,
        stockLevel: 100,
        status: "Available"
      }
    ],
    consultationRoom: "Room 4",
    sentFromConsultation: true,
    specialInstructions: "Patient experiencing acute asthma exacerbation"
  }
];

// Mock prescription history data
const mockPrescriptionHistory: { [patientId: string]: PrescriptionHistory } = {
  "P001": {
    dispensedMedications: [
      {
        id: "DISP001",
        medication: "Lisinopril 10mg",
        strength: "10mg",
        quantity: 30,
        dispensedDate: "2025-07-15",
        dispensedBy: "Pharm. Johnson",
        prescribedBy: "Dr. Smith",
        refillsRemaining: 2,
        nextRefillDate: "2025-08-15",
        adherenceScore: 95
      },
      {
        id: "DISP002",
        medication: "Metformin 500mg",
        strength: "500mg",
        quantity: 60,
        dispensedDate: "2025-07-01",
        dispensedBy: "Pharm. Williams",
        prescribedBy: "Dr. Smith",
        refillsRemaining: 1,
        adherenceScore: 88
      }
    ],
    interactions: [
      {
        id: "INT001",
        drug1: "Lisinopril",
        drug2: "Potassium supplements",
        interactionType: "Moderate",
        description: "May increase potassium levels",
        recommendation: "Monitor potassium levels regularly",
        dateIdentified: "2025-07-15"
      }
    ],
    adherenceRecords: [
      {
        id: "ADH001",
        medication: "Lisinopril",
        period: "July 2025",
        adherencePercentage: 95,
        missedDoses: 2,
        notes: "Generally compliant, missed weekend doses"
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

export default function PharmacyPoolQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [statusFilter, setStatusFilter] = useState<PharmacyStatus | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState("dispensed");
  const [showSubstituteModal, setShowSubstituteModal] = useState<string | null>(null);
  const [substituteForm, setSubstituteForm] = useState({
    medication: "",
    strength: "",
    reason: ""
  });
  const itemsPerPage = 5;

  // Sort queue by priority (High > Medium > Normal) and then by wait time
  const [queue, setQueue] = useState<PharmacyQueueItem[]>(
    [...pharmacyQueueMock].sort((a, b) => {
      const priorityOrder = { "High": 3, "Medium": 2, "Normal": 1 };
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

  // Handle pharmacy actions
  const handleAssignToMe = (queueId: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, assignedTo: "Pharm. Current User", status: "Processing" as PharmacyStatus }
          : item
      )
    );
  };

  const handleMarkReady = (queueId: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, status: "Ready" as PharmacyStatus }
          : item
      )
    );
  };

  const handleDispensePrescription = (queueId: string, prescriptionId: string, quantity?: number) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === queueId) {
          const updatedPrescriptions = item.prescriptions.map((prescription) => {
            if (prescription.id === prescriptionId) {
              return {
                ...prescription,
                status: "Dispensed" as PrescriptionStatus,
                dispensedQuantity: quantity || prescription.quantity,
                dispensedDate: new Date().toISOString().split('T')[0],
                dispensedBy: "Pharm. Current User"
              };
            }
            return prescription;
          });

          // Check if all prescriptions are dispensed
          const allDispensed = updatedPrescriptions.every(p => 
            p.status === "Dispensed" || p.status === "Out of Stock"
          );
          
          // Check if any are dispensed but not all
          const anyDispensed = updatedPrescriptions.some(p => p.status === "Dispensed");

          let newStatus: PharmacyStatus = item.status;
          if (allDispensed) {
            newStatus = "Dispensed";
          } else if (anyDispensed) {
            newStatus = "Partially Dispensed";
          }

          return {
            ...item,
            prescriptions: updatedPrescriptions,
            status: newStatus
          };
        }
        return item;
      })
    );
  };

  const handleSubstituteDrug = (queueId: string, prescriptionId: string) => {
    if (!substituteForm.medication || !substituteForm.strength || !substituteForm.reason) {
      alert("Please fill in all substitute fields");
      return;
    }

    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === queueId) {
          const updatedPrescriptions = item.prescriptions.map((prescription) => {
            if (prescription.id === prescriptionId) {
              return {
                ...prescription,
                status: "Substituted" as PrescriptionStatus,
                substitutedWith: {
                  medication: substituteForm.medication,
                  strength: substituteForm.strength,
                  reason: substituteForm.reason,
                  approvedBy: "Pharm. Current User"
                }
              };
            }
            return prescription;
          });

          return {
            ...item,
            prescriptions: updatedPrescriptions
          };
        }
        return item;
      })
    );

    setShowSubstituteModal(null);
    setSubstituteForm({ medication: "", strength: "", reason: "" });
  };

  const handleHold = (queueId: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, status: "On Hold" as PharmacyStatus }
          : item
      )
    );
  };

  // Get badge colors
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Normal": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: PharmacyStatus) => {
    switch (status) {
      case "Processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready": return "bg-green-100 text-green-800 border-green-200";
      case "Pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Dispensed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Partially Dispensed": return "bg-orange-100 text-orange-800 border-orange-200";
      case "On Hold": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPrescriptionStatusColor = (status: PrescriptionStatus) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800 border-green-200";
      case "Pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Dispensed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border-red-200";
      case "Substituted": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filters
  const filteredQueue = queue.filter((item) => {
    const matchesSearch = item.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      item.prescriptions.some(p => p.medication.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesDate = !dateFilter || item.orderDate === dateFilter;
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
    pending: queue.filter(item => item.status === "Pending").length,
    processing: queue.filter(item => item.status === "Processing").length,
    ready: queue.filter(item => item.status === "Ready").length,
    onHold: queue.filter(item => item.status === "On Hold").length,
    partiallyDispensed: queue.filter(item => item.status === "Partially Dispensed").length,
    fromConsultation: queue.filter(item => item.sentFromConsultation).length,
    avgWaitTime: Math.round(
      queue.reduce((sum, item) => sum + parseInt(item.waitTime.split(' ')[0]), 0) / queue.length
    )
  };

  // Get prescription history for selected patient
  const selectedPatientHistory = selectedPatientId ? mockPrescriptionHistory[selectedPatientId] : null;

  // Substitute Drug Modal Component
  const SubstituteModal = () => {
    if (!showSubstituteModal) return null;

    const [queueId, prescriptionId] = showSubstituteModal.split('|');
    const item = queue.find(q => q.id === queueId);
    const prescription = item?.prescriptions.find(p => p.id === prescriptionId);

    if (!prescription) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Substitute Medication</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubstituteModal(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">Original Prescription:</h4>
              <p>{prescription.medication} {prescription.strength}</p>
              <p className="text-sm text-gray-600">{prescription.dosage} {prescription.frequency}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="substitute-medication">Substitute Medication</Label>
                <Input
                  id="substitute-medication"
                  value={substituteForm.medication}
                  onChange={(e) => setSubstituteForm(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder="Enter substitute medication name"
                />
              </div>

              <div>
                <Label htmlFor="substitute-strength">Strength</Label>
                <Input
                  id="substitute-strength"
                  value={substituteForm.strength}
                  onChange={(e) => setSubstituteForm(prev => ({ ...prev, strength: e.target.value }))}
                  placeholder="Enter strength (e.g., 500mg)"
                />
              </div>

              <div>
                <Label htmlFor="substitute-reason">Reason for Substitution</Label>
                <Select 
                  value={substituteForm.reason}
                  onValueChange={(value) => setSubstituteForm(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Patient Preference">Patient Preference</SelectItem>
                    <SelectItem value="Generic Substitution">Generic Substitution</SelectItem>
                    <SelectItem value="Dosage Form Change">Dosage Form Change</SelectItem>
                    <SelectItem value="Allergy Concern">Allergy Concern</SelectItem>
                    <SelectItem value="Cost Consideration">Cost Consideration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleSubstituteDrug(queueId, prescriptionId)}
                className="flex-1"
              >
                Confirm Substitution
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSubstituteModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Patient History Modal Component
  const PatientHistoryModal = () => {
    if (!selectedPatientId || !selectedPatientHistory) return null;

    const patient = queue.find(q => q.patientId === selectedPatientId);
    if (!patient) return null;

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Normal": case "Minor": 
          return "bg-green-100 text-green-800 border-green-200";
        case "Moderate": 
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Major": 
          return "bg-red-100 text-red-800 border-red-200";
        default: 
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const tabButtons = [
      { id: "dispensed", label: "Dispensed Medications", icon: Pill },
      { id: "interactions", label: "Drug Interactions", icon: AlertTriangle },
      { id: "adherence", label: "Adherence Records", icon: Activity }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">{patient.patientName} - Prescription History</h2>
              <p className="text-gray-600">Patient ID: {patient.patientId} | Age: {patient.age} | Gender: {patient.gender}</p>
              {patient.allergies.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">
                    Allergies: {patient.allergies.join(", ")}
                  </span>
                </div>
              )}
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
            {activeHistoryTab === "dispensed" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Recently Dispensed Medications</h3>
                {selectedPatientHistory.dispensedMedications.map((medication) => (
                  <Card key={medication.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{medication.medication}</CardTitle>
                          <CardDescription>
                            Dispensed on {formatDate(medication.dispensedDate)} by {medication.dispensedBy}
                          </CardDescription>
                        </div>
                        {medication.adherenceScore && (
                          <Badge className={medication.adherenceScore >= 90 ? "bg-green-100 text-green-800" : medication.adherenceScore >= 80 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"} variant="outline">
                            {medication.adherenceScore}% Adherence
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><strong>Quantity:</strong> {medication.quantity}</div>
                        <div><strong>Refills Left:</strong> {medication.refillsRemaining}</div>
                        <div><strong>Prescribed by:</strong> {medication.prescribedBy}</div>
                        {medication.nextRefillDate && (
                          <div className="col-span-2"><strong>Next Refill:</strong> {formatDate(medication.nextRefillDate)}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "interactions" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Drug Interactions</h3>
                {selectedPatientHistory.interactions.map((interaction) => (
                  <Card key={interaction.id} className="border-l-4 border-l-yellow-400">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{interaction.drug1} + {interaction.drug2}</CardTitle>
                        <Badge className={getStatusColor(interaction.interactionType)} variant="outline">
                          {interaction.interactionType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><strong>Description:</strong> {interaction.description}</div>
                        <div><strong>Recommendation:</strong> {interaction.recommendation}</div>
                        <div><strong>Identified:</strong> {formatDate(interaction.dateIdentified)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeHistoryTab === "adherence" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Medication Adherence</h3>
                {selectedPatientHistory.adherenceRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{record.medication}</CardTitle>
                      <CardDescription>Period: {record.period}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div><strong>Adherence:</strong> {record.adherencePercentage}%</div>
                          <div><strong>Missed Doses:</strong> {record.missedDoses}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${record.adherencePercentage >= 90 ? 'bg-green-500' : record.adherencePercentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${record.adherencePercentage}%` }}
                          ></div>
                        </div>
                        {record.notes && (
                          <div><strong>Notes:</strong> {record.notes}</div>
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
        <h1 className="text-3xl font-bold">Pharmacy Pool Queue</h1>
        <Button>Add Prescription</Button>
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
            <CardTitle className="text-sm font-medium">Ready to Dispense</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">Prepared orders</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Partial Dispense</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.partiallyDispensed}</div>
            <p className="text-xs text-muted-foreground">Partially completed</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.onHold}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">Processing time</p>
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
                placeholder="Search by patient or medication"
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
                <SelectItem value="Normal">Normal Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status Filter</Label>
            <Select 
              value={statusFilter} 
              onValueChange={(value: PharmacyStatus | "All") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Partially Dispensed">Partially Dispensed</SelectItem>
                <SelectItem value="Dispensed">Dispensed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
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
        Showing {paginatedQueue.length} of {filteredQueue.length} prescriptions in queue
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
                        RX ID: {item.id}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-orange-600 font-medium">
                          Waiting: {item.waitTime}
                        </span>
                        <span className="text-blue-600">
                          • Est. Complete: {item.estimatedCompletionTime}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span><strong>Location:</strong> {item.location}</span>
                          <span><strong>Gender:</strong> {item.gender}</span>
                          <span><strong>Age:</strong> {item.age} yrs</span>
                          <span><strong>Category:</strong> {item.employeeCategory}</span>
                          <span><strong>Phone:</strong> {item.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span><strong>Prescribed by:</strong> {item.prescribedBy}</span>
                        </div>
                        {item.sentFromConsultation && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 text-xs font-medium">
                              From Consultation {item.consultationRoom && `(${item.consultationRoom})`}
                            </span>
                          </div>
                        )}
                        {item.allergies.length > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span className="text-red-600 text-xs font-medium">
                              Allergies: {item.allergies.join(", ")}
                            </span>
                          </div>
                        )}
                        {item.specialInstructions && (
                          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                            <strong>Special Instructions:</strong> {item.specialInstructions}
                          </div>
                        )}
                        {item.pharmacistNotes && (
                          <div className="text-xs text-gray-600">
                            <strong>Pharmacist Notes:</strong> {item.pharmacistNotes}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={getPriorityColor(item.priority)} variant="outline">
                      {item.priority}
                    </Badge>
                    <Badge className={getStatusColor(item.status)} variant="outline">
                      {item.status}
                    </Badge>
                    {item.sentFromConsultation && (
                      <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                        From Consult
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Prescription Details */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Prescriptions:</h4>
                  <div className="space-y-2">
                    {item.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="bg-gray-50 p-3 rounded text-sm border-l-4 border-l-gray-300">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {prescription.substitutedWith ? (
                                <div>
                                  <span className="line-through text-gray-500">
                                    {prescription.medication} {prescription.strength}
                                  </span>
                                  <ArrowRight className="inline h-3 w-3 mx-1" />
                                  <span className="text-blue-600">
                                    {prescription.substitutedWith.medication} {prescription.substitutedWith.strength}
                                  </span>
                                </div>
                              ) : (
                                <span>{prescription.medication} {prescription.strength}</span>
                              )}
                              <Badge className={getPrescriptionStatusColor(prescription.status)} variant="outline">
                                {prescription.status}
                              </Badge>
                              {prescription.genericAvailable && prescription.status !== "Substituted" && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs" variant="outline">
                                  Generic Available
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Dosage:</strong> {prescription.dosage} {prescription.frequency}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Duration:</strong> {prescription.duration} | <strong>Quantity:</strong> {prescription.quantity}
                              {prescription.dispensedQuantity && (
                                <span className="text-green-600 ml-2">
                                  (Dispensed: {prescription.dispensedQuantity})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Instructions:</strong> {prescription.instructions}
                            </div>
                            {prescription.stockLevel !== undefined && (
                              <div className="text-xs text-gray-600">
                                <strong>Stock Level:</strong> {prescription.stockLevel} units
                                {prescription.stockLevel < 10 && prescription.stockLevel > 0 && (
                                  <span className="text-orange-600 ml-1">(Low Stock)</span>
                                )}
                              </div>
                            )}
                            {prescription.substitutedWith && (
                              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                                <strong>Substitution Reason:</strong> {prescription.substitutedWith.reason}<br/>
                                <strong>Approved by:</strong> {prescription.substitutedWith.approvedBy}
                              </div>
                            )}
                            {prescription.dispensedBy && (
                              <div className="text-xs text-green-600">
                                <strong>Dispensed by:</strong> {prescription.dispensedBy} on {prescription.dispensedDate}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            {prescription.status === "Available" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDispensePrescription(item.id, prescription.id)}
                                  className="text-xs px-2 py-1 h-auto"
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  Dispense
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowSubstituteModal(`${item.id}|${prescription.id}`)}
                                  className="text-xs px-2 py-1 h-auto"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Substitute
                                </Button>
                              </>
                            )}
                            {prescription.status === "Out of Stock" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowSubstituteModal(`${item.id}|${prescription.id}`)}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Substitute
                              </Button>
                            )}
                            {prescription.status === "Substituted" && prescription.inStock && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDispensePrescription(item.id, prescription.id)}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <Package className="h-3 w-3 mr-1" />
                                Dispense
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                  <div>
                    <strong className="text-foreground">Order Date:</strong>
                    <div>{formatDate(item.orderDate)}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Order Time:</strong>
                    <div>{item.orderTime}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Assigned to:</strong>
                    <div>{item.assignedTo}</div>
                  </div>
                  <div>
                    <strong className="text-foreground">Available Items:</strong>
                    <div>{item.prescriptions.filter(p => p.status === "Available" || p.status === "Substituted").length} of {item.prescriptions.length}</div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 flex-wrap gap-2">
                  {item.status === "Pending" && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignToMe(item.id)}
                      className="hover:bg-blue-600"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Assign & Process
                    </Button>
                  )}
                  {item.status === "Processing" && (
                    <Button 
                      size="sm"
                      onClick={() => handleMarkReady(item.id)}
                      className="hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Ready
                    </Button>
                  )}
                  {(item.status === "Ready" || item.status === "Partially Dispensed") && (
                    <span className="text-sm text-green-600 px-2 py-1">
                      Ready for individual dispensing
                    </span>
                  )}
                  {item.status === "Dispensed" && (
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      All Dispensed
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-red-50"
                    onClick={() => handleHold(item.id)}
                    disabled={item.status === "On Hold" || item.status === "Dispensed"}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Hold
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-blue-50"
                    onClick={() => setSelectedPatientId(item.patientId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    History
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-green-50">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
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
                <p className="text-lg font-medium mb-1">No prescriptions in queue</p>
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

      {/* Modals */}
      {showSubstituteModal && <SubstituteModal />}
      {selectedPatientId && <PatientHistoryModal />}
    </div>
  );
}