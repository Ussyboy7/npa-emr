// app/consultation/room/[roomId]/page.tsx
import { notFound } from "next/navigation";
import ConsultationRoom from "@/components/consultation/consultationroom";
import { ConsultationRoom as Room } from "@/types/consultation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchRoom(roomId: string): Promise<Room | null> {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching room ${roomId}:`, error);
    return null;
  }
}

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const room = await fetchRoom(params.roomId);

  if (!room) {
    notFound();
  }

  return <ConsultationRoom room={room} />;
}