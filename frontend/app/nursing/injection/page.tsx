"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Syringe, AlertTriangle, Plus, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import InjectionForm  from "@/components/nurse/injectionform";

// Mock injection data - structured like vitals data for consistency
const injectionsByPatientId = {
  P001: {
    patientId: "P001",
    patientName: "John Doe",
    personalNumber: "123456789",
    injectionsHistory: [
      // Same day with multiple injections at different times
      {
        date: "2025-08-15",
        time: "09:30",
        recordedBy: "Nurse Alice",
        injection: {
          medication: "Insulin",
          dosage: "10 units",
          route: "Subcutaneous",
          site: "Abdomen",
          batchNumber: "INS2025-001",
          expiryDate: "2026-01-15",
          manufacturer: "PharmaCorp",
          indication: "Type 1 Diabetes",
          comment: "Pre-breakfast shot, patient tolerated well.",
        },
        alerts: [],
      },
      {
        date: "2025-08-15",
        time: "18:45",
        recordedBy: "Nurse Bob",
        injection: {
          medication: "Insulin",
          dosage: "8 units",
          route: "Subcutaneous",
          site: "Thigh",
          batchNumber: "INS2025-001",
          expiryDate: "2026-01-15",
          manufacturer: "PharmaCorp",
          indication: "Type 1 Diabetes",
          comment: "Evening dose, rotation site as planned.",
        },
        alerts: [],
      },
      // Another day
      {
        date: "2025-08-12",
        time: "10:00",
        recordedBy: "Nurse Carol",
        injection: {
          medication: "Vitamin B12",
          dosage: "1000 mcg",
          route: "Intramuscular",
          site: "Deltoid muscle (left)",
          batchNumber: "VB12-2025-045",
          expiryDate: "2025-12-30",
          manufacturer: "VitaPharm",
          indication: "B12 deficiency",
          comment: "Monthly B12 supplement injection.",
        },
        alerts: [],
      },
      // Older injection
      {
        date: "2025-08-10",
        time: "14:30",
        recordedBy: "Nurse Dan",
        injection: {
          medication: "Tetanus Vaccine",
          dosage: "0.5 mL",
          route: "Intramuscular",
          site: "Deltoid muscle (right)",
          batchNumber: "TET2025-089",
          expiryDate: "2025-11-20",
          manufacturer: "VaccinePlus",
          indication: "Wound prophylaxis",
          comment: "Patient had minor cut, vaccine administered as precaution.",
        },
        alerts: [],
      },
    ],
  },
  P002: {
    patientId: "P002",
    patientName: "Jane Smith",
    personalNumber: "987654321",
    injectionsHistory: [
      {
        date: "2025-08-14",
        time: "11:00",
        recordedBy: "Nurse Eve",
        injection: {
          medication: "Ceftriaxone",
          dosage: "1 gram",
          route: "Intravenous",
          site: "Left antecubital vein",
          batchNumber: "CEF2025-123",
          expiryDate: "2025-10-15",
          manufacturer: "AntibioLab",
          indication: "Bacterial infection",
          comment: "Patient reports mild burning sensation during administration.",
        },
        alerts: ["Patient experienced mild discomfort during administration"],
      },
      {
        date: "2025-08-11",
        time: "09:15",
        recordedBy: "Nurse Frank",
        injection: {
          medication: "Morphine",
          dosage: "5 mg",
          route: "Intramuscular",
          site: "Gluteal muscle",
          batchNumber: "MOR2025-067",
          expiryDate: "2026-03-20",
          manufacturer: "PainRelief Inc",
          indication: "Post-operative pain management",
          comment: "Administered for severe post-surgical pain.",
        },
        alerts: ["Controlled substance - documented and witnessed"],
      },
    ],
  },
  P003: {
    patientId: "P003",
    patientName: "Michael Johnson",
    personalNumber: "456789123",
    injectionsHistory: [
      {
        date: "2025-08-13",
        time: "16:20",
        recordedBy: "Nurse Grace",
        injection: {
          medication: "Influenza Vaccine",
          dosage: "0.5 mL",
          route: "Intramuscular",
          site: "Deltoid muscle (left)",
          batchNumber: "FLU2025-201",
          expiryDate: "2026-06-30",
          manufacturer: "FluShield",
          indication: "Annual flu prevention",
          comment: "Routine annual flu vaccination, no adverse reactions.",
        },
        alerts: [],
      },
    ],
  },
};

/**
 * Get icon and color based on injection type/alerts
 */
