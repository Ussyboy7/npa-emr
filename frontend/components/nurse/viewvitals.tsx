"use client";

import { AlertTriangle, Thermometer, Heart, Activity, Wind, Ruler, Weight, Droplets, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Unified interface for vitals data
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

interface ViewVitalsModalProps {
  record: VitalRecord | null;
  open: boolean;
  onClose: () => void;
}

// Get vital status
const getVitalStatus = (type: string, value: string | undefined): 'normal' | 'high' | 'low' | 'critical' => {
  if (!value || value === '') return 'normal';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'normal'; // Handle invalid numbers
  
  switch (type) {
    case "bloodPressureSystolic":
      if (numValue >= 180) return 'critical';
      if (numValue >= 140) return 'high';
      if (numValue < 90) return 'low';
      return 'normal';
    case "bloodPressureDiastolic":
      if (numValue >= 120) return 'critical';
      if (numValue >= 90) return 'high';
      if (numValue < 60) return 'low';
      return 'normal';
    case "temperature":
      if (numValue >= 39) return 'critical';
      if (numValue >= 38) return 'high';
      if (numValue < 36) return 'low';
      return 'normal';
    case "pulse":
      if (numValue >= 120) return 'critical';
      if (numValue >= 100) return 'high';
      if (numValue < 60) return 'low';
      return 'normal';
    case "respiratoryRate":
      if (numValue >= 30) return 'critical';
      if (numValue >= 20) return 'high';
      if (numValue < 12) return 'low';
      return 'normal';
    case "oxygenSaturation":
      if (numValue < 90) return 'critical';
      if (numValue < 95) return 'low';
      return 'normal';
    case "fbs":
      if (numValue >= 400) return 'critical';
      if (numValue >= 126) return 'high';
      if (numValue < 70) return 'low';
      return 'normal';
    case "rbs":
      if (numValue >= 400) return 'critical';
      if (numValue >= 200) return 'high';
      if (numValue < 70) return 'low';
      return 'normal';
    case "painScale":
      if (numValue >= 8) return 'critical';
      if (numValue >= 5) return 'high';
      return 'normal';
    default:
      return 'normal';
  }
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "normal":
      return "bg-green-100 text-green-700 border-green-200";
    case "low":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  if (status === "critical") return <AlertTriangle className="h-4 w-4" />;
  if (status === "high") return <TrendingUp className="h-4 w-4" />;
  if (status === "low") return <TrendingDown className="h-4 w-4" />;
  return null;
};

// Get BMI category
const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export function ViewVitalsModal({ record, open, onClose }: ViewVitalsModalProps) {
  if (!record) return null;
  const { vitals } = record;
  const bmi = parseFloat(vitals.bodymassindex) || 0;
  
  // Vital signs configuration
  const vitalSigns = [
    {
      id: 'temperature',
      label: 'Temperature',
      unit: '°C',
      icon: <Thermometer className="h-4 w-4" />,
      value: vitals.temperature,
      status: getVitalStatus('temperature', vitals.temperature),
      required: true,
      placeholder: '36.5'
    },
    {
      id: 'bloodPressureSystolic',
      label: 'Systolic BP',
      unit: 'mmHg',
      icon: <Heart className="h-4 w-4" />,
      value: vitals.bloodPressureSystolic,
      status: getVitalStatus('bloodPressureSystolic', vitals.bloodPressureSystolic),
      required: true,
      placeholder: '120'
    },
    {
      id: 'bloodPressureDiastolic',
      label: 'Diastolic BP',
      unit: 'mmHg',
      icon: <Heart className="h-4 w-4" />,
      value: vitals.bloodPressureDiastolic,
      status: getVitalStatus('bloodPressureDiastolic', vitals.bloodPressureDiastolic),
      required: true,
      placeholder: '80'
    },
    {
      id: 'pulse',
      label: 'Pulse',
      unit: 'bpm',
      icon: <Activity className="h-4 w-4" />,
      value: vitals.pulse,
      status: getVitalStatus('pulse', vitals.pulse),
      required: true,
      placeholder: '72'
    },
    {
      id: 'respiratoryRate',
      label: 'Respiratory Rate',
      unit: '/min',
      icon: <Wind className="h-4 w-4" />,
      value: vitals.respiratoryRate,
      status: getVitalStatus('respiratoryRate', vitals.respiratoryRate),
      required: true,
      placeholder: '16'
    },
    {
      id: 'oxygenSaturation',
      label: 'Oxygen Saturation',
      unit: '%',
      icon: <Droplets className="h-4 w-4" />,
      value: vitals.oxygenSaturation,
      status: getVitalStatus('oxygenSaturation', vitals.oxygenSaturation),
      required: false,
      placeholder: '98'
    },
    {
      id: 'height',
      label: 'Height',
      unit: 'cm',
      icon: <Ruler className="h-4 w-4" />,
      value: vitals.height,
      status: 'normal' as const,
      required: false,
      placeholder: '170'
    },
    {
      id: 'weight',
      label: 'Weight',
      unit: 'kg',
      icon: <Weight className="h-4 w-4" />,
      value: vitals.weight,
      status: 'normal' as const,
      required: false,
      placeholder: '70'
    },
    {
      id: 'fbs',
      label: 'FBS',
      unit: 'mg/dL',
      icon: <Droplets className="h-4 w-4" />,
      value: vitals.fbs,
      status: getVitalStatus('fbs', vitals.fbs),
      required: false,
      placeholder: '90'
    },
    {
      id: 'rbs',
      label: 'RBS',
      unit: 'mg/dL',
      icon: <Droplets className="h-4 w-4" />,
      value: vitals.rbs,
      status: getVitalStatus('rbs', vitals.rbs),
      required: false,
      placeholder: '120'
    },
    {
      id: 'painScale',
      label: 'Pain Scale',
      unit: '/10',
      icon: <AlertTriangle className="h-4 w-4" />,
      value: vitals.painScale,
      status: getVitalStatus('painScale', vitals.painScale),
      required: false,
      placeholder: '0'
    },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Vital Records for {record.patientName}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Patient Info Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-lg text-gray-900">{record.patientName}</p>
              <p className="text-sm text-gray-600">
                Personal Number: {record.personalNumber}
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(record.date).toLocaleDateString()} at {record.time}
              </p>
              <p className="text-xs text-gray-500">Recorded by: {record.recordedBy}</p>
            </div>
            {record.alerts.length > 0 && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                <div className="text-right">
                  <div className="text-sm font-medium text-red-700 mb-1">Health Alerts:</div>
                  {record.alerts.map((alert: string, index: number) => (
                    <span key={index} className="block text-xs text-red-600 bg-red-100 px-2 py-1 rounded mb-1">
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Vital Signs Grid */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800">Vital Signs</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vitalSigns.map((vital) => (
                <div 
                  key={vital.id} 
                  className={`p-4 rounded-lg border ${getStatusColor(vital.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      {vital.icon}
                      {vital.label}
                    </Label>
                    {getStatusIcon(vital.status)}
                  </div>
                  <p className="text-lg font-semibold">
                    {vital.value || "Not recorded"}
                  </p>
                  <p className="text-xs opacity-75">{vital.unit}</p>
                </div>
              ))}
            </div>
            
            {/* BMI Display */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Weight className="h-4 w-4" />
                Body Mass Index (kg/m²)
              </Label>
              <div className="p-4 rounded-lg border bg-gray-50">
                <p className="text-lg font-semibold text-gray-900">
                  {vitals.bodymassindex || "Not calculated"}
                </p>
                {bmi > 0 && (
                  <p className="text-sm text-gray-500">
                    Category: {getBMICategory(bmi)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Comments section */}
            {vitals.comment && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Comments</Label>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {vitals.comment}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}