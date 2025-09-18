export interface VitalsData {
  id?: string;
  height: string;
  weight: string;
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  oxygenSaturation: string;
  fbs: string;
  rbs: string;
  painScale: string;
  bodymassindex: string;
  comment?: string;
  recordedAt?: string;
  recordedBy?: string;
}

export interface VitalRecord {
  id: string;
  patientName: string;
  personalNumber: string;
  date: string;
  time: string;
  vitals: VitalsData;
  recordedBy: string;
  alerts: string[];
}