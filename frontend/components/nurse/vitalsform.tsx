"use client";
import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Heart,
  Activity,
  Wind,
  Ruler,
  Weight,
  Droplets,
  Save,
  AlertTriangle,
  WeightIcon,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Data type for vitals ---
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

// --- Props for parent ---
interface VitalsFormProps {
  onSubmit: (data: VitalsData) => void;
  initialData?: VitalsData;
}

interface VitalSign {
  id: keyof VitalsData;
  label: string;
  unit: string;
  icon: React.ReactNode;
  required: boolean;
  placeholder: string;
}

// Get vital status
const getVitalStatus = (type: string, value: string): 'normal' | 'high' | 'low' | 'critical' => {
  if (!value || value === '') return 'normal';
  
  const numValue = parseFloat(value);
  
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

export default function VitalsForm({ onSubmit, initialData }: VitalsFormProps) {
  const [formData, setFormData] = useState<VitalsData>({
    height: "",
    weight: "",
    temperature: "",
    pulse: "",
    respiratoryRate: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    oxygenSaturation: "",
    fbs: "",
    rbs: "",
    painScale: "",
    bodymassindex: "",
    comment: "",
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);
  
  // BMI calculation
  const calculateBMI = (height: string, weight: string): string => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (weightNum && heightNum) {
      const heightInM = heightNum / 100;
      const bmiValue = weightNum / (heightInM * heightInM);
      return bmiValue.toFixed(2);
    }
    return "";
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'height' || name === 'weight') {
        newData.bodymassindex = calculateBMI(
          name === 'height' ? value : prev.height,
          name === 'weight' ? value : prev.weight
        );
      }
      return newData;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      comment: formData.comment ?? "",
    });
  };
  
  const bmi = parseFloat(formData.bodymassindex) || 0;
  
  // Vital signs configuration
  const vitalSigns: VitalSign[] = [
    {
      id: 'temperature',
      label: 'Temperature',
      unit: '°C',
      icon: <Thermometer className="h-4 w-4" />,
      required: true,
      placeholder: '36.5'
    },
    {
      id: 'bloodPressureSystolic',
      label: 'Systolic BP',
      unit: 'mmHg',
      icon: <Heart className="h-4 w-4" />,
      required: true,
      placeholder: '120'
    },
    {
      id: 'bloodPressureDiastolic',
      label: 'Diastolic BP',
      unit: 'mmHg',
      icon: <Heart className="h-4 w-4" />,
      required: true,
      placeholder: '80'
    },
    {
      id: 'pulse',
      label: 'Pulse',
      unit: 'bpm',
      icon: <Activity className="h-4 w-4" />,
      required: true,
      placeholder: '72'
    },
    {
      id: 'respiratoryRate',
      label: 'Respiratory Rate',
      unit: '/min',
      icon: <Wind className="h-4 w-4" />,
      required: true,
      placeholder: '16'
    },
    {
      id: 'oxygenSaturation',
      label: 'Oxygen Saturation',
      unit: '%',
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: '98'
    },
    {
      id: 'height',
      label: 'Height',
      unit: 'cm',
      icon: <Ruler className="h-4 w-4" />,
      required: false,
      placeholder: '170'
    },
    {
      id: 'weight',
      label: 'Weight',
      unit: 'kg',
      icon: <Weight className="h-4 w-4" />,
      required: false,
      placeholder: '70'
    },
    {
      id: 'fbs',
      label: 'FBS',
      unit: 'mg/dL',
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: '90'
    },
    {
      id: 'rbs',
      label: 'RBS',
      unit: 'mg/dL',
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: '120'
    },
    {
      id: 'painScale',
      label: 'Pain Scale',
      unit: '/10',
      icon: <AlertTriangle className="h-4 w-4" />,
      required: false,
      placeholder: '0'
    },
  ];
  
  // Critical alerts
  const criticalAlerts = vitalSigns
    .filter(vital => getVitalStatus(vital.id, formData[vital.id] || '') === 'critical')
    .map(vital => `Critical ${vital.label}: ${formData[vital.id]} ${vital.unit}`);
  
  return (
    <form onSubmit={handleSubmit}>
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong className="text-red-800">Critical Values Alert:</strong>
            <ul className="mt-2 space-y-1">
              {criticalAlerts.map((alert, index) => (
                <li key={index} className="text-red-700">• {alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Record New Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vitalSigns.map((vital) => {
                const value = formData[vital.id] || '';
                const status = getVitalStatus(vital.id, value);
                return (
                  <div key={vital.id} className="space-y-2">
                    <Label htmlFor={vital.id} className="flex items-center gap-2">
                      {vital.icon}
                      {vital.label} ({vital.unit})
                      {vital.required && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={vital.id}
                        name={vital.id}
                        type="number"
                        step="0.1"
                        value={value}
                        onChange={handleChange}
                        required={vital.required}
                        placeholder={vital.placeholder}
                      />
                      {value && (
                        <Badge 
                          className={`absolute -top-2 -right-2 px-1 py-0 text-xs ${getStatusColor(status)}`}
                        >
                          {getStatusIcon(status)}
                          {status}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* BMI Display */} 
            <div className="space-y-2">
              <Label htmlFor="bodymassindex" className="flex items-center gap-2">
                <WeightIcon className="h-4 w-4" />
                Body Mass Index (kg/m²)
              </Label>
              <Input
                id="bodymassindex"
                name="bodymassindex"
                type="text"
                value={formData.bodymassindex}
                readOnly
              />
              {bmi > 0 && (
                <p className="text-sm text-gray-500">
                  Category: {getBMICategory(bmi)}
                </p>
              )}
            </div>
            
            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comment">Additional Comments</Label>
              <Textarea
                id="comment"
                name="comment"
                value={formData.comment || ''}
                onChange={handleChange}
                placeholder="Additional observations or notes..."
                className="min-h-[80px]"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Submit Vitals</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}