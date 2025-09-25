"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Edit,
  Send,
  Clock,
  Calendar,
  CheckCircle,
  X,
  Filter,
  User,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/lib/toast";
import PatientOverviewModalContent from "@/components/medical-records/patientoverviewmodal";
import EditVisitModal from "@/components/medical-records/editvisitmodal";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Improved type definitions
interface Toast {
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success";
}

type VisitStatus =
  | "Scheduled"
  | "Confirmed"
  | "In Progress"
  | "In Nursing Pool"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";

interface Visit {
  id: string;
  patient: string;
  patient_name: string;
  personal_number: string;
  clinic: string;
  visit_time: string;
  visit_date: string;
  visit_type: string;
  visit_location: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: VisitStatus;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  assigned_nurse?: string;
  nursing_received_at?: string;
}

interface Patient {
  id: string;
  personal_number: string;
  name: string;
  patient_type: string;
  gender: string;
  age: number;
  phone?: string;
  email?: string;
  non_npa_type?: string;
  photo?: string;
}

interface APIError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

// Improved error handling
const handleError = (error: unknown, context: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context}:`, errorMessage);
  return errorMessage;
};

// Improved WebSocket hook
const useWebSocket = (url: string, onMessage: (data: any) => void) => {
  const [wsConnected, setWsConnected] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  const wsRef = React.useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}${url}`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
        setUsePolling(false);
      };
      
      wsRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      wsRef.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setWsConnected(false);
        setUsePolling(true);
      };
      
      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setWsConnected(false);
        setUsePolling(true);
      };
    } catch (err) {
      console.error("WebSocket setup error:", err);
      setWsConnected(false);
      setUsePolling(true);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { wsConnected, usePolling };
};

const Loader = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const getStatusColor = (status: VisitStatus) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "In Nursing Pool":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "Rescheduled":
      return "bg-orange-100 text-orange-800 border-orange-200";
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

