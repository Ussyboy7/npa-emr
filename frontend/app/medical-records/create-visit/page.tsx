"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Clock,
  User,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Loader = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
);

const locations = [
  "Bode Thomas Clinic",
  "Headquarters",
  "Tincan",
  "LPC",
  "Rivers Port Complex",
  "Onne Port Complex",
  "Delta Port Complex",
  "Calabar Port",
  "Lekki Deep Sea Port",
];

const visitTypes = [
  { value: "consultation", label: "Consultation" },
  { value: "follow-up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
  { value: "routine-checkup", label: "Routine Checkup" },
  { value: "vaccination", label: "Vaccination" },
];

const clinics = [
  "General",
  "Physiotherapy",
  "Eye",
  "Sickle Cell",
  "Dental",
  "Cardiology",
];

const priorities = ["Low", "Medium", "High", "Emergency"];

// Fixed: Changed id from number to string
interface Patient {
  patient_id: string;
  id: string; // Changed from number to string
  personal_number: string;
  name: string;
  patient_type: string;
  gender: string;
  age: number;
  created_at: string;
  last_visit?: string;
  phone?: string;
  email?: string;
  non_npa_type?: string;
}

interface VisitFormData {
  visit_date: string;
  visit_time: string;
  visit_location: string;
  visit_type: string;
  clinic: string;
  priority: string;
  special_instructions: string;
}

interface APIError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export default function CreateVisitPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [visitCreated, setVisitCreated] = useState(false);
  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const rowsPerPage = 10;

  const [formData, setFormData] = useState<VisitFormData>({
    visit_date: "",
    visit_time: "",
    visit_location: "",
    visit_type: "",
    clinic: "",
    priority: "Medium",
    special_instructions: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const baseURL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const params = new URLSearchParams({
          page: String(currentPage),
          page_size: String(rowsPerPage),
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter !== "All" && { type: categoryFilter }),
        });
        const res = await fetch(`${baseURL}/api/patients/?${params}`, {
          method: "GET",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to fetch patients");
        }
        const data = await res.json();
        const mappedPatients = (data.results || data).map((p: any) => ({
          patient_id: p.patient_id || p.personal_number || "", // Added mapping for patient_id (fallback to personal_number if not present)
          id: p.id, // UUID as string
          personal_number: p.personal_number || "",
          name: `${p.surname || ""} ${p.first_name || ""}`.trim(),
          patient_type: p.patient_type,
          gender: p.gender || "",
          age: p.age || 0,
          created_at: p.created_at || new Date().toISOString(),
          last_visit: p.last_visit || "",
          phone: p.phone || "",
          email: p.email || "",
          non_npa_type: p.non_npa_type,
        }));
        setPatients(mappedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [currentPage, searchTerm, categoryFilter]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.visit_date) errors.visit_date = "Visit date is required";
    if (!formData.visit_time) errors.visit_time = "Visit time is required";
    if (!formData.visit_location)
      errors.visit_location = "Location is required";
    if (!formData.visit_type) errors.visit_type = "Visit type is required";
    if (!formData.clinic) errors.clinic = "Clinic is required";
    if (formData.visit_date) {
      const selectedDate = new Date(formData.visit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.visit_date = "Visit date cannot be in the past";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateFormData = (field: keyof VisitFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCreateVisit = async () => {
    if (!selectedPatient || !validateForm()) return;
    setIsCreatingVisit(true);
    try {
      const payload = {
        patient: selectedPatient.id, // UUID as string
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        visit_location: formData.visit_location,
        visit_type: formData.visit_type,
        clinic: formData.clinic,
        priority: formData.priority,
        special_instructions: formData.special_instructions,
      };
      console.log("Creating visit with payload:", payload);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseURL}/api/visits/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorBody = {};
        try {
          errorBody = await res.json();
        } catch {
          // Ignore JSON parse errors
        }
        const err: APIError = errorBody;
        console.error("Error response:", err);
        const errorMessage =
          err.detail ||
          (err.patient && Array.isArray(err.patient)
            ? err.patient[0]
            : err.patient) ||
          (err.visit_date && Array.isArray(err.visit_date)
            ? err.visit_date[0]
            : err.visit_date) ||
          (err.visit_time && Array.isArray(err.visit_time)
            ? err.visit_time[0]
            : err.visit_time) ||
          (err.visit_location && Array.isArray(err.visit_location)
            ? err.visit_location[0]
            : err.visit_location) ||
          (err.visit_type && Array.isArray(err.visit_type)
            ? err.visit_type[0]
            : err.visit_type) ||
          (err.clinic && Array.isArray(err.clinic)
            ? err.clinic[0]
            : err.clinic) ||
          (err.priority && Array.isArray(err.priority)
            ? err.priority[0]
            : err.priority) ||
          "Create visit failed";
        throw new Error(errorMessage);
      }
      const data = await res.json();
      console.log("Visit created:", data);
      setCreatedVisitId(data.id);
      setVisitCreated(true);
    } catch (err: any) {
      console.error("Failed to create visit:", err);
      setFormErrors({ general: err.message || "Failed to create visit" });
    } finally {
      setIsCreatingVisit(false);
    }
  };

  const resetModal = () => {
    setFormData({
      visit_date: "",
      visit_time: "",
      visit_location: "",
      visit_type: "",
      clinic: "",
      priority: "Medium",
      special_instructions: "",
    });
    setFormErrors({});
    setVisitCreated(false);
    setCreatedVisitId(null);
    setIsVisitModalOpen(false);
    setSelectedPatient(null);
  };

  const openVisitModal = (patient: Patient) => {
    setSelectedPatient(patient);
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, visit_date: today }));
    setIsVisitModalOpen(true);
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.personal_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || p.patient_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Card className="max-w-6xl mx-auto shadow-xl overflow-y-auto max-h-screen">
            <CardHeader className="rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <Calendar className="h-8 w-8" />
                  Create Visit
                </CardTitle>
                <div className="flex justify-end">
                  <Button
                    className="bg-gray-900 hover:bg-gray-900 text-white"
                    onClick={() => router.push("/medical-records/manage-visit")}
                  >
                    View in Manage Visits
                  </Button>
                </div>
              </div>
            </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Search & Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search Patients</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or personal number"
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
                <Label>Filter by Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Patients</SelectItem>
                    <SelectItem value="Employee">Employees</SelectItem>
                    <SelectItem value="Retiree">Retirees</SelectItem>
                    <SelectItem value="NonNPA">Non-NPA</SelectItem>
                    <SelectItem value="Dependent">Dependents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {paginatedPatients.length} of {filteredPatients.length}{" "}
          patients
          {isLoading && <span className="ml-2">Loading...</span>}
        </div>
        {/* Table Section */}
        <div className="border rounded-lg overflow-hidden bg-card text-card-foreground">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  {[
                    "#",
                    "Patient ID",
                    "Full Name",
                    "Gender/Age",
                    "Category",
                    "Last Visit",
                    "Contact",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient, index) => (
                    <tr key={patient.id} className="hover:bg-muted/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {patient.patient_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {patient.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {patient.gender} / {patient.age}y
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className="text-xs">
                          {patient.patient_type}
                          {patient.non_npa_type
                            ? ` (${patient.non_npa_type})`
                            : ""}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {patient.last_visit ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(patient.last_visit)}
                          </div>
                        ) : (
                          <span className="text-gray-400">No visits</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="space-y-1">
                          <div>{patient.phone}</div>
                          <div>{patient.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={() => openVisitModal(patient)}
                          className="bg-gray-900 hover:bg-gray-900 text-white"
                        >
                          Create Visit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-muted-foreground">
                        <Search className="mx-auto h-12 w-12 mb-4" />
                        <p className="text-lg font-medium mb-1">
                          {isLoading
                            ? "Loading patients..."
                            : "No patients found"}
                        </p>
                        <p className="text-sm">
                          {isLoading
                            ? "Please wait..."
                            : "Try adjusting your search or filter criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Success Dialog */}
        {visitCreated && selectedPatient && (
          <Dialog open={isVisitModalOpen} onOpenChange={() => {}}>
            <DialogContent className="max-w-m">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Visit Created Successfully!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">
                      Visit ID: {createdVisitId}
                    </p>
                    <p className="text-sm text-green-700">
                      Visit scheduled for{" "}
                      <strong>{selectedPatient.name}</strong>
                    </p>
                    <p className="text-sm text-green-700">
                      Date: {formatDate(formData.visit_date)} at{" "}
                      {formData.visit_time}
                    </p>
                    <p className="text-sm text-green-700">
                      Location: {formData.visit_location} - {formData.clinic}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    The visit has been created and is ready to be sent to
                    nursing staff.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/medical-records/manage-visit")}
                >
                  View in Manage Visits
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVisitCreated(false);
                    setFormData({
                      visit_date: new Date().toISOString().split("T")[0],
                      visit_time: "",
                      visit_location: "",
                      visit_type: "",
                      clinic: "",
                      priority: "Medium",
                      special_instructions: "",
                    });
                    setFormErrors({});
                    setCreatedVisitId(null);
                    setIsVisitModalOpen(true);
                  }}
                  className="w-full"
                >
                  Create Another Visit
                </Button>
                <Button variant="ghost" onClick={resetModal} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {/* Create Visit Dialog */}
        <Dialog
          open={isVisitModalOpen && !visitCreated}
          onOpenChange={setIsVisitModalOpen}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Create Visit {selectedPatient && `for ${selectedPatient.name}`}
              </DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-6">
                {formErrors.general && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{formErrors.general}</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Patient ID</strong>{" "}
                      {selectedPatient.patient_id}
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedPatient.patient_type}
                      {selectedPatient.non_npa_type
                        ? ` (${selectedPatient.non_npa_type})`
                        : ""}
                    </div>
                    <div>
                      <strong>Gender/Age:</strong> {selectedPatient.gender},{" "}
                      {selectedPatient.age} years
                    </div>
                    <div>
                      <strong>Last Visit:</strong>{" "}
                      {selectedPatient.last_visit
                        ? formatDate(selectedPatient.last_visit)
                        : "No previous visits"}
                    </div>
                    <div className="col-span-2">
                      <strong>Contact:</strong> {selectedPatient.phone} |{" "}
                      {selectedPatient.email}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit-date">Visit Date *</Label>
                    <Input
                      id="visit-date"
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) =>
                        updateFormData("visit_date", e.target.value)
                      }
                      className={formErrors.visit_date ? "border-red-500" : ""}
                    />
                    {formErrors.visit_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="visit-time">Visit Time *</Label>
                    <Input
                      id="visit-time"
                      type="time"
                      value={formData.visit_time}
                      onChange={(e) =>
                        updateFormData("visit_time", e.target.value)
                      }
                      className={formErrors.visit_time ? "border-red-500" : ""}
                    />
                    {formErrors.visit_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_time}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Select
                      value={formData.visit_location}
                      onValueChange={(value: string) =>
                        updateFormData("visit_location", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          formErrors.visit_location ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {loc}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.visit_location && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_location}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Visit Type *</Label>
                    <Select
                      value={formData.visit_type}
                      onValueChange={(value: string) =>
                        updateFormData("visit_type", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          formErrors.visit_type ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select Visit Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {visitTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.visit_type && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_type}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Clinic *</Label>
                    <Select
                      value={formData.clinic}
                      onValueChange={(value: string) =>
                        updateFormData("clinic", value)
                      }
                    >
                      <SelectTrigger
                        className={formErrors.clinic ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select Clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic} value={clinic}>
                            {clinic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.clinic && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.clinic}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: string) =>
                        updateFormData("priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  priority === "Emergency"
                                    ? "bg-red-500"
                                    : priority === "High"
                                    ? "bg-orange-500"
                                    : priority === "Medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              />
                              {priority}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any special instructions or notes..."
                      value={formData.special_instructions}
                      onChange={(e) =>
                        updateFormData("special_instructions", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetModal}
                disabled={isCreatingVisit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateVisit}
                disabled={isCreatingVisit}
                className="min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isCreatingVisit ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  "Create Visit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
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
              {Array.from({ length: Math.min(5, totalPages) }).map(
                (_, index) => {
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
                      variant={
                        pageNumber === currentPage ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                }
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}