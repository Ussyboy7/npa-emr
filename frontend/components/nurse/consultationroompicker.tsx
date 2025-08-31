"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle 
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  status: "available" | "occupied" | "maintenance" | "reserved";
  currentPatient?: string;
  estimatedTime?: string;
  doctor?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
  rooms: Room[];
  title?: string;
  description?: string;
}

const ConsultationRoomPicker: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectRoom,
  rooms,
  title = "Select Consultation Room",
  description = "Choose an available consultation room for the patient"
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "occupied":
        return <Users className="h-4 w-4 text-red-600" />;
      case "maintenance":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "reserved":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "maintenance":
        return "Maintenance";
      case "reserved":
        return "Reserved";
      default:
        return "Unknown";
    }
  };

  const availableRooms = rooms.filter(room => room.status === "available");
  const occupiedRooms = rooms.filter(room => room.status === "occupied");
  const otherRooms = rooms.filter(room => !["available", "occupied"].includes(room.status));

  return (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{availableRooms.length}</div>
          <div className="text-xs text-green-700">Available</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{occupiedRooms.length}</div>
          <div className="text-xs text-red-700">Occupied</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{otherRooms.length}</div>
          <div className="text-xs text-gray-700">Other</div>
        </div>
      </div>

      {/* Available Rooms */}
      {availableRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Available Rooms ({availableRooms.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableRooms.map((room) => (
              <Card
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-green-200 hover:border-green-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                    <Badge className={getStatusColor(room.status)}>
                      {getStatusIcon(room.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Ready for consultation
                    </div>
                    {room.doctor && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-blue-600" />
                        Dr. {room.doctor}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Occupied Rooms */}
      {occupiedRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-red-600" />
            Occupied Rooms ({occupiedRooms.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {occupiedRooms.map((room) => (
              <Card
                key={room.id}
                className="cursor-not-allowed opacity-75 border-2 border-red-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                    <Badge className={getStatusColor(room.status)}>
                      {getStatusIcon(room.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {room.currentPatient && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-red-600" />
                        {room.currentPatient}
                      </div>
                    )}
                    {room.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-600" />
                        Est. {room.estimatedTime}
                      </div>
                    )}
                    {room.doctor && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-blue-600" />
                        Dr. {room.doctor}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Rooms (Maintenance, Reserved, etc.) */}
      {otherRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            Other Rooms ({otherRooms.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherRooms.map((room) => (
              <Card
                key={room.id}
                className="cursor-not-allowed opacity-75 border-2 border-gray-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                    <Badge className={getStatusColor(room.status)}>
                      {getStatusIcon(room.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(room.status)}
                      {getStatusText(room.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Rooms Available */}
      {rooms.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
          <p className="text-sm text-gray-600">
            All consultation rooms are currently occupied or unavailable.
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {availableRooms.length === 0 && (
          <Button disabled variant="outline">
            No Rooms Available
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoomPicker;
