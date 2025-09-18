"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  AlertTriangle,
  Stethoscope,
  Loader2,
} from "lucide-react";
import ConsultationSession from "@/components/consultation/consultationsession";

// Toast functionality (replace with your actual toast implementation)
const toast = {
  success: (message: string) => console.log("Success:", message),
  error: (message: string) => console.error("Error:", message),
  info: (message: string) => console.log("Info:", message),
};

// Types (aligned with consultationsession.tsx and patientvitals.tsx)
interface Patient {
  id: string;
  visitId: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  allergies: string[];
  riskFactors?: string[];
  NextOfKin?: string;
  chiefComplaint: string;
  assignedTo?: string;
  consultationRoom?: string;
  assignmentStatus: "Assigned" | "Unassigned" | "In Progress" | "Queued";
  waitTime: number;
  vitalsCompleted: boolean;
  sentFromNurse?: boolean;
  priority: "Emergency" | "High" | "Medium" | "Low";
  visitDate: string;
  visitTime: string;
  vitals?: any;
  vitalsAlerts?: string[];
}

interface ConsultationRoom {
  id: string;
  name: string;
  status: "available" | "occupied";
  currentPatient?: string;  // This will be patient ID
  startTime?: string;
  doctor?: string;
  specialtyFocus?: string;
  totalConsultationsToday?: number;
  averageConsultationTime?: number;
  lastPatient?: string;
  queue?: any[];  // Array of { patient_id, position }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Utility functions
const getStatusColor = (status: ConsultationRoom["status"]): string => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 border-green-200";
    case "occupied":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: ConsultationRoom["status"]): string => {
  switch (status) {
    case "available":
      return "✓";
    case "occupied":
      return "⚫";
    default:
      return "";
  }
};

