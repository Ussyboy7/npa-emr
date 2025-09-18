export type Priority = "STAT" | "Urgent" | "Routine";
export type Status = "Pending" | "Collected" | "In Progress" | "Results Ready" | "Completed" | "Cancelled";
export type TestType = "In-house" | "Outsourced";
export type ResultStatus = "Normal" | "Abnormal" | "Critical";

export interface LabTest {
  id: string;
  name: string;
  category: string;
  code: string;
  normalRange?: string;
  unit?: string;
  specimenType: string;
  testType: TestType;
  turnaroundTime: string;
  specialInstructions?: string;
}

export interface LabOrder {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  priority: Priority;
  status: Status;
  orderDate: string;
  orderTime: string;
  expectedDate?: string;
  collectionDate?: string;
  collectionTime?: string;
  completedDate?: string;
  completedTime?: string;
  clinicalNotes: string;
  specialInstructions?: string;
  tests: LabTest[];
  age: number;
  gender: string;
  phoneNumber: string;
  clinic: string;
  location: string;
  collectedBy?: string;
  processedBy?: string;
  reviewedBy?: string;
  testResults?: { [testId: string]: TestResult[] };
  testStatuses?: { [testId: string]: Status };
}

export interface TestResult {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: ResultStatus;
  notes?: string;
  methodology?: string;
  instrument?: string;
  referenceValues?: string;
}

export interface LabResult {
  orderId: string;
  testId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  resultDate: string;
  resultTime: string;
  results: TestResult[];
  overallStatus: ResultStatus;
  summary?: string;
  recommendations?: string;
  criticalValues?: string;
  technician: string;
  pathologist?: string;
  isOutsourced: boolean;
  outsourceLab?: string;
  uploadedFiles?: File[];
  templateUsed?: string;
  validationStatus: ValidationStatus;
  validatedBy?: string;
  validatedDate?: string;
  validatedTime?: string;
}

export type ValidationStatus = "Pending" | "Validated";

export interface ResultTemplate {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[];
  headerText: string;
  footerText: string;
  isDefault: boolean;
}

export interface TemplateField {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "textarea" | "range";
  required: boolean;
  defaultValue?: string;
  options?: string[];
  unit?: string;
  normalRange?: string;
}

export interface SampleCollectionForm {
  sampleType: string;
  collectionMethod: string;
  containerType: string;
  volume: string;
  collectionTime: string;
  collectionDate: string;
  fastingStatus: string;
  specialInstructions: string;
  collectedBy: string;
  notes: string;
}