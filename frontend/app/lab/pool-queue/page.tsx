"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, TestTube, Upload, FileText, Send, Edit, Eye, Clock, User, Download, Plus, X, Activity, Calendar, Beaker, CheckCircle2 } from "lucide-react";

type Priority = "STAT" | "Urgent" | "Routine";
type Status = "Pending" | "Collected" | "In Progress" | "Results Ready" | "Completed" | "Cancelled";
type TestType = "In-house" | "Outsourced";
type ResultStatus = "Normal" | "Abnormal" | "Critical";

interface LabTest {
  id: string;
  name: string;
  category: string;
  code: string;
  normalRange?: string;
  unit?: string;
  specimenType: string;
  testType: TestType;
  turnaroundTime: string;
  specialInstructions?: string;
}

interface LabOrder {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  priority: Priority;
  status: Status;
  orderDate: string;
  orderTime: string;
  expectedDate?: string;
  collectionDate?: string;
  collectionTime?: string;
  completedDate?: string;
  completedTime?: string;
  clinicalNotes: string;
  specialInstructions?: string;
  tests: LabTest[];
  age: number;
  gender: string;
  phoneNumber: string;
  clinic: string;
  location: string;
  collectedBy?: string;
  processedBy?: string;
  reviewedBy?: string;
  testResults?: { [testId: string]: TestResult[] };
  testStatuses?: { [testId: string]: Status };
}

interface TestResult {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: ResultStatus;
  notes?: string;
  methodology?: string;
  instrument?: string;
  referenceValues?: string;
}

interface LabResult {
  orderId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  resultDate: string;
  resultTime: string;
  results: TestResult[];
  overallStatus: ResultStatus;
  summary?: string;
  recommendations?: string;
  criticalValues?: string;
  technician: string;
  pathologist?: string;
  isOutsourced: boolean;
  outsourceLab?: string;
  uploadedFiles?: File[];
  templateUsed?: string;
}

interface ResultTemplate {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[];
  headerText: string;
  footerText: string;
  isDefault: boolean;
}

interface TemplateField {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "textarea" | "range";
  required: boolean;
  defaultValue?: string;
  options?: string[];
  unit?: string;
  normalRange?: string;
}

// Mock lab tests data
const labTestsData: LabTest[] = [
  {
    id: "CBC001",
    name: "Complete Blood Count",
    category: "Hematology",
    code: "CBC",
    specimenType: "Blood",
    testType: "In-house",
    turnaroundTime: "2-4 hours",
    normalRange: "Various"
  },
  {
    id: "LIP001", 
    name: "Lipid Panel",
    category: "Chemistry",
    code: "LIP",
    specimenType: "Blood",
    testType: "In-house",
    turnaroundTime: "4-6 hours"
  },
  {
    id: "TSH001",
    name: "Thyroid Function Test",
    category: "Endocrinology", 
    code: "TFT",
    specimenType: "Blood",
    testType: "Outsourced",
    turnaroundTime: "24-48 hours"
  },
  {
    id: "CT001",
    name: "CT Scan Brain",
    category: "Radiology",
    code: "CTB",
    specimenType: "Imaging",
    testType: "Outsourced", 
    turnaroundTime: "4-8 hours"
  },
  {
    id: "MRI001",
    name: "MRI Spine",
    category: "Radiology",
    code: "MRIS",
    specimenType: "Imaging",
    testType: "Outsourced",
    turnaroundTime: "24-48 hours"
  }
];

