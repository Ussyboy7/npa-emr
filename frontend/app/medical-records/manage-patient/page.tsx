// Explanatory Comments:
// - Fixed pagination to use data.count from backend for accurate totalPages.
// - Added field-specific error parsing in fetchPatients and handleDeletePatient.
// - Included auth header (Bearer token from localStorage) for secure API calls.
// - Improved delete confirmation with patient name for clarity.
// - Added loading states and empty state handling for better UX.
// - Debugging: Added console.error with stack traces for API errors.
// - Ensured backend field mapping (e.g., first_name -> firstName, patient_type).
// - Added navigation to register-patient page via router.
// - Handled edge cases like empty results or failed fetches gracefully.

"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Clock, User, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PatientOverviewModalContent from "@/components/medical-records/patientoverviewmodal";
import EditPatientModalContent from "@/components/medical-records/editpatientmodal";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  patient_type: string;
  gender: string;
  age: number;
  phone?: string;
  email?: string;
  created_at: string;
  non_npa_type?: string;
  dependent_type?: string;
  relationship?: string;
}

interface APIError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

const Loader = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export default function ManagePatientsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [deletePatientName, setDeletePatientName] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const params = new URLSearchParams({
          page: String(currentPage),
          page_size: String(rowsPerPage),
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter !== "All" && { type: categoryFilter }),
        });
        
        const res = await fetch(`${baseURL}/api/patients/?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        
        if (!res.ok) {
          const err: APIError = await res.json().catch(() => ({}));
          const errorMsg = err.detail || Object.entries(err).map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`).join(", ") || "Failed to fetch patients.";
          throw new Error(errorMsg);
        }
        
        const data = await res.json();
        const mappedPatients = (data.results || data).map((p: any) => ({
          id: String(p.id),
          patient_id: p.patient_id || "",
          name: `${p.surname || ""} ${p.first_name || ""}`.trim(),
          patient_type: p.patient_type || "",
          gender: p.gender || "",
          age: p.age || 0,
          phone: p.phone || "",
          email: p.email || "",
          created_at: p.created_at || new Date().toISOString(),
          non_npa_type: p.non_npa_type || "",
          dependent_type: p.dependent_type || "",
          relationship: p.relationship || "",
        }));
        
        setPatients(mappedPatients);
        setTotalCount(data.count || mappedPatients.length);
        setTotalPages(Math.ceil(data.count / rowsPerPage));
      } catch (err: any) {
        console.error("Fetch error:", err, err.stack);
        setDialogMessage(err.message || "Failed to load patients. Check network or console.");
        setShowErrorDialog(true);
        toast({ title: "Error", description: String(err), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, [currentPage, searchTerm, categoryFilter, toast]);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setShowViewModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setShowEditModal(true);
  };

  const handleDeletePatient = async () => {
    if (!deletePatientId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/patients/${deletePatientId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      
      if (!res.ok) {
        const err: APIError = await res.json().catch(() => ({}));
        const errorMsg = err.detail || Object.entries(err).map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`).join(", ") || "Failed to delete patient.";
        throw new Error(errorMsg);
      }
      
      setPatients(patients.filter((p) => p.id !== deletePatientId));
      setTotalCount(totalCount - 1);
      setTotalPages(Math.ceil((totalCount - 1) / rowsPerPage));
      toast({ title: "Success", description: "Patient deleted successfully.", variant: "success" });
      setShowDeleteDialog(false);
    } catch (err: any) {
      console.error("Delete error:", err, err.stack);
      setDialogMessage(err.message || "Failed to delete patient. Check console.");
      setShowErrorDialog(true);
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeletePatientId(null);
      setDeletePatientName("");
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto shadow-xl">
        <CardContent className="flex justify-center items-center h-screen">
          <Loader />
          <span className="ml-2">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Manage Patients
          </CardTitle>
          <div className="flex justify-end">
            <Button
              className="bg-gray-900 hover:bg-gray-900 text-white"
              onClick={() => router.push("/medical-records/register-patient")}
            >
              Add New Patient
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Search & Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search Patients</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by Name, Patient ID or Personal Number"
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
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Retiree">Retiree</SelectItem>
                    <SelectItem value="NonNPA">Non-NPA</SelectItem>
                    <SelectItem value="Dependent">Dependent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {patients.length} of {totalCount} patients
        </div>
        
        {/* Enhanced Table Section */}
        <div className="border rounded-lg overflow-hidden bg-card text-card-foreground">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  {[
                    "#",
                    "Patient ID",
                    "Name",
                    "Gender/Age",
                    "Category",
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
                {patients.length > 0 ? (
                  patients.map((patient, index) => (
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
                          {patient.non_npa_type ? ` (${patient.non_npa_type})` : ""}
                          {patient.dependent_type ? ` (${patient.dependent_type})` : ""}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="space-y-1">
                          <div>{patient.phone}</div>
                          <div>{patient.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPatient(patient)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Patient Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPatient(patient)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Patient Information</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setDeletePatientId(patient.id);
                                    setDeletePatientName(patient.name);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Patient</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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
                    className={pageNumber === currentPage ? "bg-gray-900 hover:bg-gray-900 text-white" : ""}
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
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletePatientName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePatient}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* View Patient Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Patient Overview</DialogTitle>
            </DialogHeader>
            {selectedPatientId && (
              <PatientOverviewModalContent patientId={String(selectedPatientId)} />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Edit Patient Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Edit Patient</DialogTitle>
            </DialogHeader>
            {selectedPatientId && (
              <EditPatientModalContent
                patientId={String(selectedPatientId)}
                onClose={() => setShowEditModal(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}