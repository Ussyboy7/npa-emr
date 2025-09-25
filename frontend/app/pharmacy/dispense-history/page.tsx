"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Calendar, Package, Clock, RefreshCw, FileText, ArrowUpDown, Download, Pill, User, Activity, Users, BarChart3, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Type definitions for Dispense Record
interface DispenseRecord {
  id: string;
  queueId: string;
  date: string;
  time: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  phoneNumber: string;
  employeeCategory: string;
  location: string;
  prescribedBy: string;
  consultationRoom: string;
  medications: Array<{
    name: string;
    quantity: number;
    originalPrescription: string;
    substituted: boolean;
    substitutionReason?: string;
    batchNumber: string;
    expiryDate: string;
    manufacturer: string;
  }>;
  pharmacist: string;
  substitutions: number;
  status: string;
  waitTime: string;
  processingTime: string;
  priority: string;
  allergies: string[];
  specialInstructions: string;
  refillsRemaining: Record<string, number>;
  nextRefillDate: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EnhancedDispenseHistory() {
  const [dispensedRecords, setDispensedRecords] = useState<DispenseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<DispenseRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [reportType, setReportType] = useState("daily");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportStatus, setReportStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Fetch dispense history from database
  const fetchDispenseHistory = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pharmacy-queue/?page=${page}&limit=${itemsPerPage}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data); // Debug: Log raw API response
        const transformedRecords: DispenseRecord[] = (data.results || []).map((queue: any) => {
          const prescription = queue.prescription_details || {};
          const patient = prescription.patient_details || {};
          const visit = prescription.visit_details || {};
          const createdAt = queue.created_at ? new Date(queue.created_at) : new Date();
          const updatedAt = queue.updated_at ? new Date(queue.updated_at) : createdAt;
          const processingTime = Math.round((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60)) + " min";
          return {
            id: queue.id || `DIS${Math.random().toString(36).substr(2, 9)}`,
            queueId: prescription.id || `RX${Math.random().toString(36).substr(2, 9)}`,
            date: queue.created_at ? queue.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            time: queue.created_at ? queue.created_at.split("T")[1].slice(0, 5) : "00:00",
            patientName: patient.name || "Unknown Patient",
            patientId: patient.mrn || "P-UNKNOWN",
            age: patient.age || 0,
            gender: patient.gender || "Unknown",
            phoneNumber: patient.phone_number || "N/A",
            employeeCategory: patient.employee_category || "Unknown",
            location: patient.location || "N/A",
            prescribedBy: prescription.prescribed_by_name || "Unknown",
            consultationRoom: visit.consultation_room?.name || "N/A",
            medications: (prescription.items || []).map((item: any) => ({
              name: item.medication_details?.name || "Unknown Medication",
              quantity: item.dispensed_quantity || item.quantity || 0,
              originalPrescription: item.medication_details?.name || "Unknown",
              substituted: !!item.substituted_with,
              substitutionReason: item.substitution_reason || "N/A",
              batchNumber: item.medication_details?.barcode || "N/A", // Use barcode as batch_number
              expiryDate: item.medication_details?.batches?.[0]?.expiry_date || "N/A",
              manufacturer: item.medication_details?.manufacturer || "N/A",
            })),
            pharmacist: queue.assigned_pharmacist_name || "N/A",
            substitutions: (prescription.items || []).filter((item: any) => !!item.substituted_with).length,
            status: queue.status || "Dispensed",
            waitTime: `${queue.wait_time_minutes || 0} min`,
            processingTime: processingTime,
            priority: queue.priority || "Medium",
            allergies: patient.allergies || [],
            specialInstructions: visit.special_instructions || "N/A",
            refillsRemaining: (prescription.items || []).reduce((acc: Record<string, number>, item: any) => {
              acc[item.medication_details?.name || "Unknown"] = 0; // Default to 0; backend doesn't provide refills_remaining
              return acc;
            }, {}),
            nextRefillDate: prescription.next_refill_date || "N/A",
          };
        });
        setDispensedRecords(transformedRecords);
        setTotalPages(Math.ceil((data.count || transformedRecords.length) / itemsPerPage));
        if (transformedRecords.length === 0) {
          toast({
            title: "No Records",
            description: "No dispense records found in the database.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Loaded ${transformedRecords.length} dispense records.`,
          });
        }
      } else {
        const text = await response.text();
        console.error("Dispense history fetch failed:", { status: response.status, text });
        setDispensedRecords([]);
        toast({
          title: "Error",
          description: `Failed to fetch dispense history: ${text || response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching dispense history:", error);
      setDispensedRecords([]);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching dispense history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and refresh on dispense
  useEffect(() => {
    fetchDispenseHistory(currentPage);
    const handleDispense = () => fetchDispenseHistory(1);
    window.addEventListener("dispenseCompleted", handleDispense);
    return () => window.removeEventListener("dispenseCompleted", handleDispense);
  }, [currentPage]);

  // CSV Export
  const exportCSV = () => {
    if (dispensedRecords.length === 0) {
      toast({
        title: "No Data",
        description: "No records available to export.",
        variant: "destructive",
      });
      return;
    }
    const headers = [
      "ID,Queue ID,Date,Time,Patient Name,Patient ID,Status,Priority,Medications",
    ];
    const rows = dispensedRecords.map(record => {
      const meds = record.medications.map(m => `${m.name} x${m.quantity}`).join(";");
      return `${record.id},${record.queueId},${record.date},${record.time},${record.patientName},${record.patientId},${record.status},${record.priority},${meds}`;
    });
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dispense_history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: "Success",
      description: "Dispense history exported as CSV.",
    });
  };

  // Filtering
  const filteredRecords = useMemo(() => {
    return dispensedRecords.filter(record => {
      const matchesSearch =
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || record.priority === priorityFilter;
      const matchesDateRange = (!dateRange.from || record.date >= dateRange.from) &&
        (!dateRange.to || record.date <= dateRange.to);
      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [dispensedRecords, searchTerm, statusFilter, priorityFilter, dateRange]);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();
          break;
        case "patient":
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case "waitTime":
          comparison = parseInt(a.waitTime) - parseInt(b.waitTime);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [filteredRecords, sortBy, sortOrder]);

  // Paginated records
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => ({
    total: dispensedRecords.length,
    completed: dispensedRecords.filter(r => r.status === "Dispensed").length,
    partial: dispensedRecords.filter(r => r.status === "Partially Dispensed").length,
    substitutionRate: (dispensedRecords.filter(r => r.substitutions > 0).length / dispensedRecords.length * 100).toFixed(1) || "0.0",
    avgWaitTime: Math.round(dispensedRecords.reduce((sum, r) => sum + parseInt(r.waitTime || "0"), 0) / dispensedRecords.length) || 0,
    avgProcessingTime: Math.round(dispensedRecords.reduce((sum, r) => sum + parseInt(r.processingTime || "0"), 0) / dispensedRecords.length) || 0,
    highPriority: dispensedRecords.filter(r => r.priority === "High").length,
    totalMedications: dispensedRecords.reduce((sum, r) => sum + r.medications.length, 0),
    avgMedicationsPerDispense: (dispensedRecords.reduce((sum, r) => sum + r.medications.length, 0) / dispensedRecords.length).toFixed(1) || "0.0",
  }), [dispensedRecords]);

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dispensed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Partially Dispensed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Normal":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const generateCustomReport = () => {
    console.log('Generating custom report', { type: reportType, startDate: reportStartDate, endDate: reportEndDate, status: reportStatus });
    toast({
      title: "Report Generated",
      description: "Check console for report details.",
    });
    setShowCustomReportModal(false);
  };

  // Record Detail Modal
  const RecordDetailModal = () => {
    if (!showDetailModal || !selectedRecord) return null;

    return (
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispense Record Details</DialogTitle>
            <CardDescription>Record ID: {selectedRecord.id} | Queue ID: {selectedRecord.queueId}</CardDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><strong>Name:</strong> {selectedRecord.patientName}</div>
                  <div><strong>ID:</strong> {selectedRecord.patientId}</div>
                  <div><strong>Age:</strong> {selectedRecord.age}</div>
                  <div><strong>Gender:</strong> {selectedRecord.gender}</div>
                  <div><strong>Phone:</strong> {selectedRecord.phoneNumber}</div>
                  <div><strong>Category:</strong> {selectedRecord.employeeCategory}</div>
                  <div><strong>Location:</strong> {selectedRecord.location}</div>
                  <div className="col-span-2">
                    <strong>Allergies:</strong> {selectedRecord.allergies.length > 0 ? selectedRecord.allergies.join(", ") : "None"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications Dispensed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRecord.medications.length > 0 ? (
                    selectedRecord.medications.map((med, index) => (
                      <div key={index} className="border rounded p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{med.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div><strong>Quantity:</strong> {med.quantity}</div>
                          <div><strong>Batch:</strong> {med.batchNumber}</div>
                          <div><strong>Expiry:</strong> {med.expiryDate}</div>
                          <div><strong>Manufacturer:</strong> {med.manufacturer}</div>
                          {med.substituted && (
                            <>
                              <div className="col-span-2">
                                <strong>Original:</strong> {med.originalPrescription}
                              </div>
                              <div className="col-span-3">
                                <strong>Substitution Reason:</strong> {med.substitutionReason}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No medications dispensed</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dispensing Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Processing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Date:</strong> {formatDate(selectedRecord.date)}</div>
                <div><strong>Time:</strong> {selectedRecord.time}</div>
                <div><strong>Prescribed by:</strong> {selectedRecord.prescribedBy}</div>
                <div><strong>Consultation Room:</strong> {selectedRecord.consultationRoom}</div>
                <div><strong>Pharmacist:</strong> {selectedRecord.pharmacist}</div>
                <div><strong>Wait Time:</strong> {selectedRecord.waitTime}</div>
                <div><strong>Processing Time:</strong> {selectedRecord.processingTime}</div>
                <div className="flex items-center gap-2">
                  <strong>Priority:</strong>
                  <Badge className={getPriorityColor(selectedRecord.priority)} variant="outline">
                    {selectedRecord.priority}
                  </Badge>
                </div>
                <div><strong>Special Instructions:</strong> {selectedRecord.specialInstructions}</div>
                <div><strong>Next Refill Date:</strong> {selectedRecord.nextRefillDate}</div>
                <div><strong>Refills Remaining:</strong></div>
                <div className="ml-4 space-y-1">
                  {Object.entries(selectedRecord.refillsRemaining).length > 0 ? (
                    Object.entries(selectedRecord.refillsRemaining).map(([med, refills]) => (
                      <div key={med} className="text-sm">{med}: {refills} refills</div>
                    ))
                  ) : (
                    <div className="text-sm">No refills available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            <Button onClick={() => console.log('Printing record:', selectedRecord)}>
              <FileText className="h-4 w-4 mr-2" />
              Print Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Custom Report Modal
  const CustomReportModal = () => {
    return (
      <Dialog open={showCustomReportModal} onOpenChange={setShowCustomReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="report-start">Start Date</Label>
                  <Input
                    id="report-start"
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-end">End Date</Label>
                  <Input
                    id="report-end"
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={reportStatus} onValueChange={setReportStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Dispensed">Dispensed</SelectItem>
                  <SelectItem value="Partially Dispensed">Partially Dispensed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateCustomReport} className="w-full">
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dispense History & Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => fetchDispenseHistory(currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {viewMode === "table" ? "Card View" : "Table View"}
          </Button>
          <Button onClick={() => setShowCustomReportModal(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dispensed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} dispensed, {stats.partial} partial
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">
              Processing: {stats.avgProcessingTime} min
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Substitution Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.substitutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.highPriority} high priority
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedications}</div>
            <p className="text-xs text-muted-foreground">Across all dispenses</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Medications/Dispense</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMedicationsPerDispense}</div>
            <p className="text-xs text-muted-foreground">Per dispense record</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search & Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Records</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Patient, medication, or record ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Dispensed">Dispensed</SelectItem>
                    <SelectItem value="Partially Dispensed">Partially Dispensed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority Filter</Label>
                <Select value={priorityFilter} onValueChange={(value) => {
                  setPriorityFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Priorities</SelectItem>
                    <SelectItem value="High">High Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="Normal">Normal Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, from: e.target.value }));
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, to: e.target.value }));
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date & Time</SelectItem>
                      <SelectItem value="patient">Patient Name</SelectItem>
                      <SelectItem value="waitTime">Wait Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {paginatedRecords.length} of {filteredRecords.length} dispensed records
          {filteredRecords.length !== dispensedRecords.length &&
            ` (filtered from ${dispensedRecords.length} total)`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dispense history...</p>
        </div>
      )}

      {/* No Records State */}
      {!loading && dispensedRecords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No dispense records found in the database.</p>
        </div>
      )}

      {/* Table View */}
      {!loading && dispensedRecords.length > 0 && viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap">
                        <div>{formatDate(record.date)}</div>
                        <div className="text-sm text-gray-500">{record.time}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-sm text-gray-500">{record.patientId}</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {record.medications.map((med, index) => (
                            <div key={index} className="text-sm">
                              {med.name} x {med.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {!loading && dispensedRecords.length > 0 && viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{record.patientName}</CardTitle>
                    <CardDescription>{record.patientId}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Date:</strong> {formatDate(record.date)} {record.time}</div>
                  <div><strong>Medications:</strong></div>
                  <ul className="list-disc ml-4">
                    {record.medications.map((med, index) => (
                      <li key={index}>{med.name} x {med.quantity}</li>
                    ))}
                  </ul>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetailModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {dispensedRecords.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <RecordDetailModal />
      <CustomReportModal />
    </div>
  );
}