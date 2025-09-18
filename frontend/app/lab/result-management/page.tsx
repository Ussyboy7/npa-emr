"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, FileText, Send, Download, Eye, CheckCircle2, AlertTriangle, User, Calendar, Microscope, Shield, Clock, Upload } from "lucide-react";

const labResults = [
  {
    orderId: "ORD-2024-001",
    testId: "CBC001",
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    priority: "Urgent",
    resultDate: "2024-12-17",
    resultTime: "10:00 AM",
    results: [
      { testName: "White Blood Cells", value: "5.2", unit: "×10³/μL", normalRange: "4.0-11.0", status: "Normal" },
      { testName: "Red Blood Cells", value: "4.8", unit: "×10⁶/μL", normalRange: "4.2-5.4", status: "Normal" },
      { testName: "Hemoglobin", value: "9.5", unit: "g/dL", normalRange: "12.0-15.5", status: "Abnormal" },
      { testName: "Platelets", value: "320", unit: "×10³/μL", normalRange: "150-450", status: "Normal" }
    ],
    overallStatus: "Abnormal",
    technician: "Lab Tech A",
    pathologist: "Dr. Pathologist Smith",
    isOutsourced: false,
    validationStatus: "Pending",
    clinic: "GOP",
    age: 45,
    gender: "Male"
  },
  {
    orderId: "ORD-2024-002",
    testId: "TSH001",
    patientName: "Jane Smith",
    doctorName: "Dr. Wilson",
    priority: "STAT",
    resultDate: "2024-12-17",
    resultTime: "11:30 AM",
    results: [
      { testName: "TSH", value: "15.2", unit: "mIU/L", normalRange: "0.4-4.0", status: "Critical" },
      { testName: "Free T4", value: "0.6", unit: "ng/dL", normalRange: "0.8-1.8", status: "Abnormal" }
    ],
    overallStatus: "Critical",
    technician: "Lab Tech B",
    isOutsourced: true,
    outsourceLab: "Advanced Endocrine Labs",
    validationStatus: "Validated",
    validatedBy: "Dr. Lab Director",
    validatedDate: "2024-12-17",
    validatedTime: "12:00 PM",
    criticalValues: "TSH critically elevated at 15.2 mIU/L - called physician at 12:05 PM",
    clinic: "Emergency",
    age: 34,
    gender: "Female"
  },
  {
    orderId: "ORD-2024-005",
    testId: "CBC003",
    patientName: "David Lee",
    doctorName: "Dr. Johnson",
    priority: "STAT",
    resultDate: "2024-12-16",
    resultTime: "04:30 PM",
    results: [
      { testName: "White Blood Cells", value: "8.1", unit: "×10³/μL", normalRange: "4.0-11.0", status: "Normal" },
      { testName: "Red Blood Cells", value: "4.5", unit: "×10⁶/μL", normalRange: "4.2-5.4", status: "Normal" },
      { testName: "Hemoglobin", value: "14.2", unit: "g/dL", normalRange: "12.0-15.5", status: "Normal" },
      { testName: "Platelets", value: "245", unit: "×10³/μL", normalRange: "150-450", status: "Normal" }
    ],
    overallStatus: "Normal",
    technician: "Lab Tech C",
    pathologist: "Dr. Pathologist Jones",
    isOutsourced: false,
    validationStatus: "Validated",
    validatedBy: "Dr. Lab Director",
    validatedDate: "2024-12-16",
    validatedTime: "05:00 PM",
    clinic: "Surgery",
    age: 63,
    gender: "Male"
  },
  {
    orderId: "ORD-2024-004",
    testId: "HBA1C001",
    patientName: "Mary Wilson",
    doctorName: "Dr. Brown",
    priority: "Urgent",
    resultDate: "2024-12-17",
    resultTime: "02:15 PM",
    results: [
      { testName: "HbA1c", value: "8.5", unit: "%", normalRange: "4.0-5.6", status: "Abnormal" },
      { testName: "Estimated Average Glucose", value: "197", unit: "mg/dL", normalRange: "68-126", status: "Abnormal" }
    ],
    overallStatus: "Abnormal",
    technician: "Lab Tech D",
    pathologist: "Dr. Endocrine Specialist",
    isOutsourced: false,
    validationStatus: "Pending",
    recommendations: "Recommend immediate diabetes management review and medication adjustment",
    clinic: "Endocrine",
    age: 52,
    gender: "Female"
  }
];

