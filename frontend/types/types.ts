// types/index.ts
export interface Patient {
  nextOfKin: any;
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  personalNumber: string;
  phoneNumber: string;
  employeeCategory: string;
  clinic: string;
  visitType: string;
  priority: "Emergency" | "High" | "Medium" | "Low";
  chiefComplaint: string;
  allergies: string[];
  riskFactors?: string[];
  assignedAt: string;
  waitTime: number;
  vitalsCompleted: boolean;
  nurseNotes?: string;
  emergencyContact?: string;
  location?: string;
  assignmentStatus: "Assigned" | "Unassigned" | "In Progress";
  assignedTo?: string;
  consultationRoom?: string;
  sentFromNurse?: boolean;
  // Additional properties for medical records
  blood_group?: string;
  genotype?: string;
  patient_type?: string;
  non_npa_type?: string;
  last_visit?: string;
  created_at?: string;
}

export interface ConsultationRoom {
  id: string;
  name: string;
  status: "occupied" | "available";
  doctor?: string;
  currentPatient?: Patient;
  consultationStartTime?: string;
  estimatedEndTime?: string;
  queue: Patient[];
  totalConsultationsToday: number;
  averageConsultationTime: number;
  lastPatientEndTime?: string;
  specialtyFocus?: string;
}

// Additional types used in the application
export interface NextOfKin {
  firstName: string;
  lastName: string;
  relationship: string;
  address: string;
  phone: string;
}

export interface VitalReading {
  id: string;
  patient: string;
  date: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  bloodSugar?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  recordedBy: string;
}

export interface MedicalReport {
  id: string;
  patient: string;
  fileNumber: string;
  reportName: string;
  reportType: string;
  date: string;
  doctor: string;
  status: "completed" | "pending" | "cancelled";
  downloadUrl?: string;
}

export interface Visit {
  id: string;
  patient: string;
  patientName: string;
  personalNumber: string;
  clinic: string;
  visitTime: string;
  visitDate: string;
  visitType: string;
  visitLocation: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: "Scheduled" | "Confirmed" | "In Progress" | "In Nursing Pool" | "Completed" | "Cancelled" | "Rescheduled";
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  assignedNurse?: string;
  nursingReceivedAt?: string;
}

export interface TimelineEvent {
  id: string;
  patient: string;
  date: string;
  time: string;
  type: "registration" | "nursing" | "consultation" | "laboratory" | "radiology" | "pharmacy" | "discharge" | "admission";
  title: string;
  description: string;
  location: string;
  staff: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  duration?: number;
  notes?: string;
  relatedRecordId?: string;
}