const getInjectionIcon = (alerts) => {
  if (alerts.length > 0) {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  return <Syringe className="h-4 w-4 text-green-500" />;
};

/**
 * Get badge color class based on status
 */
const getStatusColor = (alerts) => {
  if (alerts.length > 0) {
    return "bg-red-100 text-red-800";
  }
  return "bg-green-100 text-green-800";
};

/**
 * Format label from camelCase key
 */
const labelFromKey = (key) => {
  const labels = {
    medication: "Medication",
    dosage: "Dosage",
    route: "Route of Administration",
    site: "Injection Site",
    batchNumber: "Batch Number",
    expiryDate: "Expiry Date",
    manufacturer: "Manufacturer",
    indication: "Indication",
    comment: "Comments/Notes"
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

/**
 * Patient Injections page - matches PatientVitals structure exactly
 */
export default function PatientInjections() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addInjectionOpen, setAddInjectionOpen] = useState(false);
  const [selectedPatientInjections, setSelectedPatientInjections] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedTimes, setExpandedTimes] = useState({});

  useEffect(() => {
    if (historyOpen) {
      setHistoryPage(1);
    }
  }, [historyOpen]);

  const latestInjections = useMemo(() => {
    return Object.values(injectionsByPatientId).map((ph) => {
      const history = ph.injectionsHistory || [];
      if (!history.length) return null;
      // Sort descending by date and time to get latest
      history.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
      const latest = history[0];
      const status = latest.alerts.length > 0 ? "Attention Required" : "Normal";
      return {
        id: ph.patientId,
        patient: ph.patientName,
        lastRecorded: `${latest.date} ${latest.time}`,
        medication: latest.injection.medication,
        dosage: latest.injection.dosage,
        route: latest.injection.route,
        status,
        alerts: latest.alerts,
      };
    }).filter(Boolean);
  }, []);

  const toggleTime = (date, time) => {
    const key = `${date}_${time}`;
    setExpandedTimes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddInjection = (data) => {
    console.log("New injection added:", data);
    setAddInjectionOpen(false);
    // Add logic to update injections here
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patient Injections</h2>
      </div>

      {/* Search + Filter Row */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Injections Cards Grid */}
      <div className="grid gap-4">
        {latestInjections.map((injection) => (
          <Card key={injection.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {/* Patient name + status icon */}
                  <CardTitle className="text-lg flex items-center gap-2">
                    {injection.patient}
                    {getInjectionIcon(injection.alerts)}
                  </CardTitle>
                  <CardDescription>
                    Patient ID: {injection.id} | Last recorded: {injection.lastRecorded}
                  </CardDescription>
                  <CardDescription className="mt-1">
                    Last injection: {injection.medication} ({injection.dosage}) - {injection.route}
                  </CardDescription>
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(injection.alerts)}>
                    {injection.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { 
                      setSelectedPatientInjections(injectionsByPatientId[injection.id]); 
                      setHistoryOpen(true); 
                    }}
                  >
                    View History
                  </Button>
                  <Button onClick={() => setAddInjectionOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> 
                    Add Injection
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Injections History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Injection History</DialogTitle>
          </DialogHeader>

          {/* Scrollable content area inside the modal */}
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            {selectedPatientInjections ? (() => {
              const allInjections = selectedPatientInjections.injectionsHistory || [];
              const grouped = {};
              allInjections.forEach((v) => {
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
              const currentInjectionGroup = currentDate ? [{ date: currentDate, records }] : [];

              return (
                <>
                  {currentInjectionGroup.map(({ date, records }) => {
                    const top = records[0] || { alerts: [] };
                    return (
                      <div key={date} className="space-y-3 border rounded-lg p-4 mb-6">
                        {/* Visit-level header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {selectedPatientInjections.patientName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Personal Number: {selectedPatientInjections.personalNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {new Date(date).toLocaleDateString()}
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
                                      {rec.time} — {rec.injection.medication} ({rec.injection.dosage})
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      Administered by {rec.recordedBy} via {rec.injection.route}
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
                                    {/* Injection Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(rec.injection).map(([k, v]) =>
                                        k !== "comment" ? (
                                          <div key={k} className="p-3 border rounded-lg">
                                            <label className="text-sm font-medium text-gray-600">
                                              {labelFromKey(k)}
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                              {v || "Not recorded"}
                                            </p>
                                          </div>
                                        ) : null
                                      )}
                                    </div>

                                    {rec.injection.comment && (
                                      <div className="p-3 border rounded-lg bg-blue-50">
                                        <label className="text-sm font-medium text-gray-600">
                                          Comments/Notes
                                        </label>
                                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                          {rec.injection.comment}
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
                  {/* Pagination (by injection date) */}
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
            <Button onClick={() => setAddInjectionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Injection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Injection Modal */}
      <Dialog open={addInjectionOpen} onOpenChange={setAddInjectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Injection</DialogTitle>
          </DialogHeader>
          {/* Placeholder form - you'll need to implement InjectionForm component */}
          <InjectionForm
                onSubmit={handleAddInjection}
                patientName={selectedPatientInjections?.patientName || "Selected Patient"}
                currentNurse="Nurse Alice" // Replace with current user if dynamic
            />
        </DialogContent>
      </Dialog>

    </div>
  );
}