"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import {
  Search,
  Eye,
  Edit,
  Send,
  Clock,
  Calendar,
  Users,
  Phone,
  Mail,
  X,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  StickyNote,
  UserCheck,
  UserX
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PatientOverviewModalContent from "@/components/medical-records/patientoverviewmodal";
import EditVisitModal from "@/components/medical-records/editvisitmodal";
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { useRouter } from "next/navigation"

type VisitStatus =
  | "Scheduled"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";

interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  clinic: string;
  visitTime: string;
  visitDate: string;
  waitTime: number; // in minutes
  visitType: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: VisitStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedNurse?: string;
  assignedDoctor?: string;
}

interface Patient {
  id: string;
  surname: string;
  firstName: string;
  lastName: string;
  location?: string;
  gender: string;
  age: number;
  employeeCategory: string;
  phoneNumber: string;
  email?: string;
}

// Mock patient data
const patientsMock: Patient[] = [
  {
    id: "P001",
    surname: "Doe",
    firstName: "John",
    lastName: "",
    gender: "Male",
    age: 30,
    employeeCategory: "Employee",
    location: "Headquarters",
    phoneNumber: "+234-801-234-5678",
    email: "john.doe@npa.gov.ng",
  },
  {
    id: "P002",
    surname: "Smith",
    firstName: "Jane",
    lastName: "",
    gender: "Female",
    age: 55,
    employeeCategory: "Retiree",
    location: "Bode Thomas Clinic",
    phoneNumber: "+234-802-345-6789",
    email: "jane.smith@npa.gov.ng",
  },
];

// Enhanced mock visit data
const visitsMock: Visit[] = [
  {
    id: "V001",
    patientId: "P001",
    patientName: "John Doe",
    clinic: "General",
    visitDate: "2025-08-27",
    visitTime: "09:30",
    waitTime: 15,
    visitType: "Consultation",
    priority: "Medium",
    status: "In Progress",
    createdAt: new Date("2025-08-26T10:00:00"),
    updatedAt: new Date("2025-08-27T09:45:00"),
    assignedNurse: "Nurse Johnson",
    assignedDoctor: "Dr. Williams"
  },
  {
    id: "V002",
    patientId: "P002",
    patientName: "Jane Smith",
    clinic: "Eye",
    visitDate: "2025-08-27",
    visitTime: "10:00",
    waitTime: 5,
    visitType: "Follow-up",
    priority: "Low",
    status: "Confirmed",
    createdAt: new Date("2025-08-25T14:30:00"),
    updatedAt: new Date("2025-08-27T09:55:00"),
    assignedNurse: "Nurse Davis"
  },
  {
    id: "V003",
    patientId: "P003",
    patientName: "Michael Johnson",
    clinic: "General",
    visitDate: "2025-08-27",
    visitTime: "11:15",
    waitTime: 45,
    visitType: "Emergency",
    priority: "Emergency",
    status: "Confirmed",
    createdAt: new Date("2025-08-27T08:30:00"),
    updatedAt: new Date("2025-08-27T08:30:00")
  },
  {
    id: "V004",
    patientId: "P001",
    patientName: "John Doe",
    clinic: "General",
    visitDate: "2025-08-26",
    visitTime: "08:30",
    waitTime: 0,
    visitType: "Consultation",
    priority: "Medium",
    status: "Completed",
    createdAt: new Date("2025-08-25T16:00:00"),
    updatedAt: new Date("2025-08-26T09:10:00"),
    notes: "Patient is healthy. Recommended regular exercise."
  },
  {
    id: "V005",
    patientId: "P002",
    patientName: "Jane Smith",
    clinic: "Eye",
    visitDate: "2025-08-28",
    visitTime: "14:15",
    waitTime: 0,
    visitType: "Routine Checkup",
    priority: "Low",
    status: "Scheduled",
    createdAt: new Date("2025-08-27T11:00:00"),
    updatedAt: new Date("2025-08-27T11:00:00")
  }
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const getStatusColor = (status: VisitStatus) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
    case "Confirmed":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "Rescheduled":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Scheduled":
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Emergency":
      return "bg-red-500";
    case "High":
      return "bg-orange-500";
    case "Medium":
      return "bg-yellow-500";
    case "Low":
    default:
      return "bg-green-500";
  }
};

const getWaitTimeColor = (waitTime: number) => {
  if (waitTime <= 15) return "text-green-600";
  if (waitTime <= 30) return "text-yellow-600";
  return "text-red-600";
};

