"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bandage, AlertTriangle, Plus, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import DressingForm from "@/components/nurse/dressingform";

// Mock dressing data - structured like injections data for consistency
const dressingsByPatientId = {
  P001: {
    patientId: "P001",
    patientName: "John Doe",
    personalNumber: "123456789",
    dressingsHistory: [
      // Same day with multiple dressing changes at different times
      {
        date: "2025-08-15",
        time: "09:30",
        recordedBy: "Nurse Alice",
        dressing: {
          woundType: "Surgical",
          location: "Abdomen",
          dressingType: "Hydrocolloid",
          woundCondition: "Healing Well",
          woundSize: "3cm x 2cm",
          drainage: "Minimal serous",
          painLevel: "2/10",
          skinCondition: "Intact around wound",
          observations: "Surgical site healing well, no signs of infection. Patient comfortable.",
        },
        alerts: [],
      },
      {
        date: "2025-08-12",
        time: "14:00",
        recordedBy: "Nurse Bob",
        dressing: {
          woundType: "Surgical",
          location: "Abdomen",
          dressingType: "Gauze",
          woundCondition: "Stable",
          woundSize: "3.5cm x 2.5cm",
          drainage: "Moderate serous",
          painLevel: "3/10",
          skinCondition: "Slightly red around edges",
          observations: "Initial post-op dressing change. Some expected inflammation.",
        },
        alerts: ["Initial post-operative monitoring required"],
      },
    ],
  },
  P002: {
    patientId: "P002",
    patientName: "Jane Smith",
    personalNumber: "987654321",
    dressingsHistory: [
      {
        date: "2025-08-14",
        time: "11:00",
        recordedBy: "Nurse Carol",
        dressing: {
          woundType: "Burn",
          location: "Left forearm",
          dressingType: "Foam",
          woundCondition: "Signs of Infection",
          woundSize: "5cm x 3cm",
          drainage: "Purulent, yellow-green",
          painLevel: "7/10",
          skinCondition: "Red, warm, swollen",
          observations: "Wound showing signs of infection. Increased drainage and patient reports increased pain. Doctor notified.",
        },
        alerts: ["Possible infection - doctor notified", "Increased pain reported"],
      },
      {
        date: "2025-08-11",
        time: "16:30",
        recordedBy: "Nurse Dan",
        dressing: {
          woundType: "Burn",
          location: "Left forearm",
          dressingType: "Transparent Film",
          woundCondition: "Stable",
          woundSize: "5.5cm x 3.5cm",
          drainage: "Minimal clear",
          painLevel: "4/10",
          skinCondition: "Pink, healing",
          observations: "Second-degree burn healing as expected. Patient tolerating well.",
        },
        alerts: [],
      },
    ],
  },
  P003: {
    patientId: "P003",
    patientName: "Michael Johnson",
    personalNumber: "456789123",
    dressingsHistory: [
      {
        date: "2025-08-13",
        time: "10:15",
        recordedBy: "Nurse Eve",
        dressing: {
          woundType: "Pressure Ulcer",
          location: "Sacrum",
          dressingType: "Hydrocolloid",
          woundCondition: "Deteriorating",
          woundSize: "4cm x 4cm, 0.5cm deep",
          drainage: "Moderate serous",
          painLevel: "5/10",
          skinCondition: "Macerated edges",
          observations: "Stage 2 pressure ulcer showing signs of deterioration. Increased turning schedule implemented.",
        },
        alerts: ["Wound deteriorating", "Increased monitoring required"],
      },
      {
        date: "2025-08-10",
        time: "09:45",
        recordedBy: "Nurse Frank",
        dressing: {
          woundType: "Trauma",
          location: "Right knee",
          dressingType: "Gauze",
          woundCondition: "Healing Well",
          woundSize: "2cm x 1cm",
          drainage: "None",
          painLevel: "1/10",
          skinCondition: "Normal",
          observations: "Laceration from fall, healing without complications.",
        },
        alerts: [],
      },
    ],
  },
};

/**
 * Get icon and color based on dressing condition/alerts
 */
