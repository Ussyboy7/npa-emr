"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCircle2, Download, Eye, Send, Archive, User, Calendar, Clock, TrendingUp } from "lucide-react";

const completedTests = [
  {
    id: "CT001",
    orderId: "ORD-2024-001",
    testId: "CBC001",
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    priority: "Urgent",
    orderDate: "2024-12-16",
    completedDate: "2024-12-16",
    completedTime: "02:30 PM",
    sentDate: "2024-12-16",
    sentTime: "02:45 PM",
    testName: "Complete Blood Count",
    testCategory: "Hematology",
    overallStatus: "Abnormal",
    technician: "Lab Tech A",
    pathologist: "Dr. Pathologist Smith",
    isOutsourced: false,
    validatedBy: "Dr. Lab Director",
    clinic: "GOP",
    age: 45,
    gender: "Male",
    turnaroundTime: "6 hours",
    resultCount: 5
  },
  {
    id: "CT002",
    orderId: "ORD-2024-002",
    testId: "TSH001",
    patientName: "Jane Smith",
    doctorName: "Dr. Wilson",
    priority: "STAT",
    orderDate: "2024-12-16",
    completedDate: "2024-12-16",
    completedTime: "06:30 PM",
    sentDate: "2024-12-16",
    sentTime: "06:45 PM",
    testName: "Thyroid Function Test",
    testCategory: "Endocrinology",
    overallStatus: "Critical",
    technician: "Lab Tech B",
    isOutsourced: true,
    outsourceLab: "Advanced Endocrine Labs",
    validatedBy: "Dr. Lab Director",
    clinic: "Emergency",
    age: 34,
    gender: "Female",
    turnaroundTime: "11 hours",
    resultCount: 3
  },
  {
    id: "CT003",
    orderId: "ORD-2024-005",
    testId: "CBC003",
    patientName: "David Lee",
    doctorName: "Dr. Johnson",
    priority: "STAT",
    orderDate: "2024-12-15",
    completedDate: "2024-12-15",
    completedTime: "08:00 PM",
    sentDate: "2024-12-15",
    sentTime: "08:15 PM",
    testName: "Complete Blood Count",
    testCategory: "Hematology",
    overallStatus: "Normal",
    technician: "Lab Tech C",
    pathologist: "Dr. Pathologist Jones",
    isOutsourced: false,
    validatedBy: "Dr. Lab Director",
    clinic: "Surgery",
    age: 63,
    gender: "Male",
    turnaroundTime: "5.5 hours",
    resultCount: 5
  },
  {
    id: "CT004",
    orderId: "ORD-2024-003",
    testId: "LIP002",
    patientName: "Robert Johnson",
    doctorName: "Dr. Davis",
    priority: "Routine",
    orderDate: "2024-12-14",
    completedDate: "2024-12-15",
    completedTime: "10:30 AM",
    sentDate: "2024-12-15",
    sentTime: "10:45 AM",
    testName: "Lipid Panel",
    testCategory: "Chemistry",
    overallStatus: "Normal",
    technician: "Lab Tech E",
    pathologist: "Dr. Clinical Pathologist",
    isOutsourced: false,
    validatedBy: "Dr. Lab Supervisor",
    clinic: "GOP",
    age: 28,
    gender: "Male",
    turnaroundTime: "20.5 hours",
    resultCount: 6
  },
  {
    id: "CT005",
    orderId: "ORD-2024-004",
    testId: "HBA1C001",
    patientName: "Mary Wilson",
    doctorName: "Dr. Brown",
    priority: "Urgent",
    orderDate: "2024-12-14",
    completedDate: "2024-12-14",
    completedTime: "04:20 PM",
    sentDate: "2024-12-14",
    sentTime: "04:35 PM",
    testName: "HbA1c",
    testCategory: "Chemistry",
    overallStatus: "Abnormal",
    technician: "Lab Tech F",
    pathologist: "Dr. Endocrine Specialist",
    isOutsourced: false,
    validatedBy: "Dr. Lab Supervisor",
    clinic: "Endocrine",
    age: 52,
    gender: "Female",
    turnaroundTime: "5.5 hours",
    resultCount: 2
  }
];

