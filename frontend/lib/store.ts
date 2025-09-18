// lib/store.ts
import {create} from "zustand";
import { Patient, ConsultationRoom } from "@/types/types"; // Define types in a separate file

interface Store {
  patients: Patient[];
  rooms: ConsultationRoom[];
  setPatients: (patients: Patient[]) => void;
  setRooms: (rooms: ConsultationRoom[]) => void;
}

export const useStore = create<Store>((set: (arg0: { patients?: any; rooms?: any; }) => any) => ({
  patients: [], // Initialize with mockPatients or fetch from API
  rooms: [], // Initialize with mockRooms or fetch from API
  setPatients: (patients: any) => set({ patients }),
  setRooms: (rooms: any) => set({ rooms }),
}));