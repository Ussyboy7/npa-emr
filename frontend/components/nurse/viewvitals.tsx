"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Dummy helpers (replace or import your real ones)
const getStatusColor = (status: string) => {
  switch (status) {
    case "high":
      return "bg-red-100 text-red-700";
    case "normal":
      return "bg-green-100 text-green-700";
    case "low":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
const getVitalStatus = (type: string, value: string) => {
  // simple dummy logic, replace with your real logic
  if (type === "bloodPressure") {
    // e.g. parse and compare systolic/diastolic here
    if (value === "140/90") return "high";
    return "normal";
  }
  if (type === "temperature") {
    if (parseFloat(value) > 37) return "high";
    return "normal";
  }
  if (type === "pulse") {
    if (parseInt(value) > 100) return "high";
    return "normal";
  }
  if (type === "oxygenSaturation") {
    if (parseInt(value) < 95) return "low";
    return "normal";
  }
  return "normal";
};
const getStatusIcon = (status: string) => {
  if (status === "high") return <AlertTriangle className="text-red-500" />;
  if (status === "low") return <AlertTriangle className="text-yellow-500" />;
  return null;
};

interface VitalRecord {
  id: string;
  patientName: string;
  personalNumber: string;
  date: string;
  time: string;
  bloodPressure: string;
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  height: string; 
  weight: string;
  rbsFbs: string;
  recordedBy: string;
  alerts: string[];
}

interface ViewVitalsModalProps {
  record: VitalRecord | null;
  open: boolean;
  onClose: () => void;
}

export function ViewVitalsModal({ record, open, onClose }: ViewVitalsModalProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vital Records for {record.patientName}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{record.patientName}</p>
              <p className="text-sm text-gray-500">
                {record.personalNumber} • {new Date(record.date).toLocaleDateString()} at {record.time}
              </p>
              <p className="text-xs text-gray-400">Recorded by {record.recordedBy}</p>
            </div>

            {record.alerts.length > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="text-right">
                  {record.alerts.map((alert, index) => (
                    <span
                      key={index}
                      className="block text-xs text-red-600 bg-red-50 px-2 py-1 rounded mb-1"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className={`p-3 rounded-lg ${getStatusColor(getVitalStatus("bloodPressure", record.bloodPressure))}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Blood Pressure</span>
                {getStatusIcon(getVitalStatus("bloodPressure", record.bloodPressure))}
              </div>
              <p className="font-semibold">{record.bloodPressure}</p>
              <p className="text-xs opacity-75">mmHg</p>
            </div>

            <div className={`p-3 rounded-lg ${getStatusColor(getVitalStatus("temperature", record.temperature))}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Temperature</span>
                {getStatusIcon(getVitalStatus("temperature", record.temperature))}
              </div>
              <p className="font-semibold">{record.temperature}</p>
              <p className="text-xs opacity-75">°C</p>
            </div>

            <div className={`p-3 rounded-lg ${getStatusColor(getVitalStatus("pulse", record.pulse))}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Pulse</span>
                {getStatusIcon(getVitalStatus("pulse", record.pulse))}
              </div>
              <p className="font-semibold">{record.pulse}</p>
              <p className="text-xs opacity-75">bpm</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <span className="text-xs font-medium text-gray-600">Respiratory Rate</span>
              <p className="font-semibold text-gray-900">{record.respiratoryRate}</p>
              <p className="text-xs text-gray-500">/min</p>
            </div>

            <div className={`p-3 rounded-lg ${getStatusColor(getVitalStatus("oxygenSaturation", record.oxygenSaturation))}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">O2 Sat</span>
                {getStatusIcon(getVitalStatus("oxygenSaturation", record.oxygenSaturation))}
              </div>
              <p className="font-semibold">{record.oxygenSaturation}</p>
              <p className="text-xs opacity-75">%</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <span className="text-xs font-medium text-gray-600">Height</span>
              <p className="font-semibold text-gray-900">{record.height}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <span className="text-xs font-medium text-gray-600">Weight</span>
              <p className="font-semibold text-gray-900">{record.weight}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <span className="text-xs font-medium text-gray-600">RBS/FBS</span>
              <p className="font-semibold text-gray-900">{record.rbsFbs}</p>
              <p className="text-xs text-gray-500">mg/dL</p>
            </div>
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
