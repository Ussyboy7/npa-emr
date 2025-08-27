"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// Assume VitalsForm is defined in a separate file
import VitalsForm from "@/components/nurse/vitalsform"; // Adjust path as needed

/** ---------------------------------------
 * Mock data
 * --------------------------------------*/
const patientsMock = [
  {
    id: "P001",
    surname: "Doe",
    firstName: "John",
    lastName: "",
    gender: "Male",
    age: 30,
    employeeCategory: "Employee",
    location: "Headquarters",
    phoneNumber: "123-456-7890",
  },
  {
    id: "P002",
    surname: "Smith",
    firstName: "Jane",
    lastName: "",
    gender: "Female",
    age: 55,
    employeeCategory: "Retiree",
    location: "Bode Thomas Clinic",
    phoneNumber: "987-654-3210",
  },
];

const visitsMock = [
  {
    id: "V001",
    patientId: "P001",
    patientName: "John Doe",
    clinic: "GOP",
    visitDate: "2025-08-06",
    visitTime: "09:30 AM",
    waittime: "15 mins",
    visitType: "Consultation",
    status: "Pending",
  },
  {
    id: "V002",
    patientId: "P002",
    patientName: "Jane Smith",
    clinic: "Eye Clinic",
    visitDate: "2025-08-05",
    visitTime: "10:00 AM",
    waittime: "5 mins",
    visitType: "Consultation",
    status: "Completed",
  },
  {
    id: "V003",
    patientId: "P003",
    patientName: "Michael Johnson",
    clinic: "Dental",
    visitDate: "2025-08-06",
    visitTime: "11:15 AM",
    waittime: "10 mins",
    visitType: "Follow-up",
    status: "Pending",
  },
  {
    id: "V004",
    patientId: "P001",
    patientName: "John Doe",
    clinic: "GOP",
    visitDate: "2025-08-01",
    visitTime: "08:30 AM",
    waittime: "20 mins",
    visitType: "Consultation",
    status: "Not Sent",
  },
  {
    id: "V005",
    patientId: "P002",
    patientName: "Jane Smith",
    clinic: "Eye Clinic",
    visitDate: "2025-08-02",
    visitTime: "10:15 AM",
    waittime: "30 mins",
    visitType: "Follow-up",
    status: "Not Sent",
  },
  {
    id: "V006",
    patientId: "P001",
    patientName: "John Doe",
    clinic: "GOP",
    visitDate: "2025-08-03",
    visitTime: "09:00 AM",
    waittime: "25 mins",
    visitType: "Consultation",
    status: "Completed",
  },
];

/**
 * Simulated vitals history per patient.
 * John Doe (P001) has 3 vitals in SAME DAY (2025-08-06) at different times (09:35, 10:50, 12:10).
 * That demonstrates grouping by visit date, with collapsible time entries.
 */
