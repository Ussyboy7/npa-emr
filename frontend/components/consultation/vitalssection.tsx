"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Calendar,
  Eye,
  Plus,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Import your VitalsForm component
import VitalsForm from "@/components/nurse/vitalsform"; // Adjust path if needed

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface VitalsData {
  id?: string;
  height?: string;
  weight?: string;
  temperature?: string;
  pulse?: string;
  respiratoryRate?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  oxygenSaturation?: string;
  fbs?: string;
  rbs?: string;
  painScale?: string;
  bodymassindex?: string;
  comment?: string;
  recordedAt?: string;
  recordedBy?: string;
}

interface VitalRecord extends VitalsData {
  id: string;
  recordedAt: string;
  recordedBy: string;
  patientName: string;
  personalNumber: string;
}

interface VitalsSectionProps {
  visitId: string;
  vitals?: VitalsData;
  patientId?: string;
  patientName?: string;
  personalNumber?: string;
}

// Define the getVitalStatus function (same as in your VitalsForm)
const getVitalStatus = (type: string, value: string | undefined): 'normal' | 'high' | 'low' | 'critical' => {
  if (!value || value === '') return 'normal';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'normal';
  
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

const getStatusIcon = (status: string) => {
  if (status === "critical") return <AlertTriangle className="h-4 w-4" />;
  if (status === "high") return <TrendingUp className="h-4 w-4" />;
  if (status === "low") return <TrendingDown className="h-4 w-4" />;
  return null;
};

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const mockVitalsHistory: VitalRecord[] = [
  {
    id: "1",
    height: "170",
    weight: "70",
    temperature: "38.5",
    pulse: "85",
    respiratoryRate: "16",
    bloodPressureSystolic: "120",
    bloodPressureDiastolic: "80",
    oxygenSaturation: "98",
    fbs: "90",
    rbs: "120",
    painScale: "2",
    bodymassindex: "24.22",
    comment: "Patient feeling well",
    recordedAt: "2024-08-16T10:30:00Z",
    recordedBy: "Dr. Smith",
    patientName: "John Doe",
    personalNumber: "P001",
  },
  {
    id: "2",
    height: "170",
    weight: "70",
    temperature: "36.8",
    pulse: "78",
    respiratoryRate: "14",
    bloodPressureSystolic: "130",
    bloodPressureDiastolic: "85",
    oxygenSaturation: "97",
    fbs: "85",
    rbs: "110",
    painScale: "1",
    bodymassindex: "24.22",
    recordedAt: "2024-08-15T14:20:00Z",
    recordedBy: "Nurse Johnson",
    patientName: "John Doe",
    personalNumber: "P001",
  },
];

const VitalsSection: React.FC<VitalsSectionProps> = ({
  visitId,
  vitals,
  patientId,
  patientName,
  personalNumber,
}) => {
  const [vitalsHistory, setVitalsHistory] =
    useState<VitalRecord[]>(mockVitalsHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VitalRecord | null>(null);
  const [viewRecordOpen, setViewRecordOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTimes, setExpandedTimes] = useState<{
    [key: string]: boolean;
  }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(3);
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recordedByFilter, setRecordedByFilter] = useState("all");

  const vitalSigns = [
    {
      id: "temperature",
      label: "Temperature",
      unit: "°C",
      icon: <Thermometer className="h-4 w-4" />,
      required: true,
      placeholder: "36.5",
    },
    {
      id: "bloodPressureSystolic",
      label: "Systolic BP",
      unit: "mmHg",
      icon: <Heart className="h-4 w-4" />,
      required: true,
      placeholder: "120",
    },
    {
      id: "bloodPressureDiastolic",
      label: "Diastolic BP",
      unit: "mmHg",
      icon: <Heart className="h-4 w-4" />,
      required: true,
      placeholder: "80",
    },
    {
      id: "pulse",
      label: "Pulse",
      unit: "bpm",
      icon: <Activity className="h-4 w-4" />,
      required: true,
      placeholder: "72",
    },
    {
      id: "respiratoryRate",
      label: "Respiratory Rate",
      unit: "/min",
      icon: <Wind className="h-4 w-4" />,
      required: true,
      placeholder: "16",
    },
    {
      id: "oxygenSaturation",
      label: "Oxygen Saturation",
      unit: "%",
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: "98",
    },
    {
      id: "height",
      label: "Height",
      unit: "cm",
      icon: <Ruler className="h-4 w-4" />,
      required: false,
      placeholder: "170",
    },
    {
      id: "weight",
      label: "Weight",
      unit: "kg",
      icon: <Weight className="h-4 w-4" />,
      required: false,
      placeholder: "70",
    },
    {
      id: "fbs",
      label: "FBS",
      unit: "mg/dL",
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: "90",
    },
    {
      id: "rbs",
      label: "RBS",
      unit: "mg/dL",
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: "120",
    },
    {
      id: "painScale",
      label: "Pain Scale",
      unit: "/10",
      icon: <AlertTriangle className="h-4 w-4" />,
      required: false,
      placeholder: "0",
    },
  ];

  const getRecordOverallStatus = (record: VitalRecord): "normal" | "alert" => {
    const vitalsToCheck = [
      { field: "temperature", value: record.temperature },
      { field: "bloodPressureSystolic", value: record.bloodPressureSystolic },
      { field: "pulse", value: record.pulse },
      { field: "oxygenSaturation", value: record.oxygenSaturation },
    ];

    for (const vital of vitalsToCheck) {
      const status = getVitalStatus(vital.field, vital.value);
      if (status === "critical" || status === "high" || status === "low") {
        return "alert";
      }
    }
    return "normal";
  };

  const filteredHistory = useMemo(() => {
    return vitalsHistory.filter((record) => {
      if (dateFilter && dateFilter !== "all") {
        const recordDate = new Date(record.recordedAt)
          .toISOString()
          .split("T")[0];
        if (recordDate !== dateFilter) return false;
      }

      if (statusFilter !== "all") {
        const recordStatus = getRecordOverallStatus(record);
        if (recordStatus !== statusFilter) return false;
      }

      if (recordedByFilter && recordedByFilter !== "all") {
        if (record.recordedBy !== recordedByFilter) return false;
      }

      return true;
    });
  }, [vitalsHistory, dateFilter, statusFilter, recordedByFilter]);

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, statusFilter, recordedByFilter]);

  const uniqueDates = useMemo(() => {
    const dates = vitalsHistory.map(
      (record) => new Date(record.recordedAt).toISOString().split("T")[0]
    );
    return [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  }, [vitalsHistory]);

  const uniqueRecordedBy = useMemo(() => {
    const recordedBy = vitalsHistory.map((record) => record.recordedBy);
    return [...new Set(recordedBy)].sort();
  }, [vitalsHistory]);

  const clearFilters = () => {
    setDateFilter("all");
    setStatusFilter("all");
    setRecordedByFilter("all");
  };

  const criticalAlerts = useMemo(() => {
    const alerts: string[] = [];

    Object.entries(vitals || {}).forEach(([key, value]) => {
      const status = getVitalStatus(key, value);
      if (status === "critical") {
        const vital = vitalSigns.find((v) => v.id === key);
        if (vital) {
          alerts.push(`Critical ${vital.label}: ${value}${vital.unit}`);
        }
      }
    });

    return alerts;
  }, [vitals]);

  const handleFormSubmit = async (formData: VitalsData) => {
    setIsSaving(true);

    try {
      await fetch(`${API_URL}/api/vitals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          patient: patientId,
          recorded_at: new Date().toISOString(),
          recorded_by: "Current User", // Replace with actual user
        }),
      });

      const newRecord: VitalRecord = {
        ...formData,
        id: Date.now().toString(),
        recordedAt: new Date().toISOString(),
        recordedBy: "Current User",
        patientName: patientName || "Unknown",
        personalNumber: personalNumber || "Unknown",
      };

      setVitalsHistory((prev) => [newRecord, ...prev]);
      setFormOpen(false);
      
      alert("Vitals saved successfully!");
    } catch (error) {
      alert("Error saving vitals. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const viewRecord = (record: VitalRecord) => {
    setSelectedRecord(record);
    setViewRecordOpen(true);
  };

  const normalizeValue = (value: string | undefined): string => {
    return value ?? "Not recorded";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with patient info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vitals</h2>
          <p className="text-gray-600">
            Patient: {patientName || "Unknown"} ({personalNumber || "Unknown"})
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vitals
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setHistoryOpen(true)}
          >
            <Clock className="mr-2 h-4 w-4" />
            View Full History
          </Button>
        </div>
      </div>

      {/* Critical alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong className="text-red-800">Critical Values Alert:</strong>
            <ul className="mt-2 space-y-1">
              {criticalAlerts.map((alert, index) => (
                <li key={index} className="text-red-700">
                  • {alert}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Vitals Card */}
      {vitals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Current Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vitalSigns.map((vital) => {
                const value = vitals[vital.id as keyof VitalsData];
                const status = getVitalStatus(vital.id, value);

                return (
                  <div
                    key={vital.id}
                    className={`p-4 rounded-lg border ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        {vital.icon}
                        {vital.label}
                      </Label>
                      {getStatusIcon(status)}
                    </div>
                    <p className="text-lg font-semibold">
                      {normalizeValue(value)}
                    </p>
                    <p className="text-xs opacity-75">{vital.unit}</p>
                  </div>
                );
              })}
            </div>

            {/* BMI Display */}
            <div className="mt-4 space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Weight className="h-4 w-4" />
                Body Mass Index (kg/m²)
              </Label>
              <div className="p-4 rounded-lg border bg-gray-50">
                <p className="text-lg font-semibold text-gray-900">
                  {vitals.bodymassindex || "Not calculated"}
                </p>
                {vitals.bodymassindex && (
                  <p className="text-sm text-gray-500">
                    Category: {getBMICategory(parseFloat(vitals.bodymassindex))}
                  </p>
                )}
              </div>
            </div>

            {/* Comments section */}
            {vitals.comment && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium">Additional Comments</Label>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {vitals.comment}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vitalsHistory.slice(0, 5).map((record) => {
              const time = new Date(record.recordedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const date = new Date(record.recordedAt).toLocaleDateString();
              const key = record.id;
              const isExpanded = expandedTimes[key];

              const vitalsData = {
                temperature: record.temperature,
                blood_pressure: `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`,
                heart_rate: record.pulse,
                respiratory_rate: record.respiratoryRate,
                oxygen_saturation: record.oxygenSaturation,
                weight: record.weight,
                height: record.height,
                fbs: record.fbs,
                rbs: record.rbs,
                pain_scale: record.painScale,
                bodymassindex: record.bodymassindex,
              };

              return (
                <div key={key} className="border rounded-md">
                  <div className="flex items-center justify-between p-3">
                    <div className="text-sm flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {time} — Recorded by {record.recordedBy}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              getRecordOverallStatus(record) === "alert"
                                ? "border-red-200 text-red-700"
                                : "border-green-200 text-green-700"
                            }
                          >
                            {getRecordOverallStatus(record) === "alert" ? (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Alert
                              </>
                            ) : (
                              "Normal"
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{date}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewRecord(record)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedTimes((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                      >
                        {isExpanded ? "▼ Hide" : "▶ Show"}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 pt-0 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(vitalsData).map(([k, v]) => {
                          const label = k
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase());
                          let unit = "";
                          let statusKey = k;

                          switch (k) {
                            case "temperature":
                              unit = "°C";
                              break;
                            case "blood_pressure":
                              unit = "mmHg";
                              statusKey = "bloodPressureSystolic";
                              break;
                            case "heart_rate":
                              unit = "bpm";
                              statusKey = "pulse";
                              break;
                            case "respiratory_rate":
                              unit = "/min";
                              statusKey = "respiratoryRate";
                              break;
                            case "oxygen_saturation":
                              unit = "%";
                              statusKey = "oxygenSaturation";
                              break;
                            case "weight":
                              unit = "kg";
                              break;
                            case "height":
                              unit = "cm";
                              break;
                            case "fbs":
                            case "rbs":
                              unit = "mg/dL";
                              break;
                            case "pain_scale":
                              unit = "/10";
                              statusKey = "painScale";
                              break;
                            case "bodymassindex":
                              unit = "";
                              break;
                          }

                          const status = getVitalStatus(statusKey, v);

                          return (
                            <div
                              key={k}
                              className={`p-4 rounded-lg border ${getStatusColor(
                                status
                              )}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">
                                  {label}
                                </label>
                                {getStatusIcon(status)}
                              </div>
                              <p className="text-lg font-semibold">
                                {v || "Not recorded"} {unit}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {record.comment && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <h4 className="font-medium mb-1 text-sm">
                            Comments:
                          </h4>
                          <p className="text-sm text-gray-700">
                            {record.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Vitals History
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {(dateFilter !== "all" ||
                statusFilter !== "all" ||
                recordedByFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-sm">Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All dates</SelectItem>
                    {uniqueDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {new Date(date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alert">Has Alerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Recorded By</Label>
                <Select
                  value={recordedByFilter}
                  onValueChange={setRecordedByFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All staff</SelectItem>
                    {uniqueRecordedBy.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Badge variant="outline" className="h-10 flex items-center">
                  {filteredHistory.length} record
                  {filteredHistory.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto pr-2" style={{ maxHeight: "50vh" }}>
            <div className="space-y-4">
              {currentRecords.length > 0 ? (
                currentRecords.map((record) => {
                  const time = new Date(record.recordedAt).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  const date = new Date(record.recordedAt).toLocaleDateString();
                  const key = `history_${record.id}`;
                  const isExpanded = expandedTimes[key];
                  const recordStatus = getRecordOverallStatus(record);

                  const vitalsData = {
                    temperature: record.temperature,
                    blood_pressure: `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`,
                    heart_rate: record.pulse,
                    respiratory_rate: record.respiratoryRate,
                    oxygen_saturation: record.oxygenSaturation,
                    weight: record.weight,
                    height: record.height,
                    fbs: record.fbs,
                    rbs: record.rbs,
                    pain_scale: record.painScale,
                    bodymassindex: record.bodymassindex,
                  };

                  return (
                    <div key={key} className="border rounded-md">
                      <div className="flex items-center justify-between p-3">
                        <div className="text-sm flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {time} — Recorded by {record.recordedBy}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  recordStatus === "alert"
                                    ? "border-red-200 text-red-700"
                                    : "border-green-200 text-green-700"
                                }
                              >
                                {recordStatus === "alert" ? (
                                  <>
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Alert
                                  </>
                                ) : (
                                  "Normal"
                                )}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{date}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewRecord(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedTimes((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }))
                            }
                          >
                            {isExpanded ? "▼ Hide" : "▶ Show"}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3 pt-0 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.entries(vitalsData).map(([k, v]) => {
                              const label = k
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase());
                              let unit = "";
                              let statusKey = k;

                              switch (k) {
                                case "temperature":
                                  unit = "°C";
                                  break;
                                case "blood_pressure":
                                  unit = "mmHg";
                                  statusKey = "bloodPressureSystolic";
                                  break;
                                case "heart_rate":
                                  unit = "bpm";
                                  statusKey = "pulse";
                                  break;
                                case "respiratory_rate":
                                  unit = "/min";
                                  statusKey = "respiratoryRate";
                                  break;
                                case "oxygen_saturation":
                                  unit = "%";
                                  statusKey = "oxygenSaturation";
                                  break;
                                case "weight":
                                  unit = "kg";
                                  break;
                                case "height":
                                  unit = "cm";
                                  break;
                                case "fbs":
                                case "rbs":
                                  unit = "mg/dL";
                                  break;
                                case "pain_scale":
                                  unit = "/10";
                                  statusKey = "painScale";
                                  break;
                                case "bodymassindex":
                                  unit = "";
                                  break;
                              }

                              const status = getVitalStatus(statusKey, v);

                              return (
                                <div
                                  key={k}
                                  className={`p-4 rounded-lg border ${getStatusColor(
                                    status
                                  )}`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">
                                      {label}
                                    </label>
                                    {getStatusIcon(status)}
                                  </div>
                                  <p className="text-lg font-semibold">
                                    {v || "Not recorded"} {unit}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {record.comment && (
                            <div className="p-4 border rounded-lg bg-blue-50">
                              <h4 className="font-medium mb-1 text-sm">
                                Comments:
                              </h4>
                              <p className="text-sm text-gray-700">
                                {record.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No records found with current filters</p>
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear filters to see all records
                  </Button>
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * recordsPerPage,
                    filteredHistory.length
                  )}{" "}
                  of {filteredHistory.length} records
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={viewRecordOpen} onOpenChange={setViewRecordOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Vital Records for {selectedRecord?.patientName}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 mt-4">
              {/* Patient Info Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-lg text-gray-900">
                    {selectedRecord.patientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Personal Number: {selectedRecord.personalNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date:{" "}
                    {new Date(selectedRecord.recordedAt).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(selectedRecord.recordedAt).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Recorded by: {selectedRecord.recordedBy}
                  </p>
                </div>

                {(() => {
                  const recordAlerts = Object.entries(selectedRecord).reduce(
                    (alerts: string[], [key, value]) => {
                      const status = getVitalStatus(key, value);
                      if (status === "critical") {
                        const vital = vitalSigns.find((v) => v.id === key);
                        if (vital) {
                          alerts.push(
                            `Critical ${vital.label}: ${normalizeValue(value)}${
                              vital.unit
                            }`
                          );
                        }
                      }
                      return alerts;
                    },
                    []
                  );
                  return recordAlerts.length > 0 ? (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-700 mb-1">
                          Health Alerts:
                        </div>
                        {recordAlerts.map((alert, index) => (
                          <span
                            key={index}
                            className="block text-xs text-red-600 bg-red-100 px-2 py-1 rounded mb-1"
                          >
                            {alert}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Vital Signs Grid */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">
                  Vital Signs
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vitalSigns.map((vital) => {
                    const value = selectedRecord[vital.id as keyof VitalRecord];
                    const status = getVitalStatus(vital.id, value);

                    return (
                      <div
                        key={vital.id}
                        className={`p-4 rounded-lg border ${getStatusColor(
                          status
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            {vital.icon}
                            {vital.label}
                          </Label>
                          {getStatusIcon(status)}
                        </div>
                        <p className="text-lg font-semibold">
                          {normalizeValue(value)}
                        </p>
                        <p className="text-xs opacity-75">{vital.unit}</p>
                      </div>
                    );
                  })}
                </div>

                {/* BMI Display */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Weight className="h-4 w-4" />
                    Body Mass Index (kg/m²)
                  </Label>
                  <div className="p-4 rounded-lg border bg-gray-50">
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedRecord.bodymassindex || "Not calculated"}
                    </p>
                    {parseFloat(selectedRecord.bodymassindex || "0") > 0 && (
                      <p className="text-sm text-gray-500">
                        Category:{" "}
                        {getBMICategory(
                          parseFloat(selectedRecord.bodymassindex || "0")
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Comments section */}
                {selectedRecord.comment && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Additional Comments
                    </Label>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {selectedRecord.comment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRecordOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vitals Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Vitals
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          
          <VitalsForm 
            onSubmit={handleFormSubmit} 
            initialData={vitals}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VitalsSection;