export default function ManageVisit() {
  const [showEditVisitModal, setShowEditVisitModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientOverviewModal, setShowPatientOverviewModal] = useState(false);

  const [visits, setVisits] = useState<Visit[]>(visitsMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisits, setSelectedVisits] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modals
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [notes, setNotes] = useState("");

  const itemsPerPage = 5;
  const router = useRouter()

  // Status update handlers
  const updateVisitStatus = (visitId: string, newStatus: VisitStatus) => {
    setVisits(prev =>
      prev.map(v =>
        v.id === visitId
          ? { ...v, status: newStatus, updatedAt: new Date() }
          : v
      )
    );
  };

  const handleBulkStatusUpdate = (status: VisitStatus) => {
    setVisits(prev =>
      prev.map(v =>
        selectedVisits.includes(v.id)
          ? { ...v, status, updatedAt: new Date() }
          : v
      )
    );
    setSelectedVisits([]);
    setShowBulkActions(false);
  };

  const handleAddNotes = (visitId: string, newNotes: string) => {
    setVisits(prev =>
      prev.map(v =>
        v.id === visitId
          ? { ...v, notes: newNotes, updatedAt: new Date() }
          : v
      )
    );
    setShowNotesModal(false);
    setNotes("");
    setSelectedVisit(null);
  };

  const handleEditVisit = (updatedVisit: Visit) => {
    setVisits(prev =>
      prev.map(v =>
        v.id === updatedVisit.id ? { ...updatedVisit, updatedAt: new Date() } : v
      )
    );
    setShowEditVisitModal(false);
  };

  // Filters
  const filteredVisits = visits.filter((visit) => {
    const matchesSearch = visit.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      visit.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || visit.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All" || visit.priority === priorityFilter;
    const matchesDate = !dateFilter || visit.visitDate === dateFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  // Sort by visit date and time
  const sortedVisits = filteredVisits.sort((a, b) => {
    const aDateTime = new Date(`${a.visitDate} ${a.visitTime}`);
    const bDateTime = new Date(`${b.visitDate} ${b.visitTime}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });

  const totalPages = Math.ceil(sortedVisits.length / itemsPerPage);
  const paginatedVisits = sortedVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary statistics
  const stats = {
    total: visits.length,
    scheduled: visits.filter(v => v.status === "Scheduled").length,
    inProgress: visits.filter(v => ["In Progress", "Confirmed"].includes(v.status)).length,
    completed: visits.filter(v => v.status === "Completed").length,
    cancelled: visits.filter(v => ["Cancelled"].includes(v.status)).length,
    avgWaitTime: Math.round(visits.filter(v => v.waitTime > 0).reduce((sum, v) => sum + v.waitTime, 0) / visits.filter(v => v.waitTime > 0).length) || 0
  };

  const handleVisitSelection = (visitId: string, checked: boolean) => {
    if (checked) {
      setSelectedVisits(prev => [...prev, visitId]);
    } else {
      setSelectedVisits(prev => prev.filter(id => id !== visitId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVisits(paginatedVisits.map(v => v.id));
    } else {
      setSelectedVisits([]);
    }
  };

  const handleViewPatient = (patient: Patient | undefined) => {
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientOverviewModal(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Visits</h1>
        <div className="flex items-center gap-4">
          <Button
          variant="outline"
          onClick={() => router.push("/medical-records/create-visit")}
          >
            Create Visit
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgWaitTime}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded-lg bg-card">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Search & Filter
          </h2>
          {selectedVisits.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkActions(true)}
            >
              Bulk Actions ({selectedVisits.length})
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search Visits</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient name or visit ID"
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
            <Label>Status Filter</Label>
            <Select 
              value={statusFilter} 
              onValueChange={(value: VisitStatus | "All") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority Filter</Label>
            <Select 
              value={priorityFilter} 
              onValueChange={(value) => {
                setPriorityFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
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

      {/* Results Summary with bulk selection */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 flex items-center gap-4">
          <span>Showing {paginatedVisits.length} of {filteredVisits.length} visits</span>
          {paginatedVisits.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedVisits.length === paginatedVisits.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-xs">Select all on page</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Visit Cards */}
      <div className="space-y-4">
        {paginatedVisits.length > 0 ? (
          paginatedVisits.map((visit) => {
            const patient = patientsMock.find((p) => p.id === visit.patientId);
            const isSelected = selectedVisits.includes(visit.id);
            
            const canEdit = ["Scheduled", "Rescheduled", "Cancelled"].includes(visit.status);
            const canAddNotes = visit.status === "Scheduled";
            const canCancel = ["Scheduled", "Confirmed"].includes(visit.status);
            const canReschedule = ["Cancelled"].includes(visit.status);
            
            return (
              <Card 
                key={visit.id} 
                className={`hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleVisitSelection(visit.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="space-y-2">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(visit.priority)}`} />
                          <span>{visit.patientName}</span>
                          <span className="text-sm text-muted-foreground font-normal">
                            ID: {visit.id}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className={`font-medium ${getWaitTimeColor(visit.waitTime)}`}>
                                {visit.waitTime > 0 ? `Waiting: ${visit.waitTime}m` : 'No wait'}
                              </span>
                            </div>
                            <Badge className={getPriorityColor(visit.priority)} variant="secondary">
                              <div className="w-2 h-2 bg-white rounded-full mr-1" />
                              {visit.priority}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span><strong>Location:</strong> {patient?.location}</span>
                              <span><strong>Gender:</strong> {patient?.gender}</span>
                              <span><strong>Age:</strong> {patient?.age} yrs</span>
                              <span><strong>Category:</strong> {patient?.employeeCategory}</span>
                            </div>
                            <div className="text-xs">
                              <strong>Phone:</strong> {patient?.phoneNumber}
                              {patient?.email && (
                                <span className="ml-4"><strong>Email:</strong> {patient?.email}</span>
                              )}
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge className={getStatusColor(visit.status)} variant="outline">
                        {visit.status}
                      </Badge>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-1">
                        {/* View Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPatient(patient)}
                          className="hover:bg-blue-50 hover:border-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit Button - conditional */}
                        {canEdit && (
                          <Button
                            variant="outline" size="sm" className="hover:bg-green-50"
                            onClick={() => {
                              setSelectedVisit(visit);
                              setShowEditVisitModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Notes Button - conditional */}
                        {canAddNotes && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-purple-50"
                            onClick={() => {
                              setSelectedVisit(visit);
                              setNotes(visit.notes || '');
                              setShowNotesModal(true);
                            }}
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Primary Action Button */}
                      <div className="ml-2">
                        {visit.status === "Scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => updateVisitStatus(visit.id, "Confirmed")}
                            className="hover:bg-blue-600"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {visit.status === "Confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateVisitStatus(visit.id, "In Progress")}
                            className="hover:bg-purple-600"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Start Visit
                          </Button>
                        )}
                        {visit.status === "In Progress" && (
                          <Button
                            size="sm"
                            onClick={() => updateVisitStatus(visit.id, "Completed")}
                            className="hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {["Completed", "Cancelled", "Rescheduled"].includes(visit.status) && (
                          <Button size="sm" variant="outline" disabled>
                            {visit.status}
                          </Button>
                        )}
                      </div>
                      
                      {/* Secondary Actions Dropdown - conditional */}
                      { (canCancel || canReschedule) && (
                        <Select
                          onValueChange={(value) => {
                            if (value === "cancel") {
                              updateVisitStatus(visit.id, "Cancelled");
                            } else if (value === "reschedule") {
                              updateVisitStatus(visit.id, "Rescheduled");
                            } 
                          }}
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Actions" />
                          </SelectTrigger>
                          <SelectContent>
                            {canCancel && (
                              <SelectItem value="cancel">
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  Cancel Visit
                                </div>
                              </SelectItem>
                            )}
                            {canReschedule && (
                              <SelectItem value="reschedule">
                                <div className="flex items-center gap-2">
                                  <RotateCcw className="h-4 w-4" />
                                  Reschedule
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Clinic:</strong>
                      <div>{visit.clinic}</div>
                    </div>
                    <div>
                      <strong className="text-foreground">Type:</strong>
                      <div>{visit.visitType}</div>
                    </div>
                    <div>
                      <strong className="text-foreground">Date:</strong>
                      <div>{formatDate(visit.visitDate)}</div>
                    </div>
                    <div>
                      <strong className="text-foreground">Time:</strong>
                      <div>{visit.visitTime}</div>
                    </div>
                  </div>
                  
                  {visit.notes && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                      <strong>Notes:</strong> {visit.notes}
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-1">No visits found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Notes - {selectedVisit?.patientName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded text-sm">
              <div><strong>Visit ID:</strong> {selectedVisit?.id}</div>
              <div><strong>Date:</strong> {selectedVisit && formatDate(selectedVisit.visitDate)}</div>
              <div><strong>Clinic:</strong> {selectedVisit?.clinic}</div>
            </div>
            
            <div>
              <Label htmlFor="visit-notes">Visit Notes</Label>
              <Textarea
                id="visit-notes"
                placeholder="Enter notes about this visit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNotesModal(false);
                setNotes("");
                setSelectedVisit(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedVisit && handleAddNotes(selectedVisit.id, notes)}
              disabled={!notes.trim()}
            >
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Modal */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Bulk Actions ({selectedVisits.length} visits selected)
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded text-sm">
              <p>You have selected {selectedVisits.length} visits. Choose an action to apply to all selected visits.</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate("Confirmed")}
              >
                <Send className="h-4 w-4 mr-2" />
                Confirm All Visits
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate("In Progress")}
              >
                <Send className="h-4 w-4 mr-2" />
                Start All Visits
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate("Completed")}
              >
                <Send className="h-4 w-4 mr-2" />
                Complete All Visits
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate("Cancelled")}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel All Visits
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate("Rescheduled")}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reschedule All Visits
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkActions(false);
                setSelectedVisits([]);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Visit Modal */}
      <EditVisitModal 
        open={showEditVisitModal} 
        onClose={() => setShowEditVisitModal(false)} 
        visit={selectedVisit} 
        onSave={handleEditVisit}
      />

      {/* Patient Overview Modal */}
      <Dialog open={showPatientOverviewModal} onOpenChange={setShowPatientOverviewModal}>
        <DialogContent className="max-w-4xl">
          <VisuallyHidden asChild>
            <DialogTitle>Patient Overview for {selectedPatient?.fullName || 'Patient'}</DialogTitle>
          </VisuallyHidden>
          {selectedPatient && <PatientOverviewModalContent patient={selectedPatient} />}
        </DialogContent>
      </Dialog>

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

    </div>
  );
}