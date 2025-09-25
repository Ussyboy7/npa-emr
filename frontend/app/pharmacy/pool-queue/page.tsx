// PharmacyPoolQueue.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Eye, Clock, Users, Pill, UserCheck, X, Activity, AlertTriangle, Shield, Package, CheckCircle, AlertCircle, Stethoscope, RefreshCw, Plus } from 'lucide-react';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_HEADERS = {
  "Content-Type": "application/json",
  // Add CSRF token for production if needed
  // "X-CSRFToken": getCSRFToken(), // Implement this function if needed
};

// Type definitions
type Priority = "Emergency" | "High" | "Medium" | "Low";
type PharmacyStatus = "Pending" | "Processing" | "Ready" | "Partially Dispensed" | "Dispensed" | "On Hold";
type PrescriptionItemStatus = "Pending" | "Available" | "Out of Stock" | "Dispensed" | "Substituted";

interface PrescriptionItem {
  id: string;
  medication_details: {
    id: string;
    name: string;
    strength: string;
    current_stock: number;
    category: string;
  };
  dosage: string;
  frequency: string;
  frequency_display: string;
  duration: string;
  route: string;
  route_display: string;
  quantity: number;
  instructions: string;
  status: PrescriptionItemStatus;
  status_display: string;
  substituted_with_details?: {
    name: string;
    strength: string;
    reason: string;
    approved_by: string;
  };
  dispensed_quantity?: number;
  dispensed_date?: string;
  dispensed_by_name?: string;
  selected_for_dispensing?: boolean;
  partial_quantity?: number;
}

interface PharmacyQueueItem {
  id: string;
  prescription_details: {
    id: string;
    patient_details: {
      id: string;
      name: string;
      age: number;
      gender: string;
      mrn: string;
      allergies: string[];
      phone_number: string;
      employee_category: string;
      location: string;
    };
    prescribed_by_name: string;
    visit_details: {
      consultation_room?: {
        name: string;
      };
      special_instructions?: string;
    };
    items: PrescriptionItem[];
    notes: string;
    created_at: string;
    total_items: number;
    available_items: number;
    out_of_stock_items: number;
    dispensed_items: number;
  };
  status: PharmacyStatus;
  priority: Priority;
  assigned_pharmacist_name?: string;
  wait_time_minutes: number;
  estimated_wait?: number;
  pharmacist_notes?: string;
  created_at: string;
}

interface PharmacyStatistics {
  total_in_queue: number;
  high_priority: number;
  pending: number;
  processing: number;
  ready: number;
  on_hold: number;
  partially_dispensed: number;
  from_consultation: number;
  average_wait_time: number;
  total_available_items: number;
  total_dispensed_items: number;
}

