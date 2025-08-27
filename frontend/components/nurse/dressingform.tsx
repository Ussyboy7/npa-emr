"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Stethoscope,
  Eye,
  FileText,
  Save,
  Shield,
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// --- Data type for dressing ---
export interface DressingFormData {
  woundType: string;
  location: string;
  dressingType: string;
  woundCondition: string;
  observations?: string;
}

// --- Props for parent ---
interface DressingFormProps {
  onSubmit: (data: DressingFormData) => void;
  initialData?: DressingFormData;
}

interface DressingField {
  id: keyof DressingFormData;
  label: string;
  type: 'text' | 'select' | 'textarea';
  icon: React.ReactNode;
  required: boolean;
  placeholder: string;
  options?: { value: string; label: string }[];
}

export default function DressingForm({ onSubmit, initialData }: DressingFormProps) {
  const [formData, setFormData] = useState<DressingFormData>({
    woundType: "",
    location: "",
    dressingType: "",
    woundCondition: "",
    observations: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const dressingFields: DressingField[] = [
    {
      id: "woundType",
      label: "Wound Type",
      type: "select",
      icon: <Stethoscope className="h-4 w-4 text-muted-foreground" />,
      required: true,
      placeholder: "Select wound type",
      options: [
        { value: "surgical", label: "Surgical" },
        { value: "burn", label: "Burn" },
        { value: "pressure", label: "Pressure Ulcer" },
        { value: "trauma", label: "Trauma" },
      ],
    },
    {
      id: "location",
      label: "Location",
      type: "text",
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      required: true,
      placeholder: "e.g., Left arm, Abdomen",
    },
    {
      id: "dressingType",
      label: "Dressing Type",
      type: "select",
      icon: <Shield className="h-4 w-4 text-muted-foreground" />,
      required: true,
      placeholder: "Select dressing",
      options: [
        { value: "gauze", label: "Gauze" },
        { value: "hydrocolloid", label: "Hydrocolloid" },
        { value: "foam", label: "Foam" },
        { value: "transparent", label: "Transparent Film" },
      ],
    },
    {
      id: "woundCondition",
      label: "Wound Condition",
      type: "select",
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
      required: true,
      placeholder: "Select condition",
      options: [
        { value: "healing", label: "Healing Well" },
        { value: "infected", label: "Signs of Infection" },
        { value: "deteriorating", label: "Deteriorating" },
        { value: "stable", label: "Stable" },
      ],
    },
  ];

  const handleChange = (
    field: keyof DressingFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      observations: formData.observations ?? "",
    });
  };

  const renderField = (field: DressingField) => {
    if (field.type === 'select') {
      return (
        <Select
          onValueChange={(value) => handleChange(field.id, value)}
          value={formData[field.id] || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={field.id}
        name={field.id}
        value={formData[field.id] || ""}
        onChange={(e) => handleChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Wound Dressing Recording
        </CardTitle>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dynamically rendered fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dressingFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <Label htmlFor={field.id} className="flex items-center gap-1">
                  {field.icon}
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Observations Field */}
          <div className="space-y-1">
            <Label htmlFor="observations" className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Observations
            </Label>
            <Textarea
              id="observations"
              name="observations"
              value={formData.observations || ""}
              onChange={(e) => handleChange("observations", e.target.value)}
              placeholder="Document wound appearance, drainage, patient comfort, etc."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Record Dressing Change</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}