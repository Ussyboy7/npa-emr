"use client";

import React, { useState, useEffect } from "react";
import {
  Syringe,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  FileText,
  Save,
} from "lucide-react";
import { routes, injectionsites, dosageunits } from "@/lib/constants";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Data type for injection
export interface InjectionData {
  medication: string;
  dosage: string;
  dosageUnit: string;
  route: string;
  site: string;
  indication: string;
  administrationDate: string;
  administrationTime: string;
  comment?: string;
  isControlledSubstance: boolean;
  witnessRequired: boolean;
  witnessName?: string;
  adverseReaction: boolean;
  reactionDetails?: string;
}

// Props from parent
interface InjectionFormProps {
  onSubmit: (data: InjectionData) => void;
  initialData?: InjectionData;
  patientName?: string;
  currentNurse?: string;
}

interface FormField {
  id: keyof InjectionData;
  label: string;
  type: "input" | "select" | "textarea" | "checkbox" | "date" | "time";
  required: boolean;
  icon?: React.ReactNode;
  options?: string[];
  placeholder?: string;
  gridSpan?: 1 | 2;
}

// Predefined options
const medications = [
  "Insulin", "Vitamin B12", "Ceftriaxone", "Morphine", "Influenza Vaccine",
  "Tetanus Vaccine", "COVID-19 Vaccine", "Hepatitis B Vaccine",
  "Penicillin", "Epinephrine", "Dexamethasone", "Heparin",
  "Other (specify in comments)"
];

const controlledMeds = ["Morphine", "Fentanyl", "Oxycodone", "Midazolam"];

export default function InjectionForm({
  onSubmit,
  initialData,
  patientName = "Selected Patient",
  currentNurse = "Current User",
}: InjectionFormProps) {
  const [formData, setFormData] = useState<InjectionData>({
    medication: "",
    dosage: "",
    dosageUnit: "mg",
    route: "",
    site: "",
    indication: "",
    administrationDate: new Date().toISOString().split("T")[0],
    administrationTime: new Date().toTimeString().slice(0, 5),
    comment: "",
    isControlledSubstance: false,
    witnessRequired: false,
    witnessName: "",
    adverseReaction: false,
    reactionDetails: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const baseFields: FormField[] = [
    {
      id: "medication",
      label: "Medication",
      type: "select",
      required: true,
      icon: <Syringe className="h-4 w-4 text-muted-foreground" />,
      options: medications,
    },
    {
      id: "dosage",
      label: "Dosage",
      type: "input",
      required: true,
      placeholder: "Enter dosage amount",
    },
    {
      id: "route",
      label: "Route",
      type: "select",
      required: true,
      options: routes,
    },
    {
      id: "site",
      label: "Injection Site",
      type: "select",
      required: true,
      options: injectionsites,
    },
    {
      id: "administrationDate",
      label: "Administration Date",
      type: "date",
      required: true,
      icon: <Calendar className="h-4 w-4 text-gray-500" />,
    },
    {
      id: "administrationTime",
      label: "Administration Time",
      type: "time",
      required: true,
      icon: <Clock className="h-4 w-4 text-gray-500" />,
    },
  ];

  const handleChange = (field: keyof InjectionData, value: string | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "medication" && typeof value === "string") {
        const isControlled = controlledMeds.some((med) => value.includes(med));
        newData.isControlledSubstance = isControlled;
        newData.witnessRequired = isControlled;
      }

      return newData;
    });
  };

  const handleSubmit = () => {
    if (
      !formData.medication ||
      !formData.dosage ||
      !formData.route ||
      !formData.site ||
      !formData.indication
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.isControlledSubstance && !formData.witnessName) {
      alert("Witness name is required for controlled substances");
      return;
    }

    if (formData.adverseReaction && !formData.reactionDetails) {
      alert("Please describe the adverse reaction");
      return;
    }

    onSubmit({
      ...formData,
      comment: formData.comment || "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Injection Administration
        </CardTitle>
        <Syringe className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dynamically rendered fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {baseFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <Label htmlFor={field.id} className="flex items-center gap-1">
                  {field.icon}
                  {field.label} {field.required && "*"}
                </Label>

                {field.type === "select" ? (
                  <Select
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    value={formData[field.id] as string}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>

                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      id={field.id}
                      type={field.type === "input" ? "text" : field.type}
                      step={field.id === "dosage" ? "0.01" : undefined}
                      value={formData[field.id] as string}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        field.id === "dosage" ? "flex-1" : "w-full"
                      }`}
                    />
                    {field.id === "dosage" && (
                      <Select
                        value={formData.dosageUnit}
                        onChange={(e) => handleChange("dosageUnit", e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {dosageunits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Indication */}
          <div className="space-y-1">
            <Label htmlFor="indication" className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4 text-gray-500" />
              Clinical Indication *
            </Label>
            <Input
              id="indication"
              type="text"
              value={formData.indication}
              onChange={(e) => handleChange("indication", e.target.value)}
              placeholder="Reason for injection (e.g., Type 1 Diabetes, Pain management)"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controlled Substance */}
          {formData.isControlledSubstance && (
            <div className="space-y-1">
              <Label htmlFor="witnessName">Witness Name *</Label>
              <Input
                id="witnessName"
                type="text"
                value={formData.witnessName || ""}
                onChange={(e) => handleChange("witnessName", e.target.value)}
                placeholder="Witness name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Adverse Reaction */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="adverseReaction" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Adverse Reaction?
            </Label>
            <input
              type="checkbox"
              id="adverseReaction"
              checked={formData.adverseReaction}
              onChange={() => handleChange("adverseReaction", !formData.adverseReaction)}
              className="h-4 w-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.adverseReaction && (
            <div className="space-y-1">
              <Label htmlFor="reactionDetails" className="text-sm font-medium text-gray-700">
                Reaction Details *
              </Label>
              <Textarea
                id="reactionDetails"
                value={formData.reactionDetails || ""}
                onChange={(e) => handleChange("reactionDetails", e.target.value)}
                placeholder="Please describe the adverse reaction"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Comments Field */}
          <div className="space-y-1">
            <Label htmlFor="comment">Additional Comments</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment || ""}
              onChange={(e) => handleChange("comment", e.target.value)}
              placeholder="Additional comments..."
              className="min-h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Submit Injection</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
