"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import VitalsSection from "./vitalssection";
import ConsultationRoomPicker from "@/components/nurse/consultationroompicker";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  nextOfKin?: string;
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
}

interface ConsultationRoom {
  id: string;
  name: string;
  status: "available" | "occupied" | "unavailable" ;
  currentPatient?: string;
  consultationStartTime?: string;
  estimatedEndTime?: string;
  doctor?: {
    id: string;
    name: string;
  };
  specialtyFocus?: string;
  totalConsultationsToday?: number;
  averageConsultationTime?: number;
  lastPatient?: string;
  queue?: any[];
}

interface ConsultationRoomProps {
  room: ConsultationRoom;
}

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ room }) => {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showRoomQueueModal, setShowRoomQueueModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState<number>(0);
  const [allRooms, setAllRooms] = useState<ConsultationRoom[]>([]);

  // Fetch all rooms from API
  const fetchAllRooms = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAllRooms(data.results || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, []);

  // Fetch patients assigned to this room
  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/?consultation_room=${room.id}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data.results || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  }, [room.id]);

  useEffect(() => {
    fetchPatients();
    if (room.startTime) {
      const interval = setInterval(() => {
        const start = new Date(room.startTime!);
        const now = new Date();
        const minutesElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
        setSessionTimeElapsed(minutesElapsed);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [room.startTime, fetchPatients]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "occupied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string): string => {
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

  const formatTimeElapsed = (minutes: number) => {
    return `${minutes} min`;
  };

  const getMinutesDifference = (visitDate: string, visitTime: string, toDate: Date = new Date()): number => {
    const from = new Date(`${visitDate}T${visitTime}Z`);
    if (isNaN(from.getTime())) return 0;
    return Math.floor((toDate.getTime() - from.getTime()) / (1000 * 60));
  };

  const handleStartWithPatient = async (patient: Patient) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          room: room.id,
          patient: patient.patientId,
          doctor: "current-doctor-id", // Replace with actual doctor ID
          start_time: new Date().toISOString(),
          status: "active",
        }),
      });
      if (response.ok) {
        setCurrentPatient(patient);
        setShowRoomQueueModal(false);
        await fetch(`${API_URL}/api/rooms/${room.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: "occupied",
            current_patient: patient.patientId,
            start_time: new Date().toISOString(),
          }),
        });
        router.push(`/consultation/session/${patient.visitId}`);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const handleStartWithNextPatient = async () => {
    const waitingPatients = patients
      .filter((p) => (p.assignmentStatus === "Assigned" || p.assignmentStatus === "Queued") && p.consultationRoom === room.id)
      .sort((a, b) => {
        const priorityOrder = { Emergency: 1, High: 2, Medium: 3, Low: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || getMinutesDifference(a.visitDate, a.visitTime) - getMinutesDifference(b.visitDate, b.visitTime);
      });

    const nextPatient = waitingPatients[0];
    if (nextPatient) {
      await handleStartWithPatient(nextPatient);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>
                  {room.specialtyFocus && `${room.specialtyFocus} • `}
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(room.status)}>
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </Badge>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Today: {room.totalConsultationsToday || 0} consultations • Avg: {room.averageConsultationTime || 0} min
            {room.lastPatient && ` • Last Patient: ${room.lastPatient}`}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => {
              fetchAllRooms();
              setShowRoomQueueModal(true);
            }}>
              <Users className="mr-2 h-4 w-4" />
              View Queue
            </Button>
            {room.status === "available" && (
              <Button onClick={handleStartWithNextPatient} disabled={patients.length === 0}>
                Start with Next Patient
              </Button>
            )}
          </div>
          {currentPatient && (
            <div className="mt-4">
              <VitalsSection
                visitId={currentPatient.visitId}
                vitals={currentPatient.vitals}
                patientId={currentPatient.patientId}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRoomQueueModal} onOpenChange={setShowRoomQueueModal}>
        <DialogContent className="max-w-5xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{room.name} Queue</DialogTitle>
            <DialogDescription>Patients waiting for {room.name}</DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>
                      {room.doctor && `${room.doctor.name}`}
                      {room.specialtyFocus && ` • ${room.specialtyFocus}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(room.status)}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {room.currentPatient && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Currently Consulting</span>
                    <Badge className={getPriorityColor(room.patient.priority)}>
                      {room.patient.priority}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{room.patient.name}</div>
                    <div className="text-gray-600">{room.patient.chiefComplaint}</div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Duration: {formatTimeElapsed(sessionTimeElapsed)}</span>
                      {room.startTime && (
                        <span>
                          Started: {new Date(room.startTime).toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Waiting Patients ({patients.filter((p) => (p.assignmentStatus === "Assigned" || p.assignmentStatus === "Queued") && p.consultationRoom === room.id).length})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartWithNextPatient}
                    disabled={patients.filter((p) => (p.assignmentStatus === "Assigned" || p.assignmentStatus === "Queued") && p.consultationRoom === room.id).length === 0}
                  >
                    Start with Next Patient
                  </Button>
                </div>
                {patients.filter((p) => (p.assignmentStatus === "Assigned" || p.assignmentStatus === "Queued") && p.consultationRoom === room.id).length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {patients
                      .filter((p) => (p.assignmentStatus === "Assigned" || p.assignmentStatus === "Queued") && p.consultationRoom === room.id)
                      .sort((a, b) => {
                        const priorityOrder = { Emergency: 1, High: 2, Medium: 3, Low: 4 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority] || getMinutesDifference(a.visitDate, a.visitTime) - getMinutesDifference(b.visitDate, b.visitTime);
                      })
                      .map((patient, index) => (
                        <div key={patient.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <Badge className={getPriorityColor(patient.priority)} variant="outline">
                                {patient.priority}
                              </Badge>
                              {patient.vitalsCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                              {patient.sentFromNurse && (
                                <Badge className="bg-green-100 text-green-800 text-xs" variant="outline">
                                  From Nurse
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartWithPatient(patient)}
                            >
                              Start Consultation
                            </Button>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-gray-600">{patient.chiefComplaint}</div>
                            <div className="text-xs text-gray-500">
                              Wait Time: {formatTimeElapsed(getMinutesDifference(patient.visitDate, patient.visitTime))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No patients in queue</div>
                )}
              </div>
              
              {/* Add ConsultationRoomPicker to view other rooms */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Other Consultation Rooms</h4>
                <ConsultationRoomPicker
                  isOpen={showRoomQueueModal}
                  onClose={() => setShowRoomQueueModal(false)}
                  onSelectRoom={(roomId) => {
                    // Handle room selection if needed
                    console.log(`Selected room: ${roomId}`);
                  }}
                  rooms={allRooms} 
                  title="All Consultation Rooms"
                  description="View all available consultation rooms and their status"
                />
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationRoom;