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
  normalRange: string;
  required: boolean;
}

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

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
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

  const bmi = parseFloat(formData.bodymassindex) || null;

  // Vital signs configuration
  const vitalSigns = [
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

  return (
    <form onSubmit={handleSubmit}>
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
              {vitalSigns.map((vital) => (
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
                      value={formData[vital.id as keyof VitalsData] || ''}
                      onChange={handleChange}
                      required={vital.required}
                      placeholder={vital.placeholder}
                    />
                  </div>
                </div>
              ))}
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
              {bmi && (
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