// Utility functions
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });
};

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// API service with error handling
class ApiService {
  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_HEADERS,
          ...(options.headers || {}),
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error fetching ${url}:`, error);
      throw error;
    }
  }

  static async fetchQueue(filters: {
    status?: PharmacyStatus | "All";
    priority?: Priority | "All";
  }) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "All") params.append('status', filters.status);
    if (filters.priority && filters.priority !== "All") params.append('priority', filters.priority);
    
    return this.fetchWithAuth(`${API_URL}/api/pharmacy-queue/?${params}`);
  }

  static async fetchStatistics() {
    return this.fetchWithAuth(`${API_URL}/api/pharmacy-queue/statistics/`);
  }

  static async fetchMedications(search = '') {
    const url = search 
      ? `${API_URL}/api/medications/?search=${encodeURIComponent(search)}`
      : `${API_URL}/api/medications/`;
    return this.fetchWithAuth(url);
  }

  static async assignToMe(queueId: string) {
    return this.fetchWithAuth(`${API_URL}/api/pharmacy-queue/${queueId}/assign_to_me/`, {
      method: 'POST',
    });
  }

  static async markReady(queueId: string) {
    return this.fetchWithAuth(`${API_URL}/api/pharmacy-queue/${queueId}/mark_ready/`, {
      method: 'POST',
    });
  }

  static async dispenseItems(queueId: string, items: any[]) {
    return this.fetchWithAuth(`${API_URL}/api/pharmacy-queue/${queueId}/dispense_items/`, {
      method: 'POST',
      body: JSON.stringify({
        items: items.map(item => ({
          item_id: item.id,
          quantity_to_dispense: item.partial_quantity || item.quantity,
          pharmacist_notes: ""
        }))
      }),
    });
  }

  static async substituteMedication(queueId: string, prescriptionItemId: string, substituteMedicationId: string, reason: string) {
    return this.fetchWithAuth(`${API_URL}/api/pharmacy-queue/${queueId}/substitute_medication/`, {
      method: 'POST',
      body: JSON.stringify({
        prescription_item_id: prescriptionItemId,
        substitute_medication_id: substituteMedicationId,
        reason,
        approved_by: "current-user"
      }),
    });
  }
}

export default function PharmacyPoolQueue() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [statusFilter, setStatusFilter] = useState<PharmacyStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [showSubstituteModal, setShowSubstituteModal] = useState<string | null>(null);
  const [substituteForm, setSubstituteForm] = useState({
    substitute_medication_id: "",
    reason: ""
  });
  const [queue, setQueue] = useState<PharmacyQueueItem[]>([]);
  const [statistics, setStatistics] = useState<PharmacyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const itemsPerPage = 5;

  // Data fetching with useCallback for performance
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ApiService.fetchQueue({
        status: statusFilter,
        priority: priorityFilter,
      });
      
      // Filter out any items with invalid structure
      const validQueue = (data.results || data).filter((item: any) => 
        item && 
        item.prescription_details && 
        item.prescription_details.patient_details &&
        item.prescription_details.items
      );
      setQueue(validQueue);
      setError(null);
    } catch (error) {
      console.error('Error fetching pharmacy queue:', error);
      setError('Failed to fetch pharmacy queue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  const fetchStatistics = useCallback(async () => {
    try {
      const data = await ApiService.fetchStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  const fetchMedications = useCallback(async (search = '') => {
    try {
      const data = await ApiService.fetchMedications(search);
      setMedications(data.results || data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsRefreshing(true);
      await Promise.all([
        fetchQueue(),
        fetchStatistics(),
        fetchMedications()
      ]);
      setIsRefreshing(false);
    };
    
    loadData();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchQueue();
      fetchStatistics();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchQueue, fetchStatistics]);

  // Handle prescription selection for dispensing
  const handlePrescriptionSelection = (queueId: string, prescriptionItemId: string, selected: boolean) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === queueId
          ? {
              ...item,
              prescription_details: {
                ...item.prescription_details,
                items: item.prescription_details.items.map(prescItem =>
                  prescItem.id === prescriptionItemId
                    ? { ...prescItem, selected_for_dispensing: selected }
                    : prescItem
                )
              }
            }
          : item
      )
    );
  };

  // Handle select all prescriptions for a queue item
  const handleSelectAllPrescriptions = (queueId: string, selectAll: boolean) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === queueId
          ? {
              ...item,
              prescription_details: {
                ...item.prescription_details,
                items: item.prescription_details.items.map(prescItem =>
                  (prescItem.status === "Available" || prescItem.status === "Substituted")
                    ? { ...prescItem, selected_for_dispensing: selectAll }
                    : prescItem
                )
              }
            }
          : item
      )
    );
  };

  // Handle partial quantity change
  const handlePartialQuantityChange = (queueId: string, prescriptionItemId: string, quantity: number) => {
    // Validate quantity
    const parsedQuantity = Math.max(1, quantity);
    setQueue(prev =>
      prev.map(item =>
        item.id === queueId
          ? {
              ...item,
              prescription_details: {
                ...item.prescription_details,
                items: item.prescription_details.items.map(prescItem =>
                  prescItem.id === prescriptionItemId
                    ? { ...prescItem, partial_quantity: parsedQuantity }
                    : prescItem
                )
              }
            }
          : item
      )
    );
  };

  // Handle bulk dispensing of selected prescriptions
  const handleDispenseSelected = async (queueId: string) => {
    const queueItem = queue.find(q => q.id === queueId);
    if (!queueItem) return;

    const selectedItems = queueItem.prescription_details.items.filter(item => item.selected_for_dispensing);
    if (selectedItems.length === 0) {
      alert("Please select at least one prescription to dispense");
      return;
    }

    try {
      setIsRefreshing(true);
      await ApiService.dispenseItems(queueId, selectedItems);
      await fetchQueue();
      await fetchStatistics();
      alert('Items dispensed successfully');
    } catch (error) {
      console.error('Error dispensing items:', error);
      alert(`Failed to dispense items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle pharmacy actions
  const handleAssignToMe = async (queueId: string) => {
    try {
      setIsRefreshing(true);
      await ApiService.assignToMe(queueId);
      await fetchQueue();
      alert('Prescription assigned successfully');
    } catch (error) {
      console.error('Error assigning prescription:', error);
      alert(`Failed to assign prescription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkReady = async (queueId: string) => {
    try {
      setIsRefreshing(true);
      await ApiService.markReady(queueId);
      await fetchQueue();
      alert('Prescription marked as ready');
    } catch (error) {
      console.error('Error marking prescription as ready:', error);
      alert(`Failed to mark prescription as ready: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubstituteDrug = async (prescriptionItemId: string) => {
    if (!substituteForm.substitute_medication_id || !substituteForm.reason) {
      alert("Please fill in all substitute fields");
      return;
    }

    try {
      setIsRefreshing(true);
      const [queueId] = (showSubstituteModal || '').split('|');
      await ApiService.substituteMedication(
        queueId, 
        prescriptionItemId, 
        substituteForm.substitute_medication_id, 
        substituteForm.reason
      );
      
      await fetchQueue();
      setShowSubstituteModal(null);
      setSubstituteForm({ substitute_medication_id: "", reason: "" });
      alert('Medication substituted successfully');
    } catch (error) {
      console.error('Error substituting medication:', error);
      alert(`Failed to substitute medication: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get badge colors
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "Emergency": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: PharmacyStatus) => {
    switch (status) {
      case "Processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready": return "bg-green-100 text-green-800 border-green-200";
      case "Pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Dispensed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Partially Dispensed": return "bg-orange-100 text-orange-800 border-orange-200";
      case "On Hold": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPrescriptionStatusColor = (status: PrescriptionItemStatus) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800 border-green-200";
      case "Pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Dispensed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border-red-200";
      case "Substituted": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter queue based on search term with safe property access
  const filteredQueue = queue.filter(item => {
    // Ensure the item has the required structure
    if (!item || !item.prescription_details || !item.prescription_details.patient_details || !item.prescription_details.items) {
      return false;
    }

    const matchesSearch = item.prescription_details.patient_details.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      item.prescription_details.items.some(prescItem => 
        prescItem.medication_details?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredQueue.length / itemsPerPage);
  const paginatedQueue = filteredQueue.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading pharmacy queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pharmacy Pool Queue</h1>
        {isRefreshing && (
          <div className="flex items-center text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Updating...</span>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_in_queue}</div>
              <p className="text-xs text-muted-foreground">{statistics.high_priority} high priority</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.total_available_items}</div>
              <p className="text-xs text-muted-foreground">Ready to dispense</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dispensed Items</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{statistics.total_dispensed_items}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.processing}</div>
              <p className="text-xs text-muted-foreground">Being prepared</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.on_hold}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(statistics.average_wait_time)} min</div>
              <p className="text-xs text-muted-foreground">Processing time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Queue</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient or medication"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Priority Filter</Label>
            <Select 
              value={priorityFilter} 
              onValueChange={(value: Priority | "All") => {
                setPriorityFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Emergency">Emergency Priority</SelectItem>
                <SelectItem value="High">High Priority</SelectItem>
                <SelectItem value="Medium">Medium Priority</SelectItem>
                <SelectItem value="Low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status Filter</Label>
            <Select 
              value={statusFilter} 
              onValueChange={(value: PharmacyStatus | "All") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Partially Dispensed">Partially Dispensed</SelectItem>
                <SelectItem value="Dispensed">Dispensed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedQueue.length} of {filteredQueue.length} prescriptions in queue
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {paginatedQueue.length > 0 ? (
          paginatedQueue.map((item) => {
            // Additional safety checks
            if (!item.prescription_details || !item.prescription_details.patient_details) {
              return null;
            }

            const patient = item.prescription_details.patient_details;
            const prescription = item.prescription_details;

            const calculatedWaitTime = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 60000);

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <span>{patient.name}</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          RX ID: {prescription.id.slice(-8)}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-orange-600 font-medium">
                            Waiting: {calculatedWaitTime} min
                          </span>
                          {item.estimated_wait && (
                            <span className="text-blue-600">
                              • Est. Complete: {item.estimated_wait} min
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span><strong>Location:</strong> {patient.location}</span>
                            <span><strong>Gender:</strong> {patient.gender}</span>
                            <span><strong>Age:</strong> {patient.age} yrs</span>
                            <span><strong>Category:</strong> {patient.employee_category}</span>
                            <span><strong>Phone:</strong> {patient.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span><strong>Prescribed by:</strong> {prescription.prescribed_by_name}</span>
                          </div>
                          {prescription.visit_details?.consultation_room && (
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 text-xs font-medium">
                                From Consultation ({prescription.visit_details.consultation_room.name})
                              </span>
                            </div>
                          )}
                          {patient.allergies && patient.allergies.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                              <span className="text-red-600 text-xs font-medium">
                                Allergies: {patient.allergies.join(", ")}
                              </span>
                            </div>
                          )}
                          {prescription.visit_details?.special_instructions && (
                            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                              <strong>Special Instructions:</strong> {prescription.visit_details.special_instructions}
                            </div>
                          )}
                          {item.pharmacist_notes && (
                            <div className="text-xs text-gray-600">
                              <strong>Pharmacist Notes:</strong> {item.pharmacist_notes}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                      <Badge className={getStatusColor(item.status)} variant="outline">
                        {item.status}
                      </Badge>
                      {prescription.visit_details?.consultation_room && (
                        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                          From Consult
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                    <div>
                      <strong>Order Date:</strong>
                      <div>{formatDate(item.created_at)}</div>
                    </div>
                    <div>
                      <strong>Order Time:</strong>
                      <div>{formatTime(item.created_at)}</div>
                    </div>
                    <div>
                      <strong>Assigned to:</strong>
                      <div>{item.assigned_pharmacist_name || 'Unassigned'}</div>
                    </div>
                    <div>
                      <strong>Prescriptions:</strong>
                      <div>{prescription.available_items} available, {prescription.out_of_stock_items} out of stock, {prescription.dispensed_items} dispensed</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedQueueId(item.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View & Dispense Prescriptions
                    </Button>
                    {item.status === "Pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAssignToMe(item.id)}
                        className="hover:bg-blue-600"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assign & Process
                      </Button>
                    )}
                    {item.status === "Processing" && (
                      <Button 
                        size="sm"
                        onClick={() => handleMarkReady(item.id)}
                        className="hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Ready
                      </Button>
                    )}
                    {item.status === "Dispensed" && (
                      <Button size="sm" variant="outline" disabled>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        All Dispensed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-1">No prescriptions in queue</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      <Dialog open={!!selectedQueueId} onOpenChange={() => setSelectedQueueId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescriptions</DialogTitle>
          </DialogHeader>
          {selectedQueueId && (() => {
            const item = queue.find(q => q.id === selectedQueueId);
            if (!item || !item.prescription_details) return null;

            const selectablePrescriptions = item.prescription_details.items.filter(p => 
              p.status === "Available" || p.status === "Substituted"
            );
            const hasSelectablePrescriptions = selectablePrescriptions.length > 0;
            const allSelected = selectablePrescriptions.length > 0 && 
              selectablePrescriptions.every(p => p.selected_for_dispensing);
            const someSelected = selectablePrescriptions.some(p => p.selected_for_dispensing);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    Prescriptions for {item.prescription_details.patient_details.name} 
                    (RX ID: {item.prescription_details.id.slice(-8)}):
                  </h4>
                  {hasSelectablePrescriptions && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`select-all-modal-${item.id}`}
                        checked={allSelected}
                        onCheckedChange={(checked) => handleSelectAllPrescriptions(item.id, !!checked)}
                      />
                      <Label htmlFor={`select-all-modal-${item.id}`} className="text-xs">
                        Select All Available
                      </Label>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {item.prescription_details.items.map((prescription) => (
                    <div key={prescription.id} className="bg-gray-50 p-3 rounded text-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {(prescription.status === "Available" || prescription.status === "Substituted") && (
                            <Checkbox
                              id={`prescription-modal-${prescription.id}`}
                              checked={prescription.selected_for_dispensing || false}
                              onCheckedChange={(checked) =>
                                handlePrescriptionSelection(item.id, prescription.id, !!checked)
                              }
                            />
                          )}
                          <div className="space-y-1 flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <span>{prescription.medication_details.name} {prescription.medication_details.strength}</span>
                              <Badge className={getPrescriptionStatusColor(prescription.status)} variant="outline">
                                {prescription.status_display}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Dosage:</strong> {prescription.dosage} {prescription.frequency_display}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Duration:</strong> {prescription.duration} | <strong>Quantity:</strong> {prescription.quantity}
                              {prescription.dispensed_quantity && (
                                <span className="text-green-600 ml-2">
                                  (Dispensed: {prescription.dispensed_quantity})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Instructions:</strong> {prescription.instructions}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Stock Level:</strong> {prescription.medication_details.current_stock} units
                              {prescription.medication_details.current_stock < 10 && prescription.medication_details.current_stock > 0 && (
                                <span className="text-orange-600 ml-1">(Low Stock)</span>
                              )}
                            </div>
                            {prescription.substituted_with_details && (
                              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                                <strong>Substitution:</strong> {prescription.substituted_with_details.name} {prescription.substituted_with_details.strength}<br/>
                                <strong>Reason:</strong> {prescription.substituted_with_details.reason}<br/>
                                <strong>Approved by:</strong> {prescription.substituted_with_details.approved_by}
                              </div>
                            )}
                            {prescription.dispensed_by_name && (
                              <div className="text-xs text-green-600">
                                <strong>Dispensed by:</strong> {prescription.dispensed_by_name} on {prescription.dispensed_date}
                              </div>
                            )}
                            {prescription.selected_for_dispensing && (prescription.status === "Available" || prescription.status === "Substituted") && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <Label htmlFor={`partial-qty-modal-${prescription.id}`} className="text-xs">
                                  Quantity to Dispense (Max: {prescription.quantity})
                                </Label>
                                <Input
                                  id={`partial-qty-modal-${prescription.id}`}
                                  type="number"
                                  min="1"
                                  max={prescription.quantity}
                                  value={prescription.partial_quantity || prescription.quantity}
                                  onChange={(e) => handlePartialQuantityChange(
                                    item.id, 
                                    prescription.id, 
                                    parseInt(e.target.value) || prescription.quantity
                                  )}
                                  className="mt-1 h-8 text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2 flex-wrap">
                          {prescription.status === "Out of Stock" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowSubstituteModal(`${item.id}|${prescription.id}`)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Substitute
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasSelectablePrescriptions && someSelected && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        {selectablePrescriptions.filter(p => p.selected_for_dispensing).length} item(s) selected for dispensing
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleDispenseSelected(item.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Dispense Selected
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Substitute Modal */}
      <Dialog open={!!showSubstituteModal} onOpenChange={() => setShowSubstituteModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Substitute Medication</DialogTitle>
            <DialogDescription>
              Select a substitute for the out-of-stock medication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="substitute-medication">Substitute Medication *</Label>
              <Select
                value={substituteForm.substitute_medication_id}
                onValueChange={(value) => setSubstituteForm({ ...substituteForm, substitute_medication_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select substitute" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name} {med.strength}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="substitute-reason">Reason for Substitution *</Label>
              <Textarea
                id="substitute-reason"
                value={substituteForm.reason}
                onChange={(e) => setSubstituteForm({ ...substituteForm, reason: e.target.value })}
                placeholder="Enter reason for substitution"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (showSubstituteModal) {
                const [, prescriptionItemId] = showSubstituteModal.split('|');
                handleSubstituteDrug(prescriptionItemId);
              }
            }}>
              Substitute
            </Button>
            <Button variant="outline" onClick={() => setShowSubstituteModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}