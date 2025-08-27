"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Edit, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import PatientOverview as modal content
import PatientOverviewModalContent from "@/components/medical-records/patientoverviewmodal";
import EditPatientModalContent from "@/components/medical-records/editpatientmodal";

// Dummy data
const patients = [
  { id: 1, personalNumber: "EMP001", name: "John Doe", category: "Employee", registeredAt: "2024-03-25" },
  { id: 2, personalNumber: "EMP-D01", name: "Jane Doe", category: "Employee Dependent", registeredAt: "2024-03-12" },
  { id: 3, personalNumber: "RET001", name: "Jane Smith", category: "Retiree", registeredAt: "2024-02-14" },
  { id: 4, personalNumber: "NPA001", name: "Mike Johnson", category: "Non-NPA", nonNpaType: "Police", registeredAt: "2024-01-10" },
  { id: 5, personalNumber: "NPA002", name: "Sarah Connor", category: "Non-NPA", nonNpaType: "NYSC", registeredAt: "2024-03-10" },
  { id: 6, personalNumber: "RET-D01", name: "Peter Obi", category: "Retiree Dependent", registeredAt: "2024-03-01" }, // Hidden
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });
};

export default function ManagePatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const rowsPerPage = 5;

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    // Skip retiree dependents entirely
    if (p.category === "Retiree Dependent") return false;

    // Only show Employee Dependents when filter is "Employee Dependent"
    if (categoryFilter === "Employee Dependent" && p.category !== "Employee Dependent") return false;

    const matchesSearch =
      p.personalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      p.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleViewPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setShowViewModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setShowEditModal(true);
  };

  const handleDeletePatient = (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      console.log("Delete patient:", patient);
      // Add your delete logic here
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Patients</h1>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Search Patients</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by Name or Personal Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Filter by Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Employee Dependent">Employee Dependent</SelectItem>
                <SelectItem value="Retiree">Retiree</SelectItem>
                <SelectItem value="Non-NPA">Non-NPA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedPatients.length} of {filteredPatients.length} patients
      </div>

      {/* Table Section */}
      <div className="border rounded overflow-hidden bg-card text-card-foreground">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                {["Personal Number", "Name", "Category", "Registered Date", "Actions"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => {
                  let displayCategory = patient.category;
                  if (patient.category === "Non-NPA" && patient.nonNpaType) {
                    displayCategory = `Non-NPA (${patient.nonNpaType})`;
                  }

                  return (
                    <tr key={patient.id} className="hover:bg-muted/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {patient.personalNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {displayCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(patient.registeredAt)}
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
                                  className="hover:bg-blue-50 hover:border-blue-300"
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
                                  className="hover:bg-green-50 hover:border-green-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Patient Information</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeletePatient(patient)}
                                  className="text-red-500 hover:bg-red-50 hover:border-red-300"
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground">
                      <Search className="mx-auto h-12 w-12 mb-4" />
                      <p className="text-lg font-medium mb-1">No patients found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
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

      {/* View Patient Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Patient Overview</DialogTitle>
          </DialogHeader>
          {selectedPatientId && (
            <PatientOverviewModalContent patientId={selectedPatientId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {selectedPatientId && (
            <EditPatientModalContent patientId={selectedPatientId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}