// types/consultation.ts
// Explanatory Comments:
// - Defines shared types for consultation-related components to avoid TS2307 errors.
// - Aligned with backend ConsultationRoom, ConsultationSession, and Patient models.
// - Ensures consistency across start-consultation, consultationsession, and consultationroom components.

export interface VitalsData {
  id?: string;
  height?: string;
  weight?: string;
  temperature?: string;
  pulse?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  fbs?: string;
  bodymassindex?: string;
  recordedAt?: string;
  recordedBy?: string;
}

export interface ConsultationProgress {
  notes: boolean;
  vitals: boolean;
  assessment: boolean;
  plan: boolean;
  lab: boolean;
  prescriptions: boolean;
  nursing: boolean;
  referrals: boolean;
  history: boolean;
  systemic: boolean;
  radiology: boolean;
}

export interface Patient {
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
  assignmentStatus: "Assigned" | "Unassigned" | "In Progress";
  waitTime: number;
  vitalsCompleted: boolean;
  sentFromNurse?: boolean;
  priority: "Emergency" | "High" | "Medium" | "Low";
  visitDate: string;
  visitTime: string;
  vitals?: VitalsData;
  vitalsAlerts?: string[];
}

export interface ConsultationRoom {
  id: string;
  name: string;
  status: "available" | "occupied" | "maintenance";
  assignedDoctorId?: string;
  currentPatientId?: string;
  currentPatient?: string;
  startTime?: string;
  endTime?: string;
  specialtyFocus?: string;
  totalConsultationsToday?: number;
  averageConsultationTime?: number;
  lastPatient?: string;
  doctor?: { id: string; name: string; email: string; role: string };
}

export interface ConsultationSession {
  id: string;
  room: ConsultationRoom;
  doctor: { id: string; name: string; email: string; role: string };
  patient: Patient;
  startTime: string;
  endTime?: string;
  notes?: string;
  vitalsData?: VitalsData;
  labOrders?: any;
  prescriptions?: any;
  status: "active" | "completed" | "cancelled";
  rescheduledDate?: string;
}