export default function ResultsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [validationFilter, setValidationFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedResults, setSelectedResults] = useState([]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Routine": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getValidationStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Validated": return "bg-green-100 text-green-800 border-green-200";
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

  const handleResultSelection = (resultId, checked) => {
    setSelectedResults(prev => 
      checked 
        ? [...prev, resultId]
        : prev.filter(id => id !== resultId)
    );
  };

  const handleSelectAll = () => {
    const allResultIds = filteredResults.map(result => `${result.orderId}-${result.testId}`);
    setSelectedResults(allResultIds);
  };

  const handleClearSelection = () => {
    setSelectedResults([]);
  };

  const validateResult = (result) => {
    alert(`Validated results for ${result.patientName} - Order ${result.orderId}`);
  };

  const validateSelectedResults = () => {
    if (selectedResults.length === 0) {
      alert("Please select results to validate");
      return;
    }
    alert(`Validated ${selectedResults.length} results`);
    setSelectedResults([]);
  };

  const sendResult = (result) => {
    if (result.validationStatus !== "Validated") {
      alert("Result must be validated before sending to doctor");
      return;
    }
    alert(`Sent result for ${result.patientName} to ${result.doctorName}`);
  };

  const sendSelectedResults = () => {
    const validatedSelected = filteredResults.filter(result => 
      selectedResults.includes(`${result.orderId}-${result.testId}`) && 
      result.validationStatus === "Validated"
    );
    
    if (validatedSelected.length === 0) {
      alert("Please select validated results to send");
      return;
    }
    
    alert(`Sent ${validatedSelected.length} validated results to doctors`);
    setSelectedResults([]);
  };

  const generatePDFReport = (result) => {
    alert(`PDF report generated for ${result.patientName} - Order ${result.orderId}`);
  };

  const filteredResults = labResults.filter((result) => {
    const matchesSearch = result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || result.overallStatus === statusFilter;
    const matchesValidation = validationFilter === "All" || result.validationStatus === validationFilter;
    const matchesPriority = priorityFilter === "All" || result.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesValidation && matchesPriority;
  });

  const stats = {
    total: labResults.length,
    pending: labResults.filter(result => result.validationStatus === "Pending").length,
    validated: labResults.filter(result => result.validationStatus === "Validated").length,
    normal: labResults.filter(result => result.overallStatus === "Normal").length,
    abnormal: labResults.filter(result => result.overallStatus === "Abnormal").length,
    critical: labResults.filter(result => result.overallStatus === "Critical").length,
    outsourced: labResults.filter(result => result.isOutsourced).length
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Results Management</h1>
          <p className="text-gray-600">Validate and send laboratory results to doctors</p>
        </div>
        <div className="flex gap-2">
          {selectedResults.length > 0 && (
            <>
              <Button onClick={validateSelectedResults}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Validate Selected ({selectedResults.length})
              </Button>
              <Button onClick={sendSelectedResults}>
                <Send className="mr-2 h-4 w-4" />
                Send Selected ({selectedResults.length})
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
              <Microscope className="h-4 w-4" />
              Total Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Lab results available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Validated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            <p className="text-xs text-muted-foreground">Ready to send</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Normal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
            <p className="text-xs text-muted-foreground">Within normal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Abnormal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.abnormal}</div>
            <p className="text-xs text-muted-foreground">Outside normal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-500" />
              Outsourced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.outsourced}</div>
            <p className="text-xs text-muted-foreground">External labs</p>
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
            <Label htmlFor="search">Search Results</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient, order ID, or doctor"
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
            <Label>Validation Status</Label>
            <Select value={validationFilter} onValueChange={setValidationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by validation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Validation</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
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
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredResults.length} lab results
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map((result) => {
          const resultId = `${result.orderId}-${result.testId}`;
          const isSelected = selectedResults.includes(resultId);
          
          return (
            <Card key={resultId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleResultSelection(resultId, checked)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <span>{result.patientName}</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          Order: {result.orderId}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Doctor:</strong> {result.doctorName}</span>
                          <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
                          <span><strong>Result Date:</strong> {formatDate(result.resultDate)} at {result.resultTime}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span><strong>Age:</strong> {result.age} yrs</span>
                            <span><strong>Gender:</strong> {result.gender}</span>
                            <span><strong>Clinic:</strong> {result.clinic}</span>
                            <span><strong>Technician:</strong> {result.technician}</span>
                            {result.pathologist && (
                              <span><strong>Pathologist:</strong> {result.pathologist}</span>
                            )}
                          </div>
                          {result.isOutsourced && result.outsourceLab && (
                            <div className="text-purple-600">
                              <strong>External Lab:</strong> {result.outsourceLab}
                            </div>
                          )}
                          {result.validationStatus === "Validated" && result.validatedBy && (
                            <div className="text-green-600">
                              <strong>Validated by:</strong> {result.validatedBy} on {result.validatedDate} at {result.validatedTime}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={getPriorityColor(result.priority)} variant="outline">
                      {result.priority}
                    </Badge>
                    <Badge className={getResultStatusColor(result.overallStatus)} variant="outline">
                      {result.overallStatus}
                    </Badge>
                    <Badge className={getValidationStatusColor(result.validationStatus)} variant="outline">
                      {result.validationStatus}
                    </Badge>
                    {result.isOutsourced && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
                        Outsourced
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Test Results */}
                  <div>
                    <strong className="text-sm">Test Results ({result.results.length}):</strong>
                    <div className="mt-2 space-y-2">
                      {result.results.map((testResult, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{testResult.testName}</span>
                            <div className="text-sm text-gray-600">
                              <strong>{testResult.value} {testResult.unit}</strong>
                              <span className="ml-2 text-gray-500">(Normal: {testResult.normalRange})</span>
                            </div>
                          </div>
                          <Badge className={getResultStatusColor(testResult.status)} variant="outline">
                            {testResult.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Values Alert */}
                  {result.criticalValues && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">Critical Values</h4>
                          <p className="text-sm text-red-700">{result.criticalValues}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800">Recommendations</h4>
                      <p className="text-sm text-blue-700 mt-1">{result.recommendations}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-50"
                      onClick={() => alert(`Viewing detailed results for ${result.patientName}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePDFReport(result)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>

                    {result.validationStatus === "Pending" && (
                      <Button 
                        size="sm"
                        onClick={() => validateResult(result)}
                        className="hover:bg-indigo-600"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Validate
                      </Button>
                    )}

                    {result.validationStatus === "Validated" && (
                      <Button 
                        size="sm"
                        onClick={() => sendResult(result)}
                        className="hover:bg-green-600"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send to Doctor
                      </Button>
                    )}
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