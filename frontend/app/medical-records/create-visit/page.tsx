"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Mock locations array - replace with your actual import
const locations = ["Bode Thomas Clinic", "HQ", "Tincan", "LPC"];

interface Patient {
  id: number;
  personalNumber: string;
  fullName: string;
  gender: string;
  age: number;
  category: string;
  registeredAt: string;
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Visit modal state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitLocation, setVisitLocation] = useState("");
  const [visitType, setVisitType] = useState("");
  const [clinic, setClinic] = useState("");

  // Load test patients
  useEffect(() => {
    const testData: Patient[] = [
      {
        id: 1,
        personalNumber: "PN-001",
        fullName: "John Doe",
        gender: "Male",
        age: 35,
        category: "Employee",
        registeredAt: "2025-01-10",
      },
      {
        id: 2,
        personalNumber: "PN-002",
        fullName: "Jane Smith",
        gender: "Female",
        age: 28,
        category: "Retiree",
        registeredAt: "2024-12-15",
      },
      {
        id: 3,
        personalNumber: "PN-003",
        fullName: "Michael Johnson",
        gender: "Male",
        age: 42,
        category: "Non-NPA",
        registeredAt: "2025-02-01",
      },
    ];
    setPatients(testData);
  }, []);

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

  const handleCreateVisit = () => {
    if (!selectedPatient) return;
    
    // Validation
    if (!visitDate || !visitTime || !visitLocation || !visitType || !clinic) {
      alert("Please fill in all fields");
      return;
    }

    console.log("Visit Created:", {
      patientId: selectedPatient.id,
      visitDate,
      visitTime,
      location: visitLocation,
      visitType,
      clinic,
    });
    alert(`Visit created for ${selectedPatient.fullName}! Check console.`);
    
    // Reset form
    setVisitDate("");
    setVisitTime("");
    setVisitLocation("");
    setVisitType("");
    setClinic("");
    setIsVisitModalOpen(false);
  };

  const openVisitModal = (patient: Patient) => {
    setSelectedPatient(patient);
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setVisitDate(today);
    setIsVisitModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Visit</h1>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
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
                <SelectItem value="Employee">Employees</SelectItem>
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
      </div>

      {/* Table Section */}
      <div className="border rounded overflow-hidden bg-card text-card-foreground">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                {["#", "Personal Number", "Full Name", "Gender", "Age", "Category", "Registered At", "Actions"].map((col) => (
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
                      {patient.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {patient.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {patient.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(patient.registeredAt)}
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
                  <td colSpan={8} className="px-6 py-12 text-center">
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

      {/* Visit Creation Modal */}
      <Dialog open={isVisitModalOpen} onOpenChange={setIsVisitModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create Visit {selectedPatient && `for ${selectedPatient.fullName}`}
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <strong>Personal Number:</strong> {selectedPatient.personalNumber}
                </p>
                <p className="text-sm">
                  <strong>Gender:</strong> {selectedPatient.gender} | <strong>Age:</strong> {selectedPatient.age}
                </p>
              </div>

              {/* Visit Details Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="visit-date">Visit Date</Label>
                  <Input
                    id="visit-date"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="visit-time">Visit Time</Label>
                  <Input
                    id="visit-time"
                    type="time"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Location</Label>
                  <Select value={visitLocation} onValueChange={setVisitLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Visit Type</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Visit Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Clinic</Label>
                  <Select value={clinic} onValueChange={setClinic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                      <SelectItem value="Eye">Eye</SelectItem>
                      <SelectItem value="Sickle Cell">Sickle Cell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsVisitModalOpen(false);
                // Reset form
                setVisitDate("");
                setVisitTime("");
                setVisitLocation("");
                setVisitType("");
                setClinic("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateVisit}>
              Create Visit
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