// Mock lab orders data
const labOrdersMock: LabOrder[] = [
  {
    id: "LO001",
    orderId: "ORD-2024-001",
    patientId: "P001",
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    priority: "Urgent",
    status: "Collected",
    orderDate: "2025-08-17",
    orderTime: "08:30 AM",
    expectedDate: "2025-08-17",
    collectionDate: "2025-08-17",
    collectionTime: "09:15 AM", 
    clinicalNotes: "Pre-operative workup, chest pain investigation",
    tests: [labTestsData[0], labTestsData[1]],
    age: 45,
    gender: "Male",
    phoneNumber: "123-456-7890",
    clinic: "GOP",
    location: "Headquarters",
    collectedBy: "Nurse Johnson",
    testStatuses: {},
    testResults: {}
  },
  {
    id: "LO002",
    orderId: "ORD-2024-002", 
    patientId: "P002",
    patientName: "Jane Smith",
    doctorName: "Dr. Wilson",
    priority: "STAT",
    status: "Results Ready",
    orderDate: "2025-08-17",
    orderTime: "07:45 AM",
    expectedDate: "2025-08-17",
    collectionDate: "2025-08-17",
    collectionTime: "08:00 AM",
    completedDate: "2025-08-17",
    completedTime: "11:30 AM",
    clinicalNotes: "Emergency case, suspected thyroid storm",
    tests: [labTestsData[2]],
    age: 34,
    gender: "Female", 
    phoneNumber: "987-654-3210",
    clinic: "Emergency",
    location: "Main Hospital",
    collectedBy: "Lab Tech A",
    processedBy: "Lab Tech B",
    reviewedBy: "Dr. PathologistName",
    testStatuses: {},
    testResults: {}
  },
  {
    id: "LO003",
    orderId: "ORD-2024-003",
    patientId: "P003", 
    patientName: "Robert Johnson",
    doctorName: "Dr. Davis",
    priority: "Routine",
    status: "Pending",
    orderDate: "2025-08-17",
    orderTime: "10:00 AM",
    expectedDate: "2025-08-19",
    clinicalNotes: "Annual health checkup",
    tests: [labTestsData[0], labTestsData[1], labTestsData[3]],
    age: 28,
    gender: "Male",
    phoneNumber: "555-123-4567", 
    clinic: "GOP",
    location: "Branch Office",
    testStatuses: {},
    testResults: {}
  }
];

// Mock result templates
const resultTemplatesData: ResultTemplate[] = [
  {
    id: "temp001",
    name: "Complete Blood Count Template",
    category: "Hematology",
    isDefault: true,
    headerText: "COMPLETE BLOOD COUNT REPORT",
    footerText: "Results reviewed and approved by laboratory staff.",
    fields: [
      { id: "wbc", name: "White Blood Cells", type: "number", required: true, unit: "×10³/μL", normalRange: "4.0-11.0" },
      { id: "rbc", name: "Red Blood Cells", type: "number", required: true, unit: "×10⁶/μL", normalRange: "4.2-5.4" },
      { id: "hgb", name: "Hemoglobin", type: "number", required: true, unit: "g/dL", normalRange: "12.0-15.5" },
      { id: "hct", name: "Hematocrit", type: "number", required: true, unit: "%", normalRange: "36-46" },
      { id: "plt", name: "Platelets", type: "number", required: true, unit: "×10³/μL", normalRange: "150-450" }
    ]
  },
  {
    id: "temp002", 
    name: "Chemistry Panel Template",
    category: "Chemistry",
    isDefault: true,
    headerText: "CHEMISTRY PANEL REPORT",
    footerText: "Critical values have been called to the ordering physician.",
    fields: [
      { id: "glucose", name: "Glucose", type: "number", required: true, unit: "mg/dL", normalRange: "70-100" },
      { id: "bun", name: "Blood Urea Nitrogen", type: "number", required: true, unit: "mg/dL", normalRange: "7-20" },
      { id: "creatinine", name: "Creatinine", type: "number", required: true, unit: "mg/dL", normalRange: "0.6-1.2" },
      { id: "sodium", name: "Sodium", type: "number", required: true, unit: "mEq/L", normalRange: "136-145" },
      { id: "potassium", name: "Potassium", type: "number", required: true, unit: "mEq/L", normalRange: "3.5-5.1" }
    ]
  },
  {
    id: "temp003",
    name: "Custom Result Template", 
    category: "General",
    isDefault: false,
    headerText: "LABORATORY REPORT",
    footerText: "Please correlate with clinical findings.",
    fields: [
      { id: "test_name", name: "Test Name", type: "text", required: true },
      { id: "result", name: "Result", type: "text", required: true },
      { id: "reference", name: "Reference Range", type: "text", required: false },
      { id: "status", name: "Status", type: "select", required: true, options: ["Normal", "Abnormal", "Critical"] },
      { id: "comments", name: "Comments", type: "textarea", required: false }
    ]
  }
];

