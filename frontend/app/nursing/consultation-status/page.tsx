"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Clock, 
  User, 
  UserCheck, 
  ArrowRight, 
  RotateCw, 
  AlertTriangle, 
  Search,
  RefreshCw,
  Stethoscope,
  Timer,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  Edit
} from "lucide-react";
import { toast } from "react-hot-toast";  // Assume you have this for notifications

// Types
interface Patient {
  id: string;
  patientId: string;
  name: string;
  personalNumber: string;
  visitId: string;
  clinic: string;
  visitType: string;
  priority: "Emergency" | "High" | "Medium" | "Low";
  gender: string;
  age: number;
  phoneNumber: string;
  employeeCategory: string;
  assignedAt: string;
  vitalsAlerts?: string[];
  vitals?: any;
  estimatedDuration?: number; // in minutes
  notes?: string;
}

interface ConsultationRoom {
  id: string;
  name: string;
  status: "occupied" | "available" | "unavailable" ;
  currentPatient?: Patient;
  consultationStartTime?: string;
  estimatedEndTime?: string;
  doctor?: string;
  queue: any[];  // Array of { patient_id: string, position: number }
  totalConsultationsToday: number;
  averageConsultationTime: number; // in minutes
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper functions
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const getMinutesDifference = (fromDate: string, toDate: Date = new Date()) => {
  const from = new Date(fromDate);
  return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
};

const getPriorityColor = (priority: string) => {
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "occupied":
      return "bg-red-100 text-red-800 border-red-200";
    case "available":
      return "bg-green-100 text-green-800 border-green-200";
    case "cleaning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "maintenance":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const ConsultationRoomQueue = () => {
  const [rooms, setRooms] = useState<ConsultationRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms with queues
  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setRooms((data.results || data).map((r: any) => ({
          ...r,
          queue: r.queue || [],  // Patient objects via join if needed; minimal: use patient_id
        })));
      }
    } catch (err) {
      setError("Failed to fetch rooms");
    }
  }, [API_URL]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchRooms();
    } catch (err) {
      setError("Failed to refresh room data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate overall statistics
  const stats = useMemo(() => {
    const totalPatients = rooms.reduce((acc, room) => acc + room.queue.length + (room.currentPatient ? 1 : 0), 0);
    const occupiedRooms = rooms.filter(room => room.status === "occupied").length;
    const availableRooms = rooms.filter(room => room.status === "available").length;
    const totalConsultationsToday = rooms.reduce((acc, room) => acc + room.totalConsultationsToday, 0);
    const avgWaitTime = rooms.reduce((acc, room) => {
      const queueWait = room.queue.reduce((qAcc: number, qItem: any) => qAcc + getMinutesDifference(qItem.assignedAt || new Date().toISOString()), 0);
      return acc + queueWait;
    }, 0) / Math.max(1, totalPatients);

    return {
      totalPatients,
      occupiedRooms,
      availableRooms,
      totalConsultationsToday,
      avgWaitTime: Math.round(avgWaitTime),
      emergencyPatients: rooms.reduce((acc, room) => {
        const emergencyInQueue = room.queue.filter((q: any) => q.priority === "Emergency").length;  // Assume priority in queue
        const emergencyInProgress = room.currentPatient?.priority === "Emergency" ? 1 : 0;
        return acc + emergencyInQueue + emergencyInProgress;
      }, 0),
    };
  }, [rooms]);

  // Filter rooms based on search and selection
  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    
    if (selectedRoom !== "all") {
      filtered = filtered.filter(room => room.id === selectedRoom);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(term) ||
        room.doctor?.toLowerCase().includes(term) ||
        room.currentPatient?.name.toLowerCase().includes(term) ||
        room.queue.some((q: any) => 
          q.patient_id.toLowerCase().includes(term)  // Minimal: use patient_id
        )
      );
    }
    
    return filtered;
  }, [rooms, selectedRoom, searchTerm]);

  // Handle patient reassignment
  const handleReassignPatient = async (patientId: string, fromRoomId: string, toRoomId: string) => {
    if (fromRoomId === toRoomId) return;

    try {
      // Fetch rooms
      const fromRoomResponse = await fetch(`${API_URL}/api/rooms/${fromRoomId}/`);
      const fromRoom = await fromRoomResponse.json();
      const toRoomResponse = await fetch(`${API_URL}/api/rooms/${toRoomId}/`);
      const toRoom = await toRoomResponse.json();

      const newQueuePosition = (toRoom.queue || []).length + 1;
      const newQueue = [...(toRoom.queue || []), { patient_id: patientId, position: newQueuePosition }];

      // Update visit
      await fetch(`${API_URL}/api/visits/${patientId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          consultation_room: toRoomId,
          queue_position: newQueuePosition,
          status: "Queued",
          location: `${toRoom.name} (Queue Position: ${newQueuePosition})`,
        }),
      });

      // Update fromRoom queue (remove)
      const updatedFromQueue = (fromRoom.queue || []).filter((q: any) => q.patient_id !== patientId);
      await fetch(`${API_URL}/api/rooms/${fromRoomId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ queue: updatedFromQueue }),
      });

      // Update toRoom queue
      await fetch(`${API_URL}/api/rooms/${toRoomId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ queue: newQueue }),
      });

      await fetchRooms();  // Refresh
      toast.success(`Reassigned patient ${patientId} to ${toRoom.name}`);
      setReassignDialogOpen(false);
      setSelectedPatient(null);
      setTargetRoomId("");
    } catch (err) {
      setError("Failed to reassign patient");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultation Room Queue</h1>
          <p className="text-muted-foreground">
            Manage patient queues and room assignments for consultations
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

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">In queue & consulting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <User className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground">Ready for patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emergency</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergencyPatients}</div>
            <p className="text-xs text-muted-foreground">Priority patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultations Today</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalConsultationsToday}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait (min)</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgWaitTime}</div>
            <p className="text-xs text-muted-foreground">Current average</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms, doctors, patients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Filter by room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {rooms.map(room => (
              <SelectItem key={room.id} value={room.id}>
                {room.name} {room.doctor && `(${room.doctor})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Room Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {room.name}
                    <Badge className={getStatusColor(room.status)}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {room.doctor && `Doctor: ${room.doctor}`}
                    <div className="text-xs mt-1">
                      Today: {room.totalConsultationsToday} consultations • 
                      Avg: {room.averageConsultationTime} min
                    </div>
                  </CardDescription>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Queue: {room.queue.length} patients
                  </div>
                  {room.status === "occupied" && room.consultationStartTime && (
                    <div className="text-xs text-muted-foreground">
                      Started: {formatTime(room.consultationStartTime)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Current Patient */}
              {room.currentPatient && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      Currently Consulting
                    </span>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(room.currentPatient.priority)} variant="outline">
                        {room.currentPatient.priority}
                      </Badge>
                      {room.currentPatient.vitalsAlerts && room.currentPatient.vitalsAlerts.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                {room.currentPatient.vitalsAlerts.map((alert, index) => (
                                  <div key={index} className="text-red-600">{alert}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>{room.currentPatient.name}</strong></div>
                    <div>Personal #: {room.currentPatient.personalNumber}</div>
                    <div>Visit ID: {room.currentPatient.visitId}</div>
                    <div>
                      Duration: {getMinutesDifference(room.consultationStartTime!)} min
                      {room.estimatedEndTime && (
                        <span className="ml-2 text-muted-foreground">
                          (Est. end: {formatTime(room.estimatedEndTime)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Queue */}
              {room.queue.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Queue ({room.queue.length} patients)
                  </h4>
                  
                  {room.queue.map((qItem: any, index: number) => (
                    <div 
                      key={qItem.patient_id} 
                      className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          {/* Priority from visit if available; minimal placeholder */}
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200" variant="outline">
                            Medium  {/* Fetch if needed */}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Waiting: {getMinutesDifference(qItem.assignedAt || new Date().toISOString())} min
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div><strong>Patient ID: {qItem.patient_id}</strong></div>  {/* Enhance: fetch name */}
                        <div className="text-gray-600 text-xs">Position: {qItem.position}</div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm"
                          onClick={() => {
                            setSelectedPatient({ id: qItem.patient_id, name: "Patient " + qItem.patient_id });  // Minimal
                            setReassignDialogOpen(true);
                          }}
                        >
                          <RotateCw className="h-4 w-4 mr-1" />
                          Reassign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : room.status === "available" ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No patients in queue</p>
                  <p className="text-xs">Room is ready for next patient</p>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Room is {room.status}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reassignment Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogTitle>Reassign Patient</DialogTitle>
          
          {selectedPatient && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedPatient.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Patient ID: {selectedPatient.id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Select target room:</label>
                <Select value={targetRoomId} onValueChange={setTargetRoomId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms
                      .filter(room => room.id !== rooms.find(r => r.queue.some((q: any) => q.patient_id === selectedPatient.id))?.id)
                      .map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} 
                          {room.doctor && ` (${room.doctor})`}
                          {room.status === "occupied" && " - Occupied"}
                          {room.queue.length > 0 && ` - ${room.queue.length} in queue`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedPatient && targetRoomId) {
                  const currentRoom = rooms.find(r => r.queue.some((q: any) => q.patient_id === selectedPatient.id));
                  if (currentRoom) {
                    handleReassignPatient(selectedPatient.id, currentRoom.id, targetRoomId);
                  }
                }
              }}
              disabled={!targetRoomId}
            >
              Reassign Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>  
  );
};

export default ConsultationRoomQueue;