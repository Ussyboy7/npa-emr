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
  height: string;
  weight: string;
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  bloodPressure: string;
  oxygenSaturation: string;
  fbs: string;
  rbs: string;
  comment?: string;
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
    bloodPressure: "",
    oxygenSaturation: "",
    fbs: "",
    rbs: "",
    comment: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const vitals: VitalSign[] = [
    {
      id: "bloodPressure",
      label: "Blood Pressure",
      unit: "mmHg",
      icon: <Heart className="h-4 w-4 text-muted-foreground" />,
      normalRange: "120/80 - 140/90",
      required: true,
    },
    {
      id: "temperature",
      label: "Temperature",
      unit: "°C",
      icon: <Thermometer className="h-4 w-4 text-muted-foreground" />,
      normalRange: "36.1 - 37.2",
      required: true,
    },
    {
      id: "pulse",
      label: "Pulse",
      unit: "bpm",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      normalRange: "60 - 100",
      required: true,
    },
    {
      id: "respiratoryRate",
      label: "Respiratory Rate",
      unit: "/min",
      icon: <Wind className="h-4 w-4 text-muted-foreground" />,
      normalRange: "12 - 20",
      required: true,
    },
    {
      id: "height",
      label: "Height",
      unit: "cm",
      icon: <Ruler className="h-4 w-4 text-muted-foreground" />,
      normalRange: "-",
      required: false,
    },
    {
      id: "weight",
      label: "Weight",
      unit: "kg",
      icon: <Weight className="h-4 w-4 text-muted-foreground" />,
      normalRange: "-",
      required: false,
    },
    {
      id: "oxygenSaturation",
      label: "Oxygen Saturation",
      unit: "%",
      icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
      normalRange: "95 - 100",
      required: false,
    },
    {
      id: "fbs",
      label: "FBS",
      unit: "mg/dL",
      icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
      normalRange: "70 - 99",
      required: false,
    },
    {
      id: "rbs",
      label: "RBS",
      unit: "mg/dL",
      icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
      normalRange: "70 - 140",
      required: false,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      comment: formData.comment ?? "",
    });
  };

  return (
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Vital Signs Recording
        </CardTitle>
        <Thermometer className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dynamically rendered fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vitals.map((vital) => (
              <div key={vital.id} className="space-y-1">
                <Label htmlFor={vital.id} className="flex items-center gap-1">
                  {vital.icon}
                  {vital.label} ({vital.unit})
                </Label>
                <Input
                  id={vital.id}
                  name={vital.id}
                  value={formData[vital.id] || ""}
                  onChange={handleChange}
                  required={vital.required}
                />
                <p className="text-xs text-muted-foreground">
                  Normal Range: {vital.normalRange}
                </p>
              </div>
            ))}
          </div>

          {/* Comments Field */}
          <div className="space-y-1">
            <Label htmlFor="comment">Additional Comments</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment || ""}
              onChange={handleChange}
              placeholder="Additional Comments..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Submit Vitals</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