export default function LabPoolQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [testTypeFilter, setTestTypeFilter] = useState<TestType | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultEntry, setShowResultEntry] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResultTemplate | null>(null);
  const [resultData, setResultData] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(true);

  const itemsPerPage = 5;

  const [labOrders, setLabOrders] = useState<LabOrder[]>(labOrdersMock);
  const [resultTemplates, setResultTemplates] = useState<ResultTemplate[]>(resultTemplatesData);
  const [labResults, setLabResults] = useState<LabResult[]>([]);

  // Utility functions
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Routine": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Collected": return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Results Ready": return "bg-green-100 text-green-800 border-green-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getResultStatusColor = (status: ResultStatus) => {
    switch (status) {
      case "Normal": return "bg-green-100 text-green-800 border-green-200";
      case "Abnormal": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  // Determine overall status based on result data
  const determineStatus = (value: string, normalRange?: string): ResultStatus => {
    if (!normalRange || !value) return "Normal";
    // Simple logic for demo - in real app, parse ranges and compare
    return "Normal";
  };

  const handleSubmitResults = (selectedTests: string[]) => {
    if (!selectedOrder || !selectedTemplate) return;
    
    const testsToProcess = selectedTests.length > 0 ? selectedTests : selectedOrder.tests.map(t => t.id);
    
    testsToProcess.forEach((testId) => {
      const test = selectedOrder.tests.find((t) => t.id === testId);
      if (!test) return;

      const newResults: TestResult[] = selectedTemplate.fields.map((field) => ({
        testId: testId,
        testName: field.name,
        value: resultData[field.id] || field.defaultValue || '',
        unit: field.unit || '',
        normalRange: field.normalRange || '',
        status: determineStatus(resultData[field.id], field.normalRange),
      }));

      const newResult: LabResult = {
        orderId: selectedOrder.orderId,
        patientId: selectedOrder.patientId,
        patientName: selectedOrder.patientName,
        doctorName: selectedOrder.doctorName,
        resultDate: new Date().toISOString().split('T')[0],
        resultTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        results: newResults,
        overallStatus: "Normal",
        technician: "Lab Technician",
        isOutsourced: test.testType === "Outsourced",
        uploadedFiles: [...uploadedFiles],
        templateUsed: selectedTemplate.id,
      };

      setLabResults((prev) => [...prev, newResult]);
    });
    
    // Update individual test statuses
    setLabOrders((prev) => prev.map((order) => {
      if (order.id === selectedOrder.id) {
        const updatedTestStatuses = { ...order.testStatuses };
        testsToProcess.forEach((testId) => {
          updatedTestStatuses[testId] = "Results Ready";
        });
        
        // Check if all tests are complete
        const allTestsComplete = order.tests.every((test) => 
          updatedTestStatuses[test.id] === "Results Ready" || 
          updatedTestStatuses[test.id] === "Completed"
        );
        
        return {
          ...order,
          testStatuses: updatedTestStatuses,
          status: allTestsComplete ? "Results Ready" : "In Progress"
        };
      }
      return order;
    }));
    
    setShowResultEntry(false);
    setResultData({});
    setUploadedFiles([]);
    setSelectedTemplate(null);
    setSelectedTests([]);
  };

  // Filter and pagination logic
  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter;
    const matchesTestType = testTypeFilter === "All" || order.tests.some(test => test.testType === testTypeFilter);
    const matchesDate = !dateFilter || order.orderDate === dateFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesTestType && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: labOrders.length,
    pending: labOrders.filter(order => order.status === "Pending").length,
    collected: labOrders.filter(order => order.status === "Collected").length,
    inProgress: labOrders.filter(order => order.status === "In Progress").length,
    resultsReady: labOrders.filter(order => order.status === "Results Ready").length,
    completed: labOrders.filter(order => order.status === "Completed").length,
    stat: labOrders.filter(order => order.priority === "STAT").length,
    urgent: labOrders.filter(order => order.priority === "Urgent").length,
    outsourced: labOrders.filter(order => order.tests.some(test => test.testType === "Outsourced")).length
  };

  // Handle status updates
  const updateOrderStatus = (orderId: string, newStatus: Status) => {
    setLabOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            ...(newStatus === "Collected" && { 
              collectionDate: new Date().toISOString().split('T')[0],
              collectionTime: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })
            }),
            ...(newStatus === "Results Ready" && {
              completedDate: new Date().toISOString().split('T')[0],
              completedTime: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit', 
                hour12: true
              })
            })
          }
        : order
    ));
  };

  // Handle test type update
  const updateTestType = (orderId: string, testId: string, newType: TestType) => {
    setLabOrders(prev => prev.map(order => 
      order.id === orderId 
        ? {
            ...order,
            tests: order.tests.map(test =>
              test.id === testId ? { ...test, testType: newType } : test
            )
          }
        : order
    ));
  };

  // Generate PDF report
  const generatePDFReport = (result: LabResult) => {
    // In a real implementation, this would generate an actual PDF
    const pdfContent = `
      LABORATORY REPORT
      
      Patient: ${result.patientName}
      Order ID: ${result.orderId}
      Date: ${result.resultDate}
      Doctor: ${result.doctorName}
      
      RESULTS:
      ${result.results.map(r => `${r.testName}: ${r.value} ${r.unit} (${r.normalRange})`).join('\n')}
      
      Technician: ${result.technician}
      ${result.pathologist ? `Pathologist: ${result.pathologist}` : ''}
    `;
    
    console.log("PDF Content:", pdfContent);
    alert("PDF report generated successfully! (In real implementation, this would download a PDF file)");
  };

  // Handle template save
  const handleTemplateSave = (updatedTemplate: ResultTemplate) => {
    if (updatedTemplate.id) {
      // Edit
      setResultTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    } else {
      // Create
      updatedTemplate.id = `temp${(resultTemplates.length + 1).toString().padStart(3, '0')}`;
      setResultTemplates(prev => [...prev, updatedTemplate]);
    }
  };

  // Edit template
  const handleEditTemplate = (template: ResultTemplate) => {
    setSelectedTemplate(template);
    setIsEdit(true);
    setShowTemplateEditor(true);
  };

  // Preview template
  const handlePreviewTemplate = (template: ResultTemplate) => {
    setSelectedTemplate(template);
    setIsEdit(false);
    setShowTemplateEditor(true);
  };

  // Send selected test results to doctor
  const sendSelectedResults = (order: LabOrder) => {
    if (selectedTests.length === 0) return;
    
    // Mark selected tests as completed
    setLabOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        const updatedTestStatuses = { ...o.testStatuses };
        selectedTests.forEach(testId => {
          if (o.tests.some(test => test.id === testId)) {
            updatedTestStatuses[testId] = "Completed";
          }
        });
        
        // Check if all tests are now complete
        const allComplete = o.tests.every(test => 
          updatedTestStatuses[test.id] === "Completed"
        );
        
        return {
          ...o,
          testStatuses: updatedTestStatuses,
          status: allComplete ? "Completed" : o.status
        };
      }
      return o;
    }));
    
    alert(`Sent ${selectedTests.length} test results to doctor`);
    setSelectedTests([]);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const ResultEntryModal = () => {
    if (!showResultEntry || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Enter Lab Results</h2>
              <p className="text-gray-600">
                {selectedOrder.patientName} - Order: {selectedOrder.orderId}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResultEntry(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Select Result Template</Label>
                <Select
                  value={selectedTemplate?.id || ""}
                  onValueChange={(value) => {
                    const template = resultTemplates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                    setResultData({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {resultTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Result Fields */}
              {selectedTemplate && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{selectedTemplate.headerText}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedTemplate.fields.map(field => (
                      <div key={field.id} className="space-y-2">
                        <Label>
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                          {field.unit && <span className="text-gray-500"> ({field.unit})</span>}
                        </Label>
                        {field.normalRange && (
                          <p className="text-xs text-gray-500">Normal: {field.normalRange}</p>
                        )}
                        {field.type === "text" && (
                          <Input
                            value={resultData[field.id] || ""}
                            onChange={(e) => setResultData(prev => ({
                              ...prev,
                              [field.id]: e.target.value
                            }))}
                            placeholder={field.defaultValue}
                          />
                        )}
                        {field.type === "number" && (
                          <Input
                            type="number"
                            value={resultData[field.id] || ""}
                            onChange={(e) => setResultData(prev => ({
                              ...prev,
                              [field.id]: e.target.value
                            }))}
                            placeholder={field.defaultValue}
                          />
                        )}
                        {field.type === "select" && field.options && (
                          <Select
                            value={resultData[field.id] || ""}
                            onValueChange={(value) => setResultData(prev => ({
                              ...prev,
                              [field.id]: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            value={resultData[field.id] || ""}
                            onChange={(e) => setResultData(prev => ({
                              ...prev,
                              [field.id]: e.target.value
                            }))}
                            placeholder={field.defaultValue}
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload External Results</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload lab reports, images, or documents
                        </span>
                      </Label>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, JPG, PNG, DOC up to 10MB each
                    </p>
                  </div>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={() => setShowResultEntry(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmitResults(selectedTests)}>
              <Send className="mr-2 h-4 w-4" />
              Submit Results
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const TemplateEditorModal = () => {
    if (!showTemplateEditor) return null;

    const [template, setTemplate] = useState<ResultTemplate>(
      selectedTemplate || {
        id: '',
        name: '',
        category: '',
        fields: [],
        headerText: '',
        footerText: '',
        isDefault: false
      }
    );

    const handleFieldsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      try {
        setTemplate({ ...template, fields: JSON.parse(e.target.value) });
      } catch (error) {
        // Ignore parse error for now
      }
    };

    const handleSave = () => {
      handleTemplateSave(template);
      setShowTemplateEditor(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">
              {isEdit ? (selectedTemplate ? 'Edit Template' : 'Create Template') : 'Preview Template'}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowTemplateEditor(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  disabled={!isEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={template.category}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  disabled={!isEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Header Text</Label>
                <Input
                  value={template.headerText}
                  onChange={(e) => setTemplate({ ...template, headerText: e.target.value })}
                  disabled={!isEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Footer Text</Label>
                <Input
                  value={template.footerText}
                  onChange={(e) => setTemplate({ ...template, footerText: e.target.value })}
                  disabled={!isEdit}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={template.isDefault}
                  onCheckedChange={(checked) => setTemplate({ ...template, isDefault: !!checked })}
                  disabled={!isEdit}
                />
                <Label htmlFor="isDefault">Is Default</Label>
              </div>
              <div className="space-y-2">
                <Label>Fields (JSON array)</Label>
                <Textarea
                  value={JSON.stringify(template.fields, null, 2)}
                  onChange={handleFieldsChange}
                  rows={10}
                  readOnly={!isEdit}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={() => setShowTemplateEditor(false)}>
              {isEdit ? 'Cancel' : 'Close'}
            </Button>
            {isEdit && (
              <Button onClick={handleSave}>
                <Send className="mr-2 h-4 w-4" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Laboratory Queue Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSelectedTemplate(null); setIsEdit(true); setShowTemplateEditor(true); }}>
            <Edit className="mr-2 h-4 w-4" />
            Template Editor
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "queue"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Lab Queue
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "results" 
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Results Management
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "templates"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Templates
        </button>
      </div>

      {activeTab === "queue" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">{stats.stat} STAT priority</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting collection</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Collected</CardTitle>
                <Beaker className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.collected}</div>
                <p className="text-xs text-muted-foreground">Ready for processing</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Being processed</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Results Ready</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resultsReady}</div>
                <p className="text-xs text-muted-foreground">Ready for review</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Outsourced</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.outsourced}</div>
                <p className="text-xs text-muted-foreground">External labs</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Section */}
          <div className="space-y-4 p-4 border rounded">
            <h2 className="font-semibold">Search & Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Search Orders</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by patient, order ID, or doctor"
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
                  onValueChange={(value: Status | "All") => {
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
                    <SelectItem value="Collected">Collected</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Results Ready">Results Ready</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="STAT">STAT</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Test Type</Label>
                <Select 
                  value={testTypeFilter} 
                  onValueChange={(value: TestType | "All") => {
                    setTestTypeFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="In-house">In-house</SelectItem>
                    <SelectItem value="Outsourced">Outsourced</SelectItem>
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
            Showing {paginatedOrders.length} of {filteredOrders.length} lab orders
          </div>

          {/* Queue Items */}
          <div className="space-y-4">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <span>{order.patientName}</span>
                          <span className="text-sm text-muted-foreground font-normal">
                            Order: {order.orderId}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Doctor:</strong> {order.doctorName}</span>
                            <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
                            <span><strong>Ordered:</strong> {formatDate(order.orderDate)} at {order.orderTime}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span><strong>Age:</strong> {order.age} yrs</span>
                              <span><strong>Gender:</strong> {order.gender}</span>
                              <span><strong>Phone:</strong> {order.phoneNumber}</span>
                              <span><strong>Clinic:</strong> {order.clinic}</span>
                              <span><strong>Location:</strong> {order.location}</span>
                            </div>
                            <div>
                              <strong>Clinical Notes:</strong> {order.clinicalNotes}
                            </div>
                            {order.specialInstructions && (
                              <div>
                                <strong>Special Instructions:</strong> {order.specialInstructions}
                              </div>
                            )}
                            {order.collectionDate && (
                              <div className="text-blue-600">
                                <strong>Collected:</strong> {formatDate(order.collectionDate)} at {order.collectionTime} by {order.collectedBy}
                              </div>
                            )}
                            {order.completedDate && (
                              <div className="text-green-600">
                                <strong>Completed:</strong> {formatDate(order.completedDate)} at {order.completedTime}
                              </div>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge className={getPriorityColor(order.priority)} variant="outline">
                          {order.priority}
                        </Badge>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                        {order.tests.some(test => test.testType === "Outsourced") && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
                            Outsourced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Test Details */}
                      <div>
                        <strong className="text-sm">Tests Ordered ({order.tests.length}):</strong>
                        <div className="mt-2 space-y-2">
                          {order.tests.map((test, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedTests.includes(test.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTests(prev => [...prev, test.id]);
                                    } else {
                                      setSelectedTests(prev => prev.filter(id => id !== test.id));
                                    }
                                  }}
                                />
                                <div>
                                  <span className="font-medium">{test.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">({test.code})</span>
                                  {order.testStatuses?.[test.id] && (
                                    <Badge className={`${getStatusColor(order.testStatuses[test.id])} ml-2`} variant="outline">
                                      {order.testStatuses[test.id]}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={test.testType}
                                  onValueChange={(value: TestType) => updateTestType(order.id, test.id, value)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="In-house">In-house</SelectItem>
                                    <SelectItem value="Outsourced">Outsourced</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span className="text-xs text-gray-500">{test.turnaroundTime}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 flex-wrap">
                        {order.status === "Pending" && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, "Collected")}
                            className="hover:bg-blue-600"
                          >
                            <Beaker className="h-4 w-4 mr-1" />
                            Mark Collected
                          </Button>
                        )}
                        {order.status === "Collected" && (
                          <Button 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "In Progress")}
                            className="hover:bg-yellow-600"
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            Start Processing
                          </Button>
                        )}
                        {(order.status === "In Progress" || order.status === "Collected") && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowResultEntry(true);
                            }}
                            className="hover:bg-green-600"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Enter Results
                          </Button>
                        )}
                        {(order.status === "In Progress" || order.status === "Results Ready") && selectedTests.length > 0 && (
                          <Button 
                            size="sm"
                            onClick={() => sendSelectedResults(order)}
                            className="hover:bg-green-600"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send Selected ({selectedTests.length})
                          </Button>
                        )}
                        {(order.status === "In Progress" || order.status === "Results Ready") && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTests(order.tests.map(t => t.id))}
                          >
                            Select All Tests
                          </Button>
                        )}
                        {order.status === "Results Ready" && (
                          <>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const result = labResults.find(r => r.orderId === order.orderId);
                                if (result) generatePDFReport(result);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download PDF
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "Completed")}
                              className="hover:bg-green-600"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send All to Doctor
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50"
                          onClick={() => alert(`Viewing details for order ${order.orderId}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground">
                    <TestTube className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-medium mb-1">No lab orders found</p>
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
        </>
      )}

      {activeTab === "results" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Results Management</h2>
            <div className="text-sm text-gray-600">
              {labResults.length} results available
            </div>
          </div>

          {labResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-medium mb-1">No results available</p>
                  <p className="text-sm">
                    Results will appear here once lab tests are processed
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {labResults.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{result.patientName}</CardTitle>
                        <CardDescription>
                          Order: {result.orderId} | {formatDate(result.resultDate)} at {result.resultTime}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getResultStatusColor(result.overallStatus)} variant="outline">
                          {result.overallStatus}
                        </Badge>
                        {result.isOutsourced && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
                            Outsourced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <strong>Doctor:</strong> {result.doctorName}
                        </div>
                        <div>
                          <strong>Technician:</strong> {result.technician}
                        </div>
                        {result.pathologist && (
                          <div>
                            <strong>Pathologist:</strong> {result.pathologist}
                          </div>
                        )}
                        {result.outsourceLab && (
                          <div>
                            <strong>External Lab:</strong> {result.outsourceLab}
                          </div>
                        )}
                      </div>

                      <div>
                        <strong>Results ({result.results.length}):</strong>
                        <div className="mt-2 space-y-2">
                          {result.results.map((testResult, testIndex) => (
                            <div key={testIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{testResult.testName}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {testResult.value} {testResult.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getResultStatusColor(testResult.status)} variant="outline">
                                  {testResult.status}
                                </Badge>
                                <span className="text-xs text-gray-500">({testResult.normalRange})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {result.uploadedFiles && result.uploadedFiles.length > 0 && (
                        <div>
                          <strong>Uploaded Files:</strong>
                          <div className="mt-2 space-y-1">
                            {result.uploadedFiles.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generatePDFReport(result)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`Viewing details for result of order ${result.orderId}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            updateOrderStatus(labOrders.find(o => o.orderId === result.orderId)?.id || '', "Completed");
                            alert(`Results sent to doctor for order ${result.orderId}`);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send to Doctor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Result Templates</h2>
            <Button onClick={() => { setSelectedTemplate(null); setIsEdit(true); setShowTemplateEditor(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {resultTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.category}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <strong>Fields ({template.fields.length}):</strong>
                      <div className="mt-2 space-y-1">
                        {template.fields.slice(0, 3).map((field) => (
                          <div key={field.id} className="text-sm text-gray-600">
                            • {field.name} ({field.type}) {field.required && <span className="text-red-500">*</span>}
                          </div>
                        ))}
                        {template.fields.length > 3 && (
                          <div className="text-sm text-gray-500">
                            ... and {template.fields.length - 3} more fields
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ResultEntryModal />
      <TemplateEditorModal />
    </div>
  );
}