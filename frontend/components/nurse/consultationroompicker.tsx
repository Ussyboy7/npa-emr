"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Room {
  id: string;
  name: string;
  status: "available" | "occupied";
}

interface Props {
  isOpen: boolean;
  onClose: () => void; // Optional if handled by parent dialog
  onSelectRoom: (roomId: string) => void;
  rooms: Room[];
}

const ConsultationRoomPicker: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectRoom,
  rooms,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 space-y-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.length > 0 ? (
          rooms.map((room) => {
            const isOccupied = room.status === "occupied";

            return (
              <Card
                key={room.id}
                onClick={() => {
                  if (!isOccupied) onSelectRoom(room.id);
                }}
                className={`transition ${
                  isOccupied
                    ? "bg-red-100 text-red-800 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="text-xs">{room.status}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            No rooms found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoomPicker;