export default function CompletedTestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedTests, setSelectedTests] = useState([]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Routine": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getResultStatusColor = (status) => {
    switch (status) {
      case "Normal": return "bg-green-100 text-green-800 border-green-200";
      case "Abnormal": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  const handleTestSelection = (testId, checked) => {
    setSelectedTests(prev => 
      checked 
        ? [...prev, testId]
        : prev.filter(id => id !== testId)
    );
  };

  const handleSelectAll = () => {
    const allTestIds = filteredTests.map(test => test.id);
    setSelectedTests(allTestIds);
  };

  const handleClearSelection = () => {
    setSelectedTests([]);
  };

  const downloadSelectedReports = () => {
    if (selectedTests.length === 0) {
      alert("Please select tests to download");
      return;
    }
    alert(`Downloading ${selectedTests.length} test reports`);
  };

  const archiveSelectedTests = () => {
    if (selectedTests.length === 0) {
      alert("Please select tests to archive");
      return;
    }
    alert(`Archived ${selectedTests.length} completed tests`);
    setSelectedTests([]);
  };

  const resendResult = (test) => {
    alert(`Resent result for ${test.testName} (${test.patientName}) to ${test.doctorName}`);
  };

  const downloadReport = (test) => {
    alert(`Downloaded report for ${test.testName} - ${test.patientName}`);
  };

  const categories = [...new Set(completedTests.map(test => test.testCategory))];

  const filteredTests = completedTests.filter((test) => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || test.overallStatus === statusFilter;
    const matchesPriority = priorityFilter === "All" || test.priority === priorityFilter;
    const matchesCategory = categoryFilter === "All" || test.testCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = {
    total: completedTests.length,
    normal: completedTests.filter(test => test.overallStatus === "Normal").length,
    abnormal: completedTests.filter(test => test.overallStatus === "Abnormal").length,
    critical: completedTests.filter(test => test.overallStatus === "Critical").length,
    outsourced: completedTests.filter(test => test.isOutsourced).length,
    avgTurnaround: completedTests.reduce((acc, test) => {
      const hours = parseFloat(test.turnaroundTime.replace(' hours', ''));
      return acc + hours;
    }, 0) / completedTests.length,
    today: completedTests.filter(test => test.completedDate === new Date().toISOString().split('T')[0]).length
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Completed Tests</h1>
          <p className="text-gray-600">View and manage completed laboratory tests</p>
        </div>
        <div className="flex gap-2">
          {selectedTests.length > 0 && (
            <>
              <Button onClick={downloadSelectedReports}>
                <Download className="mr-2 h-4 w-4" />
                Download Selected ({selectedTests.length})
              </Button>
              <Button variant="outline" onClick={archiveSelectedTests}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Selected
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Total Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.today} completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Normal Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
            <p className="text-xs text-muted-foreground">{((stats.normal / stats.total) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              Abnormal Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.abnormal}</div>
            <p className="text-xs text-muted-foreground">{((stats.abnormal / stats.total) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-red-500" />
              Critical Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">{((stats.critical / stats.total) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Archive className="h-4 w-4 text-purple-500" />
              Outsourced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.outsourced}</div>
            <p className="text-xs text-muted-foreground">{((stats.outsourced / stats.total) * 100).toFixed(1)}% external</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Avg Turnaround
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgTurnaround.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">98.5%</div>
            <p className="text-xs text-muted-foreground">Quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Search & Filter</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search Tests</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient, order, test, or doctor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Result Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by result status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Results</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Abnormal">Abnormal</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority Filter</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="STAT">STAT</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Test Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredTests.length} completed tests
      </div>

      {/* Completed Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test) => {
          const isSelected = selectedTests.includes(test.id);
          
          return (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleTestSelection(test.id, checked)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <span>{test.patientName}</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          Order: {test.orderId}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Doctor:</strong> {test.doctorName}</span>
                          <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
                          <span><strong>Completed:</strong> {formatDate(test.completedDate)} at {test.completedTime}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span><strong>Test:</strong> {test.testName}</span>
                            <span><strong>Category:</strong> {test.testCategory}</span>
                            <span><strong>Age:</strong> {test.age} yrs</span>
                            <span><strong>Gender:</strong> {test.gender}</span>
                            <span><strong>Clinic:</strong> {test.clinic}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span><strong>Technician:</strong> {test.technician}</span>
                            {test.pathologist && (
                              <span><strong>Pathologist:</strong> {test.pathologist}</span>
                            )}
                            <span><strong>Validated by:</strong> {test.validatedBy}</span>
                            <span><strong>Turnaround:</strong> {test.turnaroundTime}</span>
                          </div>
                          {test.isOutsourced && test.outsourceLab && (
                            <div className="text-purple-600">
                              <strong>External Lab:</strong> {test.outsourceLab}
                            </div>
                          )}
                          <div className="text-green-600">
                            <strong>Sent to Doctor:</strong> {formatDate(test.sentDate)} at {test.sentTime}
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={getPriorityColor(test.priority)} variant="outline">
                      {test.priority}
                    </Badge>
                    <Badge className={getResultStatusColor(test.overallStatus)} variant="outline">
                      {test.overallStatus}
                    </Badge>
                    {test.isOutsourced && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
                        Outsourced
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">Results Summary:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {test.resultCount} parameters analyzed
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Overall Status</div>
                        <Badge className={getResultStatusColor(test.overallStatus)} variant="outline">
                          {test.overallStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-50"
                      onClick={() => alert(`Viewing detailed results for ${test.testName} - ${test.patientName}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadReport(test)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Report
                    </Button>

                    <Button 
                      size="sm"
                      onClick={() => resendResult(test)}
                      className="hover:bg-green-600"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Resend to Doctor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}