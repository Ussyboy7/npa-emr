"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, User, CheckCircle } from "lucide-react";

/**
 * Hardcoded 6 consultation rooms.
 * Adjust or load dynamically as needed.
 */
const consultationRooms = [
  {
    id: "CR-001",
    name: "Consultation Room 1",
    status: "occupied",
    patient: "John Doe",
    doctor: "Dr. Smith",
    startTime: "09:30",
    estimated: "20 min",
  },
  {
    id: "CR-002",
    name: "Consultation Room 2",
    status: "available",
    patient: null,
    doctor: null,
    startTime: null,
    estimated: null,
  },
  {
    id: "CR-003",
    name: "Consultation Room 3",
    status: "occupied",
    patient: "Jane Smith",
    doctor: "Dr. Wilson",
    startTime: "10:15",
    estimated: "15 min",
  },
  {
    id: "CR-004",
    name: "Consultation Room 4",
    status: "cleaning",
    patient: null,
    doctor: null,
    startTime: null,
    estimated: "5 min",
  },
  {
    id: "CR-005",
    name: "Consultation Room 5",
    status: "available",
    patient: null,
    doctor: null,
    startTime: null,
    estimated: null,
  },
  {
    id: "CR-006",
    name: "Consultation Room 6",
    status: "occupied",
    patient: "Robert Johnson",
    doctor: "Dr. Adams",
    startTime: "11:00",
    estimated: "25 min",
  },
];

/**
 * Return Tailwind classes for room status.
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case "occupied":
      return "bg-red-100 text-red-800";
    case "available":
      return "bg-green-100 text-green-800";
    case "cleaning":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * ConsultationStatus page.
 * 6 rooms. Clean consistent style.
 */
export default function ConsultationStatus() {
  const occupiedCount = consultationRooms.filter(
    (room) => room.status === "occupied"
  ).length;
  const availableCount = consultationRooms.filter(
    (room) => room.status === "available"
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* ---------------------------
           Page Header
      ---------------------------- */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Consultation Room Status
        </h2>
        <Button>Refresh Status</Button>
      </div>

      {/* ---------------------------
           Summary Cards
      ---------------------------- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultationRooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Consultation rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedCount}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
            <p className="text-xs text-muted-foreground">Ready for patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 min</div>
            <p className="text-xs text-muted-foreground">Per consultation</p>
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------
           Room Cards List
      ---------------------------- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consultationRooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <CardDescription>Room ID: {room.id}</CardDescription>
                </div>
                <Badge className={getStatusColor(room.status)}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {room.status === "occupied" && (
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Patient:</span> {room.patient}
                  </div>
                  <div>
                    <span className="font-medium">Doctor:</span> {room.doctor}
                  </div>
                  <div>
                    <span className="font-medium">Start Time:</span>{" "}
                    {room.startTime}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Duration:</span>{" "}
                    {room.estimated}
                  </div>
                </div>
              )}

              {room.status === "available" && (
                <p className="text-sm text-muted-foreground">
                  Room is ready for next patient.
                </p>
              )}

              {room.status === "cleaning" && (
                <p className="text-sm text-muted-foreground">
                  Room is being prepared — estimated: {room.estimated}.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}