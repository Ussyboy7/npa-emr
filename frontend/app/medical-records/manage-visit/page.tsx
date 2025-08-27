"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Search, Eye, Edit, Send, Clock, Calendar, Users } from "lucide-react";

type VisitStatus = "Not Sent" | "Pending" | "Completed";

interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  clinic: string;
  visitTime: string;
  visitDate: string;
  waittime: string;
  visitType: string;
  status: VisitStatus;
}

interface Patient {
  id: string;
  surname: string;
  firstName: string;
  lastName: string;
  location?: string;
  gender: string;
  age: number;
  employeeCategory: string;
  phoneNumber: string;
}

// Mock patient data
const patientsMock: Patient[] = [
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

// Mock visit data
const visitsMock: Visit[] = [
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });
};

export default function ManageVisit() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sort visits by combined datetime
  const [visits, setVisits] = useState<Visit[]>(
    [...visitsMock].sort((a, b) => {
      const aDate = new Date(`${a.visitDate} ${a.visitTime}`);
      const bDate = new Date(`${b.visitDate} ${b.visitTime}`);
      return aDate.getTime() - bDate.getTime();
    })
  );

  // Send to Nursing handler
  const handleSendToNursing = (visitId: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId && v.status === "Not Sent"
          ? { ...v, status: "Pending" }
          : v
      )
    );
  };

  // Get badge color based on status
  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Not Sent":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filters
  const filteredVisits = visits.filter((visit) => {
    const matchesSearch = visit.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || visit.status === statusFilter;
    const matchesDate = !dateFilter || visit.visitDate === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary statistics
  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === "Pending").length,
    completed: visits.filter(v => v.status === "Completed").length,
    notSent: visits.filter(v => v.status === "Not Sent").length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Visits</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Sent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.notSent}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Visits</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient name"
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
            <Label>Status Filter</Label>
            <Select 
              value={statusFilter} 
              onValueChange={(value: VisitStatus | "All") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Not Sent">Not Sent</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-filter">Date Filter</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedVisits.length} of {filteredVisits.length} visits
      </div>

      {/* Visit Cards */}
      <div className="space-y-4">
        {paginatedVisits.length > 0 ? (
          paginatedVisits.map((visit) => {
            const patient = patientsMock.find((p) => p.id === visit.patientId);
            return (
              <Card key={visit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <span>{visit.patientName}</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          ID: {visit.id}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-orange-600 font-medium">
                            Waiting: {visit.waittime}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span><strong>Location:</strong> {patient?.location}</span>
                            <span><strong>Gender:</strong> {patient?.gender}</span>
                            <span><strong>Age:</strong> {patient?.age} yrs</span>
                            <span><strong>Category:</strong> {patient?.employeeCategory}</span>
                          </div>
                          <div>
                            <strong>Phone:</strong> {patient?.phoneNumber}
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge className={getStatusColor(visit.status)} variant="outline">
                        {visit.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-green-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {visit.status === "Not Sent" ? (
                        <Button
                          size="sm"
                          onClick={() => handleSendToNursing(visit.id)}
                          className="hover:bg-blue-600"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send to Nursing
                        </Button>
                      ) : (
                        <Button size="sm" disabled variant="outline">
                          Sent
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Clinic:</strong>
                      <div>{visit.clinic}</div>
                    </div>
                    <div>
                      <strong className="text-foreground">Date:</strong>
                      <div>{formatDate(visit.visitDate)}</div>
                    </div>
                    <div>
                      <strong className="text-foreground">Time:</strong>
                      <div>{visit.visitTime}</div>
                    </div>
                    <div>
                      <strong className="text-foreground">Type:</strong>
                      <div>{visit.visitType}</div>
                    </div>
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
                <p className="text-lg font-medium mb-1">No visits found</p>
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
    </div>
  );
}