export default function ManageVisit() {
  const router = useRouter();
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVisits, setSelectedVisits] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showEditVisitModal, setShowEditVisitModal] = useState(false);
  const [showPatientOverviewModal, setShowPatientOverviewModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") || "" : "";

  // WebSocket setup
  const handleWebSocketMessage = (data: any) => {
    if (data.type === "visit.update") {
      setVisits((prev) => {
        const updated = prev.map((v) =>
          v.id === data.data.id 
            ? { ...v, ...data.data, updated_at: new Date().toISOString() } 
            : v
        );
        
        if (!prev.some((v) => v.id === data.data.id)) {
          return [data.data, ...updated].slice(0, itemsPerPage);
        }
        
        return updated;
      });
      
      toast({
        title: "Visit Updated",
        description: `Visit ${data.data.id} status: ${data.data.status}`,
        variant: "success",
      });
    }
  };

  const { wsConnected, usePolling } = useWebSocket(
    `${window.location.host}/ws/visits/`,
    handleWebSocketMessage
  );

  // Improved fetch with error handling
  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        page_size: String(itemsPerPage),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(priorityFilter !== "All" && { priority: priorityFilter }),
        ...(dateFilter && { visit_date: dateFilter }),
      });
      
      const visitsRes = await fetch(`${API_URL}/api/visits/?${params}`, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
      });
      
      if (!visitsRes.ok) {
        const err: APIError = await visitsRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch visits");
      }
      
      const visitsData = await visitsRes.json();
      const mappedVisits = (visitsData.results || visitsData).map((v: any) => ({
        id: String(v.id),
        patient: String(v.patient),
        patient_name: v.patient_name || "Unknown",
        personal_number: v.personal_number || "",
        clinic: v.clinic,
        visit_time: v.visit_time,
        visit_date: v.visit_date,
        visit_type: v.visit_type,
        visit_location: v.visit_location || "",
        priority: v.priority,
        status: v.status as VisitStatus,
        special_instructions: v.special_instructions || "",
        created_at: v.created_at,
        updated_at: v.updated_at,
        assigned_nurse: v.assigned_nurse,
        nursing_received_at: v.nursing_received_at,
      }));
      
      setVisits(mappedVisits);
      setTotalCount(visitsData.count || 0);
      setTotalPages(
        Math.ceil((visitsData.count || mappedVisits.length) / itemsPerPage)
      );
    } catch (err) {
      const errorMessage = handleError(err, "Fetch visits error");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsRes = await fetch(`${API_URL}/api/patients/`, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
      });
      
      if (!patientsRes.ok) {
        const err: APIError = await patientsRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to fetch patients");
      }
      
      const patientsData = await patientsRes.json();
      const mappedPatients = (patientsData.results || patientsData).map(
        (p: any) => ({
          id: String(p.id),
          personal_number: p.personal_number || "",
          name: `${p.surname || ""} ${p.first_name || ""}`.trim() || "Unknown",
          patient_type: p.patient_type || "Unknown",
          gender: p.gender || "Unknown",
          age: p.age || 0,
          phone: p.phone || "",
          email: p.email || "",
          non_npa_type: p.non_npa_type || "",
          photo: p.photo || p.photo_url || "",
        })
      );
      
      setPatients(mappedPatients);
    } catch (err) {
      const errorMessage = handleError(err, "Fetch patients error");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Auto-refresh when using polling
  useEffect(() => {
    if (usePolling) {
      const interval = setInterval(() => {
        fetchVisits();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [usePolling]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchVisits(), fetchPatients()]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [currentPage, searchTerm, statusFilter, priorityFilter, dateFilter, token]);

  // Improved pagination
  const paginatedVisits = visits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate stats based on current visits
  const stats = {
    total: totalCount,
    scheduled: visits.filter((v) => v.status === "Scheduled").length,
    confirmed: visits.filter((v) => v.status === "Confirmed").length,
    inProgress: visits.filter((v) => v.status === "In Progress").length,
    inNursingPool: visits.filter((v) => v.status === "In Nursing Pool").length,
    completed: visits.filter((v) => v.status === "Completed").length,
    cancelled: visits.filter((v) => v.status === "Cancelled").length,
    rescheduled: visits.filter((v) => v.status === "Rescheduled").length,
  };

  // Missing functions implementation
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVisits(paginatedVisits.map(v => v.id));
    } else {
      setSelectedVisits([]);
    }
  };

  const handleVisitSelection = (visitId: string, checked: boolean) => {
    setSelectedVisits(prev => {
      if (checked) {
        return [...prev, visitId];
      } else {
        return prev.filter(id => id !== visitId);
      }
    });
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientOverviewModal(true);
  };

  const updateVisitStatus = async (visitId: string, newStatus: VisitStatus, nurseId?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (nurseId) {
        payload.assigned_nurse = nurseId;
        payload.nursing_received_at = new Date().toISOString();
      }
      
      const res = await fetch(`${API_URL}/api/visits/${visitId}/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const err: APIError = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update status");
      }
      
      const updatedVisit = await res.json();
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? { ...v, ...updatedVisit, updated_at: new Date().toISOString() }
            : v
        )
      );
      
      toast({
        title: "Success",
        description: `Visit ${visitId} updated to ${newStatus}`,
        variant: "success",
      });
    } catch (err) {
      const errorMessage = handleError(err, "Update visit status error");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (status: VisitStatus) => {
    try {
      await Promise.all(
        selectedVisits.map(async (visitId) => {
          const res = await fetch(`${API_URL}/api/visits/${visitId}/`, {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            credentials: "include",
            body: JSON.stringify({ status }),
          });
          
          if (!res.ok) {
            const err: APIError = await res.json().catch(() => ({}));
            throw new Error(
              err.detail ||
              (err.status && Array.isArray(err.status)
                ? err.status[0]
                : err.status) ||
              `Failed to update visit ${visitId}`
            );
          }
          
          return res.json();
        })
      );
      
      setVisits((prev) =>
        prev.map((v) =>
          selectedVisits.includes(v.id)
            ? { ...v, status, updated_at: new Date().toISOString() }
            : v
        )
      );
      
      setSelectedVisits([]);
      setShowBulkActions(false);
      
      toast({
        title: "Success",
        description: `Updated ${selectedVisits.length} visits to ${status}`,
        variant: "success",
      });
    } catch (err) {
      const errorMessage = handleError(err, "Bulk update error");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditVisit = async (updatedVisit: Visit) => {
    try {
      if (updatedVisit.status === "Cancelled") {
        updatedVisit.status = "Scheduled";
      }
      
      const res = await fetch(`${API_URL}/api/visits/${updatedVisit.id}/`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({
          patient: updatedVisit.patient,
          visit_date: updatedVisit.visit_date,
          visit_time: updatedVisit.visit_time,
          visit_location: updatedVisit.visit_location,
          visit_type: updatedVisit.visit_type,
          clinic: updatedVisit.clinic,
          priority: updatedVisit.priority,
          special_instructions: updatedVisit.special_instructions,
          status: updatedVisit.status,
        }),
      });
      
      if (!res.ok) {
        const err: APIError = await res.json().catch(() => ({}));
        throw new Error(
          err.detail ||
          Object.values(err)
            .flat()
            .join(", ") ||
          "Failed to update visit"
        );
      }
      
      const data = await res.json();
      setVisits((prev) =>
        prev.map((v) =>
          v.id === data.id
            ? { ...v, ...data, updated_at: new Date().toISOString() }
            : v
        )
      );
      
      setShowEditVisitModal(false);
      toast({
        title: "Success",
        description: "Visit rescheduled successfully",
        variant: "success",
      });
    } catch (err) {
      const errorMessage = handleError(err, "Edit visit error");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <Card className="max-w-7xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Manage Visits
          </CardTitle>
          <div className="flex items-center gap-3">
            {wsConnected && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Users className="h-3 w-3 mr-1" />
                Real-time updates
              </Badge>
            )}
            {usePolling && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Polling mode
              </Badge>
            )}
            <Button
              className="bg-gray-900 hover:bg-gray-900 text-white"
              onClick={() => router.push("/medical-records/create-visit")}
            >
              Create Visit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: User },
            { label: "Scheduled", value: stats.scheduled, icon: Calendar },
            { label: "Confirmed", value: stats.confirmed, icon: CheckCircle },
            { label: "In Progress", value: stats.inProgress, icon: Clock },
            { label: "In Nursing Pool", value: stats.inNursingPool, icon: Users },
            { label: "Completed", value: stats.completed, icon: CheckCircle },
            { label: "Cancelled", value: stats.cancelled, icon: X },
            { label: "Rescheduled", value: stats.rescheduled, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <Card
              key={label}
              className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]"
            >
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Search & Filter
              </CardTitle>
              <div className="flex items-center gap-3">
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Visits</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by patient name, personal number, or visit ID"
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
                    {[
                      "Scheduled",
                      "Confirmed",
                      "In Progress",
                      "In Nursing Pool",
                      "Completed",
                      "Cancelled",
                      "Rescheduled",
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
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
                    {["Emergency", "High", "Medium", "Low"].map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
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
          </CardContent>
        </Card>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 flex items-center gap-4">
            <span>
              Showing {paginatedVisits.length} of {totalCount} visits
            </span>
            {paginatedVisits.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedVisits.length === paginatedVisits.length && paginatedVisits.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-xs">Select all on page</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Visit Cards */}
        <div className="space-y-4">
          {paginatedVisits.length > 0 ? (
            paginatedVisits.map((visit) => {
              const patient = patients.find((p) => p.id === visit.patient);
              const isSelected = selectedVisits.includes(visit.id);
              
              return (
                <Card
                  key={visit.id}
                  className={`hover:shadow-md transition-all ${
                    isSelected ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleVisitSelection(visit.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="space-y-2">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${getPriorityColor(
                                visit.priority
                              )}`}
                            />
                            <span>{visit.patient_name}</span>
                            <span className="text-sm text-muted-foreground font-normal">
                              ID: {visit.id ? String(visit.id).substring(0, 8) : "N/A"}
                            </span>
                            {patient?.photo && (
                              <img
                                src={`${API_URL}${patient.photo}`}
                                alt={`${patient.name}`}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </CardTitle>
                          
                          <div className="text-sm text-muted-foreground">
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span>
                                <strong>Personal Number:</strong>{" "}
                                {visit.personal_number || "N/A"}
                              </span>
                              <span>
                                <strong>Category:</strong>{" "}
                                {patient?.patient_type || "Unknown"}
                                {patient?.non_npa_type
                                  ? ` (${patient.non_npa_type})`
                                  : ""}
                              </span>
                              <span>
                                <strong>Gender:</strong>{" "}
                                {patient?.gender || "N/A"}
                              </span>
                              <span>
                                <strong>Age:</strong> {patient?.age || 0} yrs
                              </span>
                            </div>
                            <div className="text-xs">
                              <strong>Phone:</strong> {patient?.phone || "N/A"}
                              {patient?.email && (
                                <span className="ml-4">
                                  <strong>Email:</strong> {patient.email}
                                </span>
                              )}
                            </div>
                            {visit.assigned_nurse && (
                              <div className="text-xs">
                                <strong>Assigned Nurse:</strong> {visit.assigned_nurse}
                              </div>
                            )}
                            {visit.nursing_received_at && (
                              <div className="text-xs">
                                <strong>Received by Nursing:</strong>{" "}
                                {new Date(visit.nursing_received_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge
                          className={getStatusColor(visit.status)}
                          variant="outline"
                        >
                          {visit.status}
                        </Badge>
                        
                        <div className="ml-2 flex flex-col gap-1">
                          {/* View Patient Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPatient(visit.patient)}
                            className="hover:bg-blue-50 hover:border-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Workflow Actions */}
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
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => updateVisitStatus(visit.id, "In Progress")}
                                className="hover:bg-purple-600"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Start Visit
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateVisitStatus(visit.id, "Cancelled")}
                                className="hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          )}
                          
                          {visit.status === "In Progress" && (
                            <Button
                              size="sm"
                              onClick={() => updateVisitStatus(visit.id, "In Nursing Pool", "current-nurse")}
                              className="hover:bg-cyan-600"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Send to Nursing
                            </Button>
                          )}
                          
                          {visit.status === "In Nursing Pool" && (
                            <Button size="sm" variant="outline" disabled>
                              In Nursing Pool
                            </Button>
                          )}
                          
                          {visit.status === "Cancelled" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedVisit(visit);
                                setShowEditVisitModal(true);
                              }}
                              className="hover:bg-orange-600"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                          )}
                          
                          {["Completed", "Rescheduled"].includes(visit.status) && (
                            <Button size="sm" variant="outline" disabled>
                              {visit.status}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Clinic:</strong> {visit.clinic}
                      </div>
                      <div>
                        <strong>Type:</strong> {visit.visit_type}
                      </div>
                      <div>
                        <strong>Date:</strong> {formatDate(visit.visit_date)}
                      </div>
                      <div>
                        <strong>Time:</strong> {visit.visit_time}
                      </div>
                    </div>
                    
                    {visit.special_instructions && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                        <strong>Notes:</strong> {visit.special_instructions}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-1">No visits found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Bulk Actions Modal */}
        <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Bulk Actions ({selectedVisits.length} visits selected)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p>
                  You have selected {selectedVisits.length} visits. Choose an
                  action to apply to all selected visits.
                </p>
              </div>
              <div className="space-y-2">
                {["Completed", "Cancelled"].map((status) => (
                  <Button
                    key={status}
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate(status as VisitStatus)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {status === "Completed"
                      ? "Complete All Visits"
                      : "Cancel All Visits"}
                  </Button>
                ))}
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
        {selectedVisit && (
          <EditVisitModal
            open={showEditVisitModal}
            onClose={() => setShowEditVisitModal(false)}
            visit={selectedVisit}
            patientId={selectedVisit.patient}
            patientName={selectedVisit.patient_name}
            onSave={handleEditVisit}
          />
        )}
        
        {/* Patient Overview Modal */}
        <Dialog open={showPatientOverviewModal} onOpenChange={setShowPatientOverviewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Overview</DialogTitle>
            </DialogHeader>
            {selectedPatientId && (
              <PatientOverviewModalContent patientId={selectedPatientId} />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
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
                    className={pageNumber === currentPage ? "bg-gray-900 hover:bg-gray-900 text-white" : ""}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}