const getDressingIcon = (alerts) => {
  if (alerts.length > 0) {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  return <Bandage className="h-4 w-4 text-green-500" />;
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
    woundType: "Wound Type",
    location: "Location",
    dressingType: "Dressing Type",
    woundCondition: "Wound Condition",
    woundSize: "Wound Size",
    drainage: "Drainage",
    painLevel: "Pain Level",
    skinCondition: "Skin Condition",
    observations: "Observations"
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

/**
 * Patient Dressings page - matches PatientInjections structure exactly
 */
export default function PatientDressings() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addDressingOpen, setAddDressingOpen] = useState(false);
  const [selectedPatientDressings, setSelectedPatientDressings] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedTimes, setExpandedTimes] = useState({});

  useEffect(() => {
    if (historyOpen) {
      setHistoryPage(1);
    }
  }, [historyOpen]);

  const latestDressings = useMemo(() => {
    return Object.values(dressingsByPatientId).map((ph) => {
      const history = ph.dressingsHistory || [];
      if (!history.length) return null;
      // Sort descending by date and time to get latest
      history.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
      const latest = history[0];
      const status = latest.alerts.length > 0 ? "Attention Required" : "Normal";
      return {
        id: ph.patientId,
        patient: ph.patientName,
        lastRecorded: `${latest.date} ${latest.time}`,
        woundType: latest.dressing.woundType,
        location: latest.dressing.location,
        condition: latest.dressing.woundCondition,
        status,
        alerts: latest.alerts,
      };
    }).filter(Boolean);
  }, []);

  const toggleTime = (date, time) => {
    const key = `${date}_${time}`;
    setExpandedTimes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddDressing = (data) => {
    console.log("New dressing recorded:", data);
    console.log("For patient:", selectedPatientDressings?.patientName || "Unknown");
    setAddDressingOpen(false);
    // Add logic to update dressings here
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Wound Dressing</h2>
      </div>

      {/* Search + Filter Row */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Dressings Cards Grid */}
      <div className="grid gap-4">
        {latestDressings.map((dressing) => (
          <Card key={dressing.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {/* Patient name + status icon */}
                  <CardTitle className="text-lg flex items-center gap-2">
                    {dressing.patient}
                    {getDressingIcon(dressing.alerts)}
                  </CardTitle>
                  <CardDescription>
                    Patient ID: {dressing.id} | Last recorded: {dressing.lastRecorded}
                  </CardDescription>
                  <CardDescription className="mt-1">
                    {dressing.woundType} wound at {dressing.location} - {dressing.condition}
                  </CardDescription>
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(dressing.alerts)}>
                    {dressing.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { 
                      setSelectedPatientDressings(dressingsByPatientId[dressing.id]); 
                      setHistoryOpen(true); 
                    }}
                  >
                    View History
                  </Button>
                  <Button onClick={() => {
                    setSelectedPatientDressings(dressingsByPatientId[dressing.id]);
                    setAddDressingOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> 
                    Record Change
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Dressings History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Dressing History</DialogTitle>
          </DialogHeader>

          {/* Scrollable content area inside the modal */}
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            {selectedPatientDressings ? (() => {
              const allDressings = selectedPatientDressings.dressingsHistory || [];
              const grouped = {};
              allDressings.forEach((v) => {
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
              const currentDressingGroup = currentDate ? [{ date: currentDate, records }] : [];

              return (
                <>
                  {currentDressingGroup.map(({ date, records }) => {
                    const top = records[0] || { alerts: [] };
                    return (
                      <div key={date} className="space-y-3 border rounded-lg p-4 mb-6">
                        {/* Visit-level header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {selectedPatientDressings.patientName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Personal Number: {selectedPatientDressings.personalNumber}
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
                                      {rec.time} — {rec.dressing.woundType} at {rec.dressing.location}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      Recorded by {rec.recordedBy} | Condition: {rec.dressing.woundCondition}
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
                                    {/* Dressing Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(rec.dressing).map(([k, v]) =>
                                        k !== "observations" ? (
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

                                    {rec.dressing.observations && (
                                      <div className="p-3 border rounded-lg bg-blue-50">
                                        <label className="text-sm font-medium text-gray-600">
                                          Observations
                                        </label>
                                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                                          {rec.dressing.observations}
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
                  {/* Pagination (by dressing date) */}
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
            <Button onClick={() => {
              if (!selectedPatientDressings) {
                // If no patient selected, could open a patient selector first
                console.warn("No patient selected for dressing change");
                return;
              }
              setAddDressingOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Record Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Dressing Modal */}
      <Dialog open={addDressingOpen} onOpenChange={setAddDressingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Dressing Change</DialogTitle>
          </DialogHeader>
          <DressingForm
            onSubmit={handleAddDressing}
            initialData={{
              woundType: "",
              location: "",
              dressingType: "",
              woundCondition: "",
              observations: ""
            }}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}