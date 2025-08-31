"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Clock, User, Calendar, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Mock locations and visit types
const locations = ["Bode Thomas Clinic", "HQ", "Tincan", "LPC"];
const visitTypes = [
 { value: "consultation", label: "Consultation", duration: 30 },
 { value: "follow-up", label: "Follow-up", duration: 15 },
 { value: "emergency", label: "Emergency", duration: 60 },
 { value: "routine-checkup", label: "Routine Checkup", duration: 45 },
 { value: "vaccination", label: "Vaccination", duration: 15 }
];
const clinics = ["General", "Physiotherapy", "Eye", "Sickle Cell", "Dental", "Cardiology"];
const priorities = ["Low", "Medium", "High", "Emergency"];

interface Patient {
 id: number;
 personalNumber: string;
 fullName: string;
 gender: string;
 age: number;
 category: string;
 registeredAt: string;
 lastVisit?: string;
 phoneNumber?: string;
 email?: string;
}

interface VisitFormData {
 visitDate: string;
 visitTime: string;
 visitLocation: string;
 visitType: string;
 clinic: string;
 priority: string;
 specialInstructions: string;
}

const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return date.toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: '2-digit'
 });
};

export default function CreateVisitPage() {
 const router = useRouter();
 const [patients, setPatients] = useState<Patient[]>([]);
 const [searchTerm, setSearchTerm] = useState("");
 const [categoryFilter, setCategoryFilter] = useState("All");
 const [currentPage, setCurrentPage] = useState(1);
 const [isLoading, setIsLoading] = useState(false);
 const rowsPerPage = 5;

 // Visit modal state
 const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
 const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
 const [isCreatingVisit, setIsCreatingVisit] = useState(false);
 const [visitCreated, setVisitCreated] = useState(false);
 const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);
 const [formErrors, setFormErrors] = useState<Record<string, string>>({});

 // Form data
 const [formData, setFormData] = useState<VisitFormData>({
 visitDate: "",
 visitTime: "",
 visitLocation: "",
 visitType: "",
 clinic: "",
 priority: "Medium",
 specialInstructions: "",
 });

 // Load enhanced test patients
 useEffect(() => {
 setIsLoading(true);
 const testData: Patient[] = [
 {
 id: 1,
 personalNumber: "PN-001",
 fullName: "John Doe",
 gender: "Male",
 age: 35,
 category: "Employee",
 registeredAt: "2025-01-10",
 lastVisit: "2025-07-15",
 phoneNumber: "+234-801-234-5678",
 email: "john.doe@npa.gov.ng"
 },
 {
 id: 2,
 personalNumber: "PN-002",
 fullName: "Jane Smith",
 gender: "Female",
 age: 28,
 category: "Retiree",
 registeredAt: "2024-12-15",
 lastVisit: "2025-06-20",
 phoneNumber: "+234-802-345-6789",
 email: "jane.smith@npa.gov.ng"
 },
 {
 id: 3,
 personalNumber: "PN-003",
 fullName: "Michael Johnson",
 gender: "Male",
 age: 42,
 category: "Non-NPA",
 registeredAt: "2025-02-01",
 phoneNumber: "+234-803-456-7890",
 email: "michael.johnson@email.com"
 },
 ];

 // Simulate API delay
 setTimeout(() => {
 setPatients(testData);
 setIsLoading(false);
 }, 500);
 }, []);

 const validateForm = (): boolean => {
 const errors: Record<string, string> = {};

 if (!formData.visitDate) errors.visitDate = "Visit date is required";
 if (!formData.visitTime) errors.visitTime = "Visit time is required";
 if (!formData.visitLocation) errors.visitLocation = "Location is required";
 if (!formData.visitType) errors.visitType = "Visit type is required";
 if (!formData.clinic) errors.clinic = "Clinic is required";


 // Date validation
 if (formData.visitDate) {
 const selectedDate = new Date(formData.visitDate);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 
 if (selectedDate < today) {
 errors.visitDate = "Visit date cannot be in the past";
 }
 }

 setFormErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const updateFormData = (field: keyof VisitFormData, value: any) => {
 setFormData(prev => ({ ...prev, [field]: value }));

 // Clear error when user starts typing
 if (formErrors[field]) {
 setFormErrors(prev => ({ ...prev, [field]: "" }));
 }

 // Auto-set duration based on visit type
 if (field === 'visitType') {
 const selectedType = visitTypes.find(t => t.value === value);
 if (selectedType) {
 setFormData(prev => ({ ...prev, estimatedDuration: selectedType.duration }));
 }
 }
 };

 const handleCreateVisit = async () => {
 if (!selectedPatient || !validateForm()) return;

 setIsCreatingVisit(true);

 try {
 // Simulate API call
 await new Promise(resolve => setTimeout(resolve, 2000));
 
 const newVisitId = `V${Date.now()}`;
 setCreatedVisitId(newVisitId);
 setVisitCreated(true);
 
 console.log("Visit Created:", {
 visitId: newVisitId,
 patientId: selectedPatient.id,
 ...formData,
 });
 
 } catch (error) {
 console.error("Failed to create visit:", error);
 alert("Failed to create visit. Please try again.");
 } finally {
 setIsCreatingVisit(false);
 }
 };

 const resetModal = () => {
 setFormData({
 visitDate: "",
 visitTime: "",
 visitLocation: "",
 visitType: "",
 clinic: "",
 priority: "Medium",
 specialInstructions: "",
 });
 setFormErrors({});
 setVisitCreated(false);
 setCreatedVisitId(null);
 setIsVisitModalOpen(false);
 };

 const openVisitModal = (patient: Patient) => {
 setSelectedPatient(patient);
 // Set default date to today
 const today = new Date().toISOString().split('T')[0];
 setFormData(prev => ({ ...prev, visitDate: today }));
 setIsVisitModalOpen(true);
 };

 const filteredPatients = patients.filter((p) => {
 const matchesSearch =
 p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 p.personalNumber.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory =
 categoryFilter === "All" || p.category === categoryFilter;
 return matchesSearch && matchesCategory;
 });

 const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
 const paginatedPatients = filteredPatients.slice(
 (currentPage - 1) * rowsPerPage,
 currentPage * rowsPerPage
 );

 if (visitCreated && selectedPatient) {
 return (
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
 Visit scheduled for <strong>{selectedPatient.fullName}</strong>
 </p>
 <p className="text-sm text-green-700">
 Date: {formatDate(formData.visitDate)} at {formData.visitTime}
 </p>
 <p className="text-sm text-green-700">
 Location: {formData.visitLocation} - {formData.clinic}
 </p>
 </div>
 </div>

 <div className="text-sm text-gray-600">
 <p>The visit has been created and is ready to be sent to nursing staff.</p>
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
 setSelectedPatient(null);
 // Reset for creating another visit for same patient
 openVisitModal(selectedPatient);
 }}
 className="w-full"
 >
 Create Another Visit
 </Button>
 <Button 
 variant="ghost" 
 onClick={resetModal}
 className="w-full"
 >
 Close
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
 }

 return (
 <div className="max-w-6xl mx-auto p-6 space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-3xl font-bold">Create Visit</h1>
 <Button
 variant="outline"
 onClick={() => router.push("/medical-records/manage-visit")}
 >
 View in Manage Visits
 </Button>
 </div>

 {/* Search & Filter Section */}
 <div className="space-y-4 p-4 border rounded-lg bg-card">
 <h2 className="font-semibold">Search Patients</h2>
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
 <SelectItem value="Employee"> Employees</SelectItem>
 <SelectItem value="Retiree">Retirees</SelectItem>
 <SelectItem value="Employee Dependent">Dependents</SelectItem>
 <SelectItem value="Non-NPA">Non-NPA</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Results Summary */}
 <div className="text-sm text-gray-600">
 Showing {paginatedPatients.length} of {filteredPatients.length} patients
 {isLoading && <span className="ml-2">Loading...</span>}
 </div>

 {/* Enhanced Table Section */}
 <div className="border rounded-lg overflow-hidden bg-card text-card-foreground">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-border">
 <thead className="bg-muted">
 <tr>
 {["#", "Personal Number", "Full Name", "Gender/Age", "Category", "Last Visit", "Contact", "Actions"].map((col) => (
 <th key={col} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
 {patient.personalNumber}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm">
 <div className="flex items-center gap-2">
 <User className="h-4 w-4 text-gray-400" />
 {patient.fullName}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm">
 {patient.gender} / {patient.age}y
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm">
 <Badge variant="outline" className="text-xs">
 {patient.category}
 </Badge>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {patient.lastVisit ? (
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {formatDate(patient.lastVisit)}
 </div>
 ) : (
 <span className="text-gray-400">No visits</span>
 )}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
 <div className="space-y-1">
 <div>{patient.phoneNumber}</div>
 <div>{patient.email}</div>
 </div>
 </td>
 
 <td className="px-6 py-4 whitespace-nowrap">
 <Button
 size="sm"
 onClick={() => openVisitModal(patient)}
 className="hover:bg-blue-600"
 >
 Create Visit
 </Button>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={9} className="px-6 py-12 text-center">
 <div className="text-muted-foreground">
 <Search className="mx-auto h-12 w-12 mb-4" />
 <p className="text-lg font-medium mb-1">
 {isLoading ? "Loading patients..." : "No patients found"}
 </p>
 <p className="text-sm">
 {isLoading ? "Please wait..." : "Try adjusting your search or filter criteria"}
 </p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Enhanced Visit Creation Modal */}
 <Dialog open={isVisitModalOpen && !visitCreated} onOpenChange={setIsVisitModalOpen}>
 <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <Calendar className="h-5 w-5" />
 Create Visit {selectedPatient && `for ${selectedPatient.fullName}`}
 </DialogTitle>
 </DialogHeader>

 {selectedPatient && (
 <div className="space-y-6">
 {/* Enhanced Patient Info */}
 <div className="p-4 bg-gray-50 rounded-lg border">
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <strong>Personal Number:</strong> {selectedPatient.personalNumber}
 </div>
 <div>
 <strong>Category:</strong> {selectedPatient.category}
 </div>
 <div>
 <strong>Gender/Age:</strong> {selectedPatient.gender}, {selectedPatient.age} years
 </div>
 <div>
 <strong>Last Visit:</strong> {selectedPatient.lastVisit ? formatDate(selectedPatient.lastVisit) : "No previous visits"}
 </div>
 <div className="col-span-2">
 <strong>Contact:</strong> {selectedPatient.phoneNumber} | {selectedPatient.email}
 </div>
 
 </div>
 </div>

 {/* Enhanced Visit Details Form */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label htmlFor="visit-date">Visit Date *</Label>
 <Input
 id="visit-date"
 type="date"
 value={formData.visitDate}
 onChange={(e) => updateFormData('visitDate', e.target.value)}
 className={formErrors.visitDate ? "border-red-500" : ""}
 />
 {formErrors.visitDate && (
 <p className="text-red-500 text-sm mt-1">{formErrors.visitDate}</p>
 )}
 </div>

 <div>
 <Label htmlFor="visit-time">Visit Time *</Label>
 <Input
 id="visit-time"
 type="time"
 value={formData.visitTime}
 onChange={(e) => updateFormData('visitTime', e.target.value)}
 className={formErrors.visitTime ? "border-red-500" : ""}
 />
 {formErrors.visitTime && (
 <p className="text-red-500 text-sm mt-1">{formErrors.visitTime}</p>
 )}
 </div>

 <div>
 <Label>Location *</Label>
 <Select 
 value={formData.visitLocation} 
 onValueChange={(value) => updateFormData('visitLocation', value)}
 >
 <SelectTrigger className={formErrors.visitLocation ? "border-red-500" : ""}>
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
 {formErrors.visitLocation && (
 <p className="text-red-500 text-sm mt-1">{formErrors.visitLocation}</p>
 )}
 </div>

 <div>
 <Label>Visit Type *</Label>
 <Select 
 value={formData.visitType} 
 onValueChange={(value) => updateFormData('visitType', value)}
 >
 <SelectTrigger className={formErrors.visitType ? "border-red-500" : ""}>
 <SelectValue placeholder="Select Visit Type" />
 </SelectTrigger>
 <SelectContent>
 {visitTypes.map((type) => (
 <SelectItem key={type.value} value={type.value}>
 <div className="flex items-center justify-between w-full">
 <span>{type.label}</span>
 <span className="text-xs text-gray-500 ml-2">({type.duration} min)</span>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {formErrors.visitType && (
 <p className="text-red-500 text-sm mt-1">{formErrors.visitType}</p>
 )}
 </div>

 <div>
 <Label>Clinic *</Label>
 <Select 
 value={formData.clinic} 
 onValueChange={(value) => updateFormData('clinic', value)}
 >
 <SelectTrigger className={formErrors.clinic ? "border-red-500" : ""}>
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
 <p className="text-red-500 text-sm mt-1">{formErrors.clinic}</p>
 )}
 </div>

 <div>
 <Label>Priority</Label>
 <Select 
 value={formData.priority} 
 onValueChange={(value) => updateFormData('priority', value)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {priorities.map((priority) => (
 <SelectItem key={priority} value={priority}>
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${
 priority === 'Emergency' ? 'bg-red-500' :
 priority === 'High' ? 'bg-orange-500' :
 priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
 }`} />
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
 value={formData.specialInstructions}
 onChange={(e) => updateFormData('specialInstructions', e.target.value)}
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
 className="min-w-[120px]"
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
 </div>
 );
}