const StartConsultation = () => {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [consultationRooms, setConsultationRooms] = useState<ConsultationRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Debug state logging
  useEffect(() => {
    console.log("Debug State:", {
      selectedRoom,
      selectedPatient: selectedPatient ? {
        id: selectedPatient.id,
        patientId: selectedPatient.patientId,
        name: selectedPatient.name
      } : null,
      API_URL,
      consultationRooms: consultationRooms.length
    });
  }, [selectedRoom, selectedPatient, API_URL, consultationRooms]);

  // Fetch consultation rooms
  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const response = await fetch(`${API_URL}/api/rooms/`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setConsultationRooms((data.results || data).map((r: any) => ({
            ...r,
            queue: r.queue || [],
          })));
        } else {
          const errorText = await response.text();
          console.error(`Failed to load rooms: Status ${response.status}, ${errorText}`);
          toast.error(`Failed to load consultation rooms: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        console.error("Failed to load rooms:", error.message);
        toast.error(`Failed to load consultation rooms: ${error.message}`);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [API_URL]);

  // Fetch patients for selected room - Updated to match ConsultationSession data structure
  useEffect(() => {
    const loadPatients = async () => {
      if (selectedRoom) {
        try {
          // Try visits endpoint first (matches ConsultationSession approach)
          const visitResponse = await fetch(`${API_URL}/api/visits/?consultation_room=${selectedRoom}&status__in=Queued,Assigned`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          
          if (visitResponse.ok) {
            const visitData = await visitResponse.json();
            const visitsList = visitData.results || visitData;
            
            if (visitsList.length > 0) {
              // Transform visit data to Patient format
              const patientsData = visitsList.map((visit: any) => ({
                id: visit.id,
                visitId: visit.id,
                patientId: visit.patient?.id || visit.patient_id,
                name: visit.patient_name || visit.patient?.name,
                age: visit.patient?.age || 0,
                gender: visit.patient?.gender || "Unknown",
                mrn: visit.personal_number || visit.patient?.mrn,
                allergies: visit.patient?.allergies || [],
                riskFactors: visit.patient?.riskFactors || [],
                NextOfKin: visit.patient?.nok_first_name ? `${visit.patient.nok_first_name} ${visit.patient.nok_last_name || ''}` : '',
                chiefComplaint: visit.special_instructions || visit.chief_complaint || "Not specified",
                assignedTo: visit.assigned_nurse,
                consultationRoom: selectedRoom,
                assignmentStatus: visit.status as "Assigned" | "Unassigned" | "In Progress" | "Queued",
                waitTime: getMinutesDifference(visit.visit_date, visit.visit_time),
                vitalsCompleted: false,
                sentFromNurse: visit.nursing_received_at !== null,
                priority: visit.priority as "Emergency" | "High" | "Medium" | "Low",
                visitDate: visit.visit_date,
                visitTime: visit.visit_time,
              }));
              
              // Select first patient or let user choose
              setSelectedPatient(patientsData[0] || null);
            } else {
              setSelectedPatient(null);
            }
          } else {
            // Fallback to patients endpoint
            const patientResponse = await fetch(`${API_URL}/api/patients/?consultation_room=${selectedRoom}`, {
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              const patientsData = patientData.results || patientData;
              setSelectedPatient(patientsData[0] || null);
            } else {
              console.warn("Failed to load patients from both endpoints");
              setSelectedPatient(null);
            }
          }
        } catch (error) {
          console.error("Failed to load patients:", error);
          toast.error("Failed to load patients");
        }
      }
    };
    loadPatients();
  }, [selectedRoom]);

  // Helper function for time calculations
  const getMinutesDifference = (visitDate: string, visitTime: string, toDate: Date = new Date()): number => {
    const from = new Date(`${visitDate}T${visitTime}Z`);
    if (isNaN(from.getTime())) return 0;
    return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
  };

  const handleStartConsultation = () => {
    console.log("Attempting to start consultation:", {
      selectedRoom,
      selectedPatient: selectedPatient ? {
        id: selectedPatient.id,
        patientId: selectedPatient.patientId,
        name: selectedPatient.name
      } : null
    });
    
    if (!selectedRoom) {
      toast.error("Please select a consultation room");
      return;
    }
    
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    
    if (!API_URL) {
      toast.error("API URL is not configured");
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmStartConsultation = async () => {
    if (!selectedPatient) {
      toast.error("No patient selected");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Additional debugging
      console.log("=== Starting Consultation Debug ===");
      console.log("API_URL:", API_URL);
      console.log("selectedRoom:", selectedRoom);
      console.log("selectedPatient:", selectedPatient);
      console.log("Environment:", process.env.NODE_ENV);
      
      // Test if API is reachable first
      try {
        const healthCheck = await fetch(`${API_URL}/api/`, {
          method: "GET",
          headers: { "Accept": "application/json" },
          credentials: "include",
        });
        console.log("API Health Check:", {
          ok: healthCheck.ok,
          status: healthCheck.status,
          statusText: healthCheck.statusText,
        });
      } catch (healthError) {
        console.error("API Health Check Failed:", healthError);
        throw new Error(`Cannot connect to API server at ${API_URL}. Please check if the server is running.`);
      }
      
      // Use visitId to update the visit status instead of creating a session
      const updateData = {
        status: "In Progress",
        consultation_start_time: new Date().toISOString(),
        assigned_doctor: "current-doctor-id", // Replace with actual doctor ID from auth context
      };

      console.log("Updating visit with data:", updateData);
      console.log("Full URL:", `${API_URL}/api/visits/${selectedPatient.visitId}/`);

      // Test basic connectivity first
      console.log("Testing API connectivity...");
      
      const response = await fetch(`${API_URL}/api/visits/${selectedPatient.visitId}/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      console.log("Response received:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        type: response.type,
        url: response.url,
      });

      // Enhanced error handling with more detailed logging
      if (!response.ok) {
        let errorData: string;
        let parsedError: any = null;
        
        try {
          errorData = await response.text();
          console.log("Raw response text:", errorData);
        } catch (textError) {
          errorData = "Could not read response text";
          console.error("Failed to read response text:", textError);
        }
        
        let errorMessage = "Failed to start consultation";
        
        if (errorData) {
          try {
            parsedError = JSON.parse(errorData);
            console.log("Parsed JSON error:", parsedError);
            
            if (parsedError.detail) {
              errorMessage = parsedError.detail;
            } else if (parsedError.message) {
              errorMessage = parsedError.message;
            } else if (parsedError.error) {
              errorMessage = parsedError.error;
            } else if (parsedError.non_field_errors) {
              errorMessage = parsedError.non_field_errors.join(", ");
            } else if (typeof parsedError === 'string') {
              errorMessage = parsedError;
            } else {
              errorMessage = `Server error: ${JSON.stringify(parsedError)}`;
            }
          } catch (parseError) {
            console.log("Response is not JSON, using raw text");
            errorMessage = errorData || `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        
        // More comprehensive error logging
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseData: errorData,
          parsedError: parsedError,
          url: `${API_URL}/api/visits/${selectedPatient.visitId}/`,
          requestData: updateData,
          requestHeaders: {
            "Content-Type": "application/json",
            credentials: "include"
          }
        };
        
        console.error("API Error Details:", errorDetails);
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Consultation started successfully:", responseData);
      
      // Update room status to occupied
      try {
        await fetch(`${API_URL}/api/rooms/${selectedRoom}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: "occupied",
            current_patient: selectedPatient.patientId,
            start_time: new Date().toISOString(),
          }),
        });
      } catch (roomError) {
        console.warn("Failed to update room status:", roomError);
        // Don't block the consultation start for this
      }
      
      setIsStarted(true);
      toast.success("Consultation started successfully");
      
    } catch (error: any) {
      console.error("Failed to start consultation:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // More user-friendly error messages
      let userMessage = "Failed to start consultation";
      if (error.message.includes("fetch") || error.message.includes("network")) {
        userMessage = "Network error - please check your connection";
      } else if (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized")) {
        userMessage = "Authentication required - please log in again";
      } else if (error.message.includes("403") || error.message.toLowerCase().includes("forbidden")) {
        userMessage = "You don't have permission to start consultations";
      } else if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
        userMessage = "Consultation service not found - please contact support";
      } else if (error.message.includes("409") || error.message.toLowerCase().includes("conflict")) {
        userMessage = "Room is already occupied or patient is already in consultation";
      } else if (error.message.includes("500") || error.message.toLowerCase().includes("internal server")) {
        userMessage = "Server error - please try again later";
      } else if (error.message !== "Failed to start consultation") {
        userMessage = error.message;
      }
      
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleRoomSelect = (roomId: string, status: ConsultationRoom["status"]) => {
    if (status === "available") {
      setSelectedRoom(roomId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, roomId: string, status: ConsultationRoom["status"]) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRoomSelect(roomId, status);
    }
  };

  if (isStarted) {
    return (
      <ConsultationSession
        roomId={selectedRoom}
        initialPatient={selectedPatient}
      />
    );
  }

  const selectedRoomData = consultationRooms.find((room) => room.id === selectedRoom);
  const availableRooms = consultationRooms.filter((room) => room.status === "available");

  if (loadingRooms) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Start Consultation</h1>
          <p className="text-gray-600">Loading consultation rooms...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="w-32 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Start Consultation</h1>
        <p className="text-gray-600">Select a consultation room to begin your session</p>
        {availableRooms.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                No rooms are currently available. Please wait for a room to become free or check back later.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {consultationRooms.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              selectedRoom === room.id ? "ring-2 ring-blue-500 border-blue-500 shadow-md" : "border-gray-200"
            } ${room.status !== "available" ? "opacity-60 cursor-not-allowed" : "hover:border-gray-300"}`}
            onClick={() => handleRoomSelect(room.id, room.status)}
            onKeyDown={(e) => handleKeyDown(e, room.id, room.status)}
            tabIndex={room.status === "available" ? 0 : -1}
            role="button"
            aria-pressed={selectedRoom === room.id}
            aria-disabled={room.status !== "available"}
            aria-describedby={`room-${room.id}-description`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
                </div>
                <Badge className={`${getStatusColor(room.status)} font-medium capitalize`} aria-label={`Status: ${room.status}`}>
                  <span aria-hidden="true">{getStatusIcon(room.status)}</span>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div id={`room-${room.id}-description`}>
                {room.queue && room.queue.length > 0 && (
                  <div className="text-sm text-gray-600 mb-2">Queue: {room.queue.length} patients</div>
                )}
                {room.status === "available" && room.lastPatient && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>Last patient: {room.lastPatient}</span>
                  </div>
                )}
                {room.status === "occupied" && (
                  <div className="space-y-2">
                    {room.currentPatient && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>Current: {room.currentPatient}</span>
                      </div>
                    )}
                    {room.startTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>Started: {new Date(room.startTime).toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={handleStartConsultation}
          disabled={!selectedRoom || !selectedPatient || isLoading || availableRooms.length === 0}
          size="lg"
          className="min-w-48 font-medium"
          aria-describedby="start-consultation-help"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Stethoscope className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Starting..." : "Start Consultation"}
        </Button>
        {availableRooms.length > 0 && (
          <Button variant="outline" size="lg" className="font-medium">
            View Recent Sessions
          </Button>
        )}
      </div>
      {selectedRoom && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600" id="start-consultation-help">
            Selected: <span className="font-medium text-blue-600">{selectedRoomData?.name}</span>
            {selectedPatient && (
              <> | Patient: <span className="font-medium text-blue-600">{selectedPatient.name}</span></>
            )}
          </p>
        </div>
      )}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Consultation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start a consultation in {selectedRoomData?.name} with {selectedPatient?.name}? This will mark the room as occupied and begin the session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartConsultation} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Consultation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StartConsultation;