const vitalsByPatientId = {
  P001: {
    patientId: "P001",
    patientName: "John Doe",
    personalNumber: "123456789",
    vitalsHistory: [
      // Visit: 2025-08-06 with three time entries
      {
        date: "2025-08-06",
        time: "09:35",
        recordedBy: "Nurse Alice",
        vitals: {
          height: "175",
          weight: "70",
          temperature: "36.9",
          pulse: "74",
          respiratoryRate: "16",
          bloodPressure: "118/78",
          oxygenSaturation: "98",
          fbs: "95",
          rbs: "—",
          comment: "Baseline on arrival.",
        },
        alerts: [],
      },
      {
        date: "2025-08-06",
        time: "10:50",
        recordedBy: "Nurse Alice",
        vitals: {
          height: "175",
          weight: "70",
          temperature: "37.2",
          pulse: "79",
          respiratoryRate: "17",
          bloodPressure: "124/82",
          oxygenSaturation: "97",
          fbs: "—",
          rbs: "110",
          comment: "Post-triage; slightly higher BP.",
        },
        alerts: ["Slightly elevated blood pressure"],
      },
      {
        date: "2025-08-06",
        time: "12:10",
        recordedBy: "Nurse Alice",
        vitals: {
          height: "175",
          weight: "70",
          temperature: "37.0",
          pulse: "72",
          respiratoryRate: "16",
          bloodPressure: "120/80",
          oxygenSaturation: "98",
          fbs: "—",
          rbs: "108",
          comment: "Post-consultation; improved BP.",
        },
        alerts: [],
      },
      // Another visit day
      {
        date: "2025-08-03",
        time: "09:10",
        recordedBy: "Nurse Bob",
        vitals: {
          height: "175",
          weight: "70",
          temperature: "37.1",
          pulse: "70",
          respiratoryRate: "16",
          bloodPressure: "120/80",
          oxygenSaturation: "98",
          fbs: "—",
          rbs: "—",
          comment: "Routine check.",
        },
        alerts: [],
      },
      // Older visit day
      {
        date: "2025-08-01",
        time: "08:40",
        recordedBy: "Nurse Eve",
        vitals: {
          height: "175",
          weight: "71",
          temperature: "37.0",
          pulse: "68",
          respiratoryRate: "16",
          bloodPressure: "118/78",
          oxygenSaturation: "99",
          fbs: "—",
          rbs: "—",
          comment: "",
        },
        alerts: [],
      },
    ],
  },
  P002: {
    patientId: "P002",
    patientName: "Jane Smith",
    personalNumber: "987654321",
    vitalsHistory: [
      {
        date: "2025-08-05",
        time: "10:05",
        recordedBy: "Nurse Carol",
        vitals: {
          height: "162",
          weight: "60",
          temperature: "38.2",
          pulse: "88",
          respiratoryRate: "20",
          bloodPressure: "140/90",
          oxygenSaturation: "96",
          fbs: "105",
          rbs: "120",
          comment: "Fever noted, possible infection.",
        },
        alerts: ["High temperature", "Elevated blood pressure"],
      },
      {
        date: "2025-08-02",
        time: "10:20",
        recordedBy: "Nurse Dan",
        vitals: {
          height: "162",
          weight: "60",
          temperature: "37.7",
          pulse: "84",
          respiratoryRate: "18",
          bloodPressure: "132/86",
          oxygenSaturation: "97",
          fbs: "—",
          rbs: "—",
          comment: "",
        },
        alerts: ["Slightly elevated blood pressure"],
      },
    ],
  },
};

/**
 * Get icon based on status.
 */
const getStatusIcon = (status: string) => {
  if (status === "Elevated")
    return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (status === "Low")
    return <TrendingDown className="h-4 w-4 text-blue-500" />;
  return <Activity className="h-4 w-4 text-green-500" />;
};

/**
 * Get badge color class based on status.
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case "Normal":
      return "bg-green-100 text-green-800";
    case "Elevated":
      return "bg-red-100 text-red-800";
    case "Low":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const labelFromKey = (key: string) => {
  if (key === 'fbs') return 'FBS';
  if (key === 'rbs') return 'RBS';
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const unitForKey = (key: string, value?: string) => {
  switch (key) {
    case 'height': return 'cm';
    case 'weight': return 'kg';
    case 'temperature': return '°C';
    case 'pulse': return 'bpm';
    case 'respiratoryRate': return '/min';
    case 'bloodPressure': return 'mmHg';
    case 'oxygenSaturation': return '%';
    case 'fbs':
    case 'rbs': return 'mg/dL';
    default: return '';
  }
};

/**
 * PatientVitals page
 * Matches the styling of Manage Patients.
 */
export default function PatientVitals() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addVitalsOpen, setAddVitalsOpen] = useState(false);
  const [selectedPatientVitals, setSelectedPatientVitals] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedTimes, setExpandedTimes] = useState({});

  useEffect(() => {
    if (historyOpen) {
      setHistoryPage(1);
    }
  }, [historyOpen]);

  const latestVitals = useMemo(() => {
    return Object.values(vitalsByPatientId).map((ph) => {
      const history = ph.vitalsHistory || [];
      if (!history.length) return null;
      // Sort descending by date and time to get latest
      history.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
      const latest = history[0];
      const status = latest.alerts.length > 0 ? "Elevated" : "Normal";
      return {
        id: ph.patientId,
        patient: ph.patientName,
        lastRecorded: `${latest.date} ${latest.time}`,
        bp: latest.vitals.bloodPressure,
        pulse: latest.vitals.pulse,
        temp: latest.vitals.temperature,
        status,
      };
    }).filter(Boolean);
  }, []);

  const toggleTime = (date, time) => {
    const key = `${date}_${time}`;
    setExpandedTimes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddVitals = (data) => {
    console.log("New vitals added:", data);
    setAddVitalsOpen(false);
    // Add logic to update vitals here
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* ---------------------------
          Page Header
       --------------------------- */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patient Vitals</h2>
      </div>

      {/* ---------------------------
          Search + Filter Row
       --------------------------- */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* ---------------------------
          Vitals Cards Grid
       --------------------------- */}
      <div className="grid gap-4">
        {latestVitals.map((vital) => (
          <Card key={vital.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {/* Patient name + status icon */}
                  <CardTitle className="text-lg flex items-center gap-2">
                    {vital.patient}
                    {getStatusIcon(vital.status)}
                  </CardTitle>
                  <CardDescription>
                    Patient ID: {vital.id} | Last recorded: {vital.lastRecorded}
                  </CardDescription>
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(vital.status)}>
                    {vital.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedPatientVitals(vitalsByPatientId[vital.id]); setHistoryOpen(true); }}>
                    View History
                  </Button>
                  <Button onClick={() => setAddVitalsOpen(true)}>
                    <Activity className="h-4 w-4 mr-2" /> 
                    Add New Vitals</Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* ------------------ Vitals History Modal ------------------ */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Vitals History</DialogTitle>
          </DialogHeader>

          {/* Scrollable content area inside the modal */}
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            {selectedPatientVitals ? (() => {
              const allVitals = selectedPatientVitals.vitalsHistory || [];
              const grouped = {};
              allVitals.forEach((v) => {
                if (!grouped[v.date]) grouped[v.date] = [];
                grouped[v.date].push(v);
              });
              const uniqueDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
              const historyTotalPagesLocal = uniqueDates.length;
              const currentDate = uniqueDates[historyPage - 1];
              let records = [];
              if (currentDate) {
                records = grouped[currentDate].slice().sort((a, b) => b.time.localeCompare(a.time));
              }
              const currentVisitGroup = currentDate ? [{ date: currentDate, records }] : [];

              return (
                <>
                  {currentVisitGroup.map(({ date, records }) => {
                    const top = records[0] || { alerts: [] };
                    return (
                      <div key={date} className="space-y-3 border rounded-lg p-4 mb-6">
                        {/* Visit-level header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {selectedPatientVitals.patientName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Personal Number: {selectedPatientVitals.personalNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              Visit Date: {new Date(date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {top.alerts.length ? (
                              <>
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <Badge className="bg-red-100 text-red-800">Alerts</Badge>
                              </>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Normal</Badge>
                            )}
                          </div>
                        </div>

                        {/* Time entries (collapsible) */}
                        <div className="space-y-2">
                          {records.map((rec) => {
                            const key = `${rec.date}_${rec.time}`;
                            const open = !!expandedTimes[key];
                            return (
                              <div key={key} className="border rounded-md">
                                <div className="flex items-center justify-between p-3">
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {rec.time} — Recorded by {rec.recordedBy}
                                    </div>
                                    {rec.alerts.length > 0 && (
                                      <div className="text-xs text-red-600 mt-1">
                                        {rec.alerts.join(" • ")}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleTime(rec.date, rec.time)}
                                  >
                                    {open ? "▼ Hide" : "▶ Show"}
                                  </Button>
                                </div>

                                {open && (
                                  <div className="p-3 pt-0 space-y-3">
                                    {/* Vital Signs Grid (mirrors your View Vitals layout) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(rec.vitals).map(([k, v]) =>
                                        k !== "comment" ? (
                                          <div key={k} className="p-3 border rounded-lg">
                                            <label className="text-sm font-medium text-gray-600">
                                              {labelFromKey(k)}
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                              {v || "Not recorded"} {unitForKey(k)}
                                            </p>
                                          </div>
                                        ) : null
                                      )}
                                    </div>

                                    {rec.vitals.comment && (
                                      <div className="p-3 border rounded-lg bg-blue-50">
                                        <label className="text-sm font-medium text-gray-600">
                                          Comments/Notes
                                        </label>
                                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                          {rec.vitals.comment}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Pagination (by visit date) */}
                  {historyTotalPagesLocal > 1 && (
                    <div className="mt-2">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                            />
                          </PaginationItem>
                          {Array.from({ length: historyTotalPagesLocal }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                isActive={historyPage === i + 1}
                                onClick={() => setHistoryPage(i + 1)}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setHistoryPage((p) => Math.min(historyTotalPagesLocal, p + 1))
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              );
            })() : (
              <div className="text-sm text-muted-foreground">No patient selected.</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setAddVitalsOpen(true)}>
              <Activity className="h-4 w-4 mr-2" />
              Add New Vitals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------ Add New Vitals Modal ------------------ */}
      <Dialog open={addVitalsOpen} onOpenChange={setAddVitalsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vitals</DialogTitle>
          </DialogHeader>
          <VitalsForm onSubmit={handleAddVitals} />
        </DialogContent>
      </Dialog>
    </div>
  );
}