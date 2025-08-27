"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Calendar, Package, CheckCircle, Eye, Edit, RefreshCw, AlertTriangle, FileText, Clock, User, Pill, Activity, BarChart3, X, Phone, MapPin, ArrowUpDown, AlertCircle, Users, Stethoscope } from 'lucide-react';

// Enhanced dispensed records with more comprehensive data
const dispensedRecords = [
  {
    id: "DIS001",
    queueId: "RX001",
    date: "2025-08-15",
    time: "14:30",
    patientName: "John Smith",
    patientId: "P12345",
    age: 45,
    gender: "Male",
    phoneNumber: "123-456-7890",
    employeeCategory: "Employee",
    location: "Headquarters",
    prescribedBy: "Dr. Smith",
    consultationRoom: "Room 1",
    medications: [
      {
        name: "Amoxicillin 500mg",
        quantity: 30,
        originalPrescription: "Amoxicillin 500mg",
        substituted: false,
        batchNumber: "AMX2025001",
        expiryDate: "2026-12-31",
        manufacturer: "PharmaCorp"
      },
      {
        name: "Paracetamol 250mg",
        quantity: 20,
        originalPrescription: "Paracetamol 250mg",
        substituted: false,
        batchNumber: "PCM2025002",
        expiryDate: "2027-06-30",
        manufacturer: "MediGen"
      }
    ],
    pharmacist: "Sarah Johnson",
    substitutions: 0,
    status: "Completed",
    waitTime: "25 min",
    processingTime: "12 min",
    priority: "Normal",
    allergies: ["Penicillin"],
    specialInstructions: "Take with food",
    refillsRemaining: { "Amoxicillin": 0, "Paracetamol": 2 },
    nextRefillDate: "2025-09-15",
    deliveryMethod: "Pickup",
    verificationMethod: "Photo ID + Insurance Card",
    counselingProvided: true,
    counselingDuration: "5 min",
    followUpRequired: false,
    drugInteractionChecked: true,
    qualityControlChecked: true
  },
  {
    id: "DIS002", 
    queueId: "RX002",
    date: "2025-08-15",
    time: "15:15",
    patientName: "Mary Davis",
    patientId: "P12346",
    age: 62,
    gender: "Female",
    phoneNumber: "987-654-3210",
    employeeCategory: "Retiree",
    location: "Branch Office",
    prescribedBy: "Dr. Wilson",
    consultationRoom: "Room 3",
    medications: [
      {
        name: "Metformin 850mg",
        quantity: 60,
        originalPrescription: "Insulin 5ml",
        substituted: true,
        substitutionReason: "Patient preference - oral medication",
        batchNumber: "MET2025001",
        expiryDate: "2026-08-31",
        manufacturer: "DiabetesCare"
      },
      {
        name: "Glucometer Test Strips",
        quantity: 50,
        originalPrescription: "Glucometer Test Strips",
        substituted: false,
        batchNumber: "GTS2025003",
        expiryDate: "2025-12-31",
        manufacturer: "GlucoTech"
      }
    ],
    pharmacist: "Mike Wilson",
    substitutions: 1,
    status: "Completed",
    waitTime: "35 min",
    processingTime: "18 min",
    priority: "High",
    allergies: [],
    specialInstructions: "Monitor blood glucose daily",
    refillsRemaining: { "Metformin": 3, "Test Strips": 1 },
    nextRefillDate: "2025-09-15",
    deliveryMethod: "Pickup",
    verificationMethod: "Photo ID + Insurance Card",
    counselingProvided: true,
    counselingDuration: "15 min",
    followUpRequired: true,
    followUpDate: "2025-08-29",
    drugInteractionChecked: true,
    qualityControlChecked: true
  },
  {
    id: "DIS003",
    queueId: "RX003",
    date: "2025-08-15",
    time: "16:00", 
    patientName: "Robert Brown",
    patientId: "P12347",
    age: 58,
    gender: "Male",
    phoneNumber: "555-123-4567",
    employeeCategory: "Employee",
    location: "Remote",
    prescribedBy: "Dr. Davis",
    consultationRoom: "Telemedicine",
    medications: [
      {
        name: "Lisinopril 10mg",
        quantity: 30,
        originalPrescription: "Lisinopril 10mg",
        substituted: false,
        batchNumber: "LIS2025001",
        expiryDate: "2026-10-31",
        manufacturer: "CardioMed"
      }
    ],
    pharmacist: "Sarah Johnson",
    substitutions: 0,
    status: "Partial",
    waitTime: "42 min",
    processingTime: "8 min",
    priority: "Medium",
    allergies: ["Aspirin"],
    specialInstructions: "Take at same time daily",
    refillsRemaining: { "Lisinopril": 5 },
    nextRefillDate: "2025-09-15",
    deliveryMethod: "Mail Delivery",
    verificationMethod: "Digital ID Verification",
    counselingProvided: true,
    counselingDuration: "8 min",
    followUpRequired: false,
    drugInteractionChecked: true,
    qualityControlChecked: true,
    partialReason: "Aspirin 75mg out of stock",
    expectedCompletionDate: "2025-08-17"
  },
  {
    id: "DIS004",
    queueId: "RX004",
    date: "2025-08-14",
    time: "11:45",
    patientName: "Sarah Wilson",
    patientId: "P12348",
    age: 35,
    gender: "Female",
    phoneNumber: "444-987-6543",
    employeeCategory: "Employee",
    location: "Headquarters",
    prescribedBy: "Dr. Brown",
    consultationRoom: "Room 2",
    medications: [
      {
        name: "Albuterol Inhaler",
        quantity: 1,
        originalPrescription: "Albuterol Inhaler 90mcg",
        substituted: false,
        batchNumber: "ALB2025001",
        expiryDate: "2026-05-31",
        manufacturer: "RespiraCare"
      },
      {
        name: "Prednisone 10mg",
        quantity: 10,
        originalPrescription: "Prednisone 10mg",
        substituted: false,
        batchNumber: "PRD2025002",
        expiryDate: "2026-11-30",
        manufacturer: "SteroidMed"
      }
    ],
    pharmacist: "Mike Wilson",
    substitutions: 0,
    status: "Completed",
    waitTime: "15 min",
    processingTime: "10 min",
    priority: "High",
    allergies: ["Codeine", "Latex"],
    specialInstructions: "Use inhaler with spacer device",
    refillsRemaining: { "Albuterol": 2, "Prednisone": 0 },
    nextRefillDate: "2025-10-14",
    deliveryMethod: "Pickup",
    verificationMethod: "Photo ID + Insurance Card",
    counselingProvided: true,
    counselingDuration: "12 min",
    followUpRequired: true,
    followUpDate: "2025-08-21",
    drugInteractionChecked: true,
    qualityControlChecked: true
  },
  {
    id: "DIS005",
    queueId: "RX005",
    date: "2025-08-14",
    time: "09:30",
    patientName: "David Chen",
    patientId: "P12349",
    age: 28,
    gender: "Male",
    phoneNumber: "333-444-5555",
    employeeCategory: "Employee",
    location: "Branch Office",
    prescribedBy: "Dr. Lee",
    consultationRoom: "Room 1",
    medications: [
      {
        name: "Ibuprofen 400mg",
        quantity: 30,
        originalPrescription: "Ibuprofen 400mg",
        substituted: false,
        batchNumber: "IBU2025001",
        expiryDate: "2027-02-28",
        manufacturer: "PainRelief Inc"
      }
    ],
    pharmacist: "Sarah Johnson",
    substitutions: 0,
    status: "Completed",
    waitTime: "12 min",
    processingTime: "6 min",
    priority: "Normal",
    allergies: [],
    specialInstructions: "Take with food",
    refillsRemaining: { "Ibuprofen": 1 },
    nextRefillDate: "2025-09-14",
    deliveryMethod: "Pickup",
    verificationMethod: "Photo ID",
    counselingProvided: true,
    counselingDuration: "3 min",
    followUpRequired: false,
    drugInteractionChecked: true,
    qualityControlChecked: true
  }
];

export default function EnhancedDispenseHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [pharmacistFilter, setPharmacistFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [reportType, setReportType] = useState("daily");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportStatus, setReportStatus] = useState("All");
  const itemsPerPage = 10;

  // Enhanced filtering
  const filteredRecords = dispensedRecords.filter(record => {
    const matchesSearch = 
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || record.priority === priorityFilter;
    const matchesPharmacist = pharmacistFilter === "All" || record.pharmacist === pharmacistFilter;
    
    const matchesDateRange = (!dateRange.from || record.date >= dateRange.from) && 
                           (!dateRange.to || record.date <= dateRange.to);

    return matchesSearch && matchesStatus && matchesPriority && matchesPharmacist && matchesDateRange;
  });

  // Enhanced sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "date":
        comparison = new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();
        break;
      case "patient":
        comparison = a.patientName.localeCompare(b.patientName);
        break;
      case "waitTime":
        comparison = parseInt(a.waitTime) - parseInt(b.waitTime);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Enhanced statistics
  const stats = {
    total: dispensedRecords.length,
    completed: dispensedRecords.filter(r => r.status === "Completed").length,
    partial: dispensedRecords.filter(r => r.status === "Partial").length,
    substitutionRate: (dispensedRecords.filter(r => r.substitutions > 0).length / dispensedRecords.length * 100).toFixed(1),
    avgWaitTime: Math.round(dispensedRecords.reduce((sum, r) => sum + parseInt(r.waitTime), 0) / dispensedRecords.length),
    avgProcessingTime: Math.round(dispensedRecords.reduce((sum, r) => sum + parseInt(r.processingTime), 0) / dispensedRecords.length),
    highPriority: dispensedRecords.filter(r => r.priority === "High").length,
    counselingProvided: dispensedRecords.filter(r => r.counselingProvided).length,
    followUpRequired: dispensedRecords.filter(r => r.followUpRequired).length
  };

  // Get badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Partial": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Normal": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  const generateCustomReport = () => {
    // Simulate report generation
    console.log('Generating custom report', { type: reportType, startDate: reportStartDate, endDate: reportEndDate, status: reportStatus });
    alert('Custom report generated! Check console for details.');
    setShowCustomReportModal(false);
  };

  // Record Detail Modal
  const RecordDetailModal = () => {
    if (!showDetailModal || !selectedRecord) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Dispense Record Details</h2>
              <p className="text-gray-600">Record ID: {selectedRecord.id} | Queue ID: {selectedRecord.queueId}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><strong>Name:</strong> {selectedRecord.patientName}</div>
                  <div><strong>ID:</strong> {selectedRecord.patientId}</div>
                  <div><strong>Age:</strong> {selectedRecord.age}</div>
                  <div><strong>Gender:</strong> {selectedRecord.gender}</div>
                  <div><strong>Phone:</strong> {selectedRecord.phoneNumber}</div>
                  <div><strong>Category:</strong> {selectedRecord.employeeCategory}</div>
                  <div><strong>Location:</strong> {selectedRecord.location}</div>
                  <div className="col-span-2">
                    <strong>Allergies:</strong> {selectedRecord.allergies.length > 0 ? selectedRecord.allergies.join(", ") : "None"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications Dispensed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRecord.medications.map((med, index) => (
                    <div key={index} className="border rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{med.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div><strong>Quantity:</strong> {med.quantity}</div>
                        <div><strong>Batch:</strong> {med.batchNumber}</div>
                        <div><strong>Expiry:</strong> {med.expiryDate}</div>
                        <div><strong>Manufacturer:</strong> {med.manufacturer}</div>
                        {med.substituted && (
                          <>
                            <div className="col-span-2">
                              <strong>Original:</strong> {med.originalPrescription}
                            </div>
                            <div className="col-span-3">
                              <strong>Substitution Reason:</strong> {med.substitutionReason}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dispensing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Processing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Date:</strong> {formatDate(selectedRecord.date)}</div>
                  <div><strong>Time:</strong> {selectedRecord.time}</div>
                  <div><strong>Prescribed by:</strong> {selectedRecord.prescribedBy}</div>
                  <div><strong>Consultation Room:</strong> {selectedRecord.consultationRoom}</div>
                  <div><strong>Pharmacist:</strong> {selectedRecord.pharmacist}</div>
                  <div><strong>Wait Time:</strong> {selectedRecord.waitTime}</div>
                  <div><strong>Processing Time:</strong> {selectedRecord.processingTime}</div>
                  <div className="flex items-center gap-2">
                    <strong>Priority:</strong> 
                    <Badge className={getPriorityColor(selectedRecord.priority)} variant="outline">
                      {selectedRecord.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Verification & Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Verification:</strong> {selectedRecord.verificationMethod}</div>
                  <div><strong>Delivery Method:</strong> {selectedRecord.deliveryMethod}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quality & Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Counseling Provided:</strong> {selectedRecord.counselingProvided ? "Yes" : "No"}</div>
                  {selectedRecord.counselingProvided && (
                    <div><strong>Counseling Duration:</strong> {selectedRecord.counselingDuration}</div>
                  )}
                  <div><strong>Drug Interaction Check:</strong> {selectedRecord.drugInteractionChecked ? "Completed" : "Not Done"}</div>
                  <div><strong>Quality Control:</strong> {selectedRecord.qualityControlChecked ? "Passed" : "Pending"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Follow-up Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Follow-up Required:</strong> {selectedRecord.followUpRequired ? "Yes" : "No"}</div>
                  {selectedRecord.followUpDate && (
                    <div><strong>Follow-up Date:</strong> {formatDate(selectedRecord.followUpDate)}</div>
                  )}
                  <div><strong>Next Refill Date:</strong> {formatDate(selectedRecord.nextRefillDate)}</div>
                  <div><strong>Refills Remaining:</strong></div>
                  <div className="ml-4 space-y-1">
                    {Object.entries(selectedRecord.refillsRemaining).map(([med, refills]) => (
                      <div key={med} className="text-sm">{med}: {refills} refills</div>
                    ))}
                  </div>
                  {selectedRecord.specialInstructions && (
                    <div><strong>Special Instructions:</strong> {selectedRecord.specialInstructions}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            <Button onClick={() => console.log('Printing record:', selectedRecord)}>
              <FileText className="h-4 w-4 mr-2" />
              Print Record
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Custom Report Modal
  const CustomReportModal = () => {
    return (
      <Dialog open={showCustomReportModal} onOpenChange={setShowCustomReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(reportType === "custom") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="report-start">Start Date</Label>
                  <Input
                    id="report-start"
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-end">End Date</Label>
                  <Input
                    id="report-end"
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={reportStatus} onValueChange={setReportStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateCustomReport} className="w-full">
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dispense History & Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {viewMode === "table" ? "Card View" : "Table View"}
          </Button>
          <Button onClick={() => setShowCustomReportModal(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dispensed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} completed, {stats.partial} partial
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">
              Processing: {stats.avgProcessingTime} min
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Substitution Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.substitutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.highPriority} high priority
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counseling Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.counselingProvided / stats.total * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.counselingProvided} records</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-up Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.followUpRequired / stats.total * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.followUpRequired} required</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search & Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Records</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Patient, medication, or record ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority Filter</Label>
                <Select value={priorityFilter} onValueChange={(value) => {
                  setPriorityFilter(value);
                  setCurrentPage(1);
                }}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Pharmacist Filter</Label>
                <Select value={pharmacistFilter} onValueChange={(value) => {
                  setPharmacistFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by pharmacist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Pharmacists</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, from: e.target.value }));
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, to: e.target.value }));
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date & Time</SelectItem>
                      <SelectItem value="patient">Patient Name</SelectItem>
                      <SelectItem value="waitTime">Wait Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {paginatedRecords.length} of {filteredRecords.length} dispensed records
          {filteredRecords.length !== dispensedRecords.length && 
            ` (filtered from ${dispensedRecords.length} total)`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
        </div>
      </div>

      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap">
                        <div>{formatDate(record.date)}</div>
                        <div className="text-sm text-gray-500">{record.time}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-sm text-gray-500">{record.patientId}</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {record.medications.map((med, index) => (
                            <div key={index} className="text-sm">
                              {med.name} x {med.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{record.patientName}</CardTitle>
                    <CardDescription>{record.patientId}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Date:</strong> {formatDate(record.date)} {record.time}</div>
                  <div><strong>Medications:</strong></div>
                  <ul className="list-disc ml-4">
                    {record.medications.map((med, index) => (
                      <li key={index}>{med.name} x {med.quantity}</li>
                    ))}
                  </ul>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetailModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
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

      {/* Detail Modal */}
      {showDetailModal && <RecordDetailModal />}

      {/* Custom Report Modal */}
      <CustomReportModal />
    </div>
  );
}