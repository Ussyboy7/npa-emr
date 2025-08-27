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
import { Search, TestTube, Upload, FileText, Send, Edit, Eye, Clock, User, Download, Plus, X, AlertTriangle, CheckCircle2, Activity, Calendar, Beaker, Microscope, FileImage, Printer, Save } from "lucide-react";

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

interface SampleCollectionForm {
  sampleType: string;
  collectionMethod: string;
  containerType: string;
  volume: string;
  collectionTime: string;
  collectionDate: string;
  fastingStatus: string;
  specialInstructions: string;
  collectedBy: string;
  notes: string;
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
    status: "Pending",
    orderDate: "2025-08-17",
    orderTime: "08:30 AM",
    expectedDate: "2025-08-17",
    clinicalNotes: "Pre-operative workup, chest pain investigation",
    tests: [labTestsData[0], labTestsData[1]],
    age: 45,
    gender: "Male",
    phoneNumber: "123-456-7890",
    clinic: "GOP",
    location: "Headquarters",
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
    status: "Pending",
    orderDate: "2025-08-17",
    orderTime: "07:45 AM",
    expectedDate: "2025-08-17",
    clinicalNotes: "Emergency case, suspected thyroid storm",
    tests: [labTestsData[2]],
    age: 34,
    gender: "Female", 
    phoneNumber: "987-654-3210",
    clinic: "Emergency",
    location: "Main Hospital",
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

export default function LabManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [testTypeFilter, setTestTypeFilter] = useState<TestType | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultEntry, setShowResultEntry] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResultTemplate | null>(null);
  const [resultData, setResultData] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("collection");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(true);
  const [collectionForm, setCollectionForm] = useState<SampleCollectionForm>({
    sampleType: '',
    collectionMethod: '',
    containerType: '',
    volume: '',
    collectionTime: '',
    collectionDate: '',
    fastingStatus: '',
    specialInstructions: '',
    collectedBy: '',
    notes: ''
  });

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

  const handleSubmitResults = () => {
    if (!selectedOrder || !selectedTemplate) return;

    const testsToProcess = selectedTests.length > 0 ? selectedTests : selectedOrder.tests.map(t => t.id);

    const newResultsList: LabResult[] = testsToProcess.map(testId => {
      const test = selectedOrder.tests.find(t => t.id === testId);
      if (!test) return null;

      const newResults: TestResult[] = selectedTemplate.fields.map(field => ({
        testId,
        testName: field.name,
        value: resultData[field.id] || field.defaultValue || '',
        unit: field.unit || '',
        normalRange: field.normalRange || '',
        status: determineStatus(resultData[field.id], field.normalRange),
      })).filter(Boolean) as TestResult[];

      return {
        orderId: selectedOrder.orderId,
        patientId: selectedOrder.patientId,
        patientName: selectedOrder.patientName,
        doctorName: selectedOrder.doctorName,
        resultDate: new Date().toISOString().split('T')[0],
        resultTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        results: newResults,
        overallStatus: "Normal", // Compute based on statuses
        technician: "Lab Technician",
        isOutsourced: test.testType === "Outsourced",
        uploadedFiles: [...uploadedFiles],
        templateUsed: selectedTemplate.id,
      };
    }).filter(Boolean) as LabResult[];

    setLabResults((prev: LabResult[]) => [...prev, ...newResultsList]);

    // Update individual test statuses
    setLabOrders((prev: LabOrder[]) => prev.map(order => {
      if (order.id === selectedOrder.id) {
        const updatedTestStatuses = { ...order.testStatuses };
        testsToProcess.forEach(testId => {
          updatedTestStatuses[testId] = "Results Ready";
        });
        
        const allTestsComplete = order.tests.every(test => 
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

  // Filter and pagination logic for queue
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

  const totalPagesQueue = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrdersQueue = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics for queue
  const statsQueue = {
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
    setLabOrders((prev: LabOrder[]) => prev.map(order => 
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
    setLabOrders((prev: LabOrder[]) => prev.map(order => 
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
      setResultTemplates((prev: ResultTemplate[]) => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    } else {
      updatedTemplate.id = `temp${(resultTemplates.length + 1).toString().padStart(3, '0')}`;
      setResultTemplates((prev: ResultTemplate[]) => [...prev, updatedTemplate]);
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

    setLabOrders((prev: LabOrder[]) => prev.map(o => {
      if (o.id === order.id) {
        const updatedTestStatuses = { ...o.testStatuses };
        selectedTests.forEach(testId => {
          if (o.tests.some(test => test.id === testId)) {
            updatedTestStatuses[testId] = "Completed";
          }
        });
        
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

  // Collection handle input change
  const handleCollectionInputChange = (field: keyof SampleCollectionForm, value: string) => {
    setCollectionForm((prev: SampleCollectionForm) => ({ ...prev, [field]: value }));
  };

  // Handle collection submit
  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderStatus(selectedOrder.id, "Collected");
    // In real app, save form data to order
    alert('Sample collection recorded successfully!');
    setShowCollectionModal(false);
    setCollectionForm({
      sampleType: '',
      collectionMethod: '',
      containerType: '',
      volume: '',
      collectionTime: '',
      collectionDate: '',
      fastingStatus: '',
      specialInstructions: '',
      collectedBy: '',
      notes: ''
    });
    setSelectedOrder(null);
  };

  // Filter for collection tab (pending only)
  const filteredPending = labOrders.filter(order => order.status === "Pending" && (
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  ) && (priorityFilter === "All" || order.priority === priorityFilter) &&
    (!dateFilter || order.orderDate === dateFilter)
  );

  const totalPagesCollection = Math.ceil(filteredPending.length / itemsPerPage);
  const paginatedPending = filteredPending.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats for collection
  const statsCollection = {
    total: filteredPending.length,
    stat: filteredPending.filter(o => o.priority === "STAT").length,
    urgent: filteredPending.filter(o => o.priority === "Urgent").length,
    routine: filteredPending.filter(o => o.priority === "Routine").length,
  };

  // Result Entry Modal
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
            <Button variant="outline" size="sm" onClick={() => setShowResultEntry(false)}>
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
                            onChange={(e) => setResultData((prev: any) => ({
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
                            onChange={(e) => setResultData((prev: any) => ({
                              ...prev,
                              [field.id]: e.target.value
                            }))}
                            placeholder={field.defaultValue}
                          />
                        )}
                        {field.type === "select" && field.options && (
                          <Select
                            value={resultData[field.id] || ""}
                            onValueChange={(value) => setResultData((prev: any) => ({
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
                            onChange={(e) => setResultData((prev: any) => ({
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
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            setUploadedFiles(Array.from(files));
                          }
                        }}
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
                            onClick={() => setUploadedFiles((prev: File[]) => prev.filter((_, i) => i !== index))}
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
            <Button onClick={handleSubmitResults}>
              <Send className="mr-2 h-4 w-4" />
              Submit Results
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Template Editor Modal
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
        // Ignore
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

  // Collection Modal
  const CollectionModal = () => {
    if (!showCollectionModal || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Sample Collection</h2>
              <p className="text-gray-600">
                {selectedOrder.patientName} - Order: {selectedOrder.orderId}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowCollectionModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleCollectionSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Sample Type</Label>
                <Select value={collectionForm.sampleType} onValueChange={(v) => handleCollectionInputChange('sampleType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sample type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blood (Venous)">Blood (Venous)</SelectItem>
                    <SelectItem value="Blood (Capillary)">Blood (Capillary)</SelectItem>
                    <SelectItem value="Blood (Arterial)">Blood (Arterial)</SelectItem>
                    <SelectItem value="Urine">Urine</SelectItem>
                    <SelectItem value="Stool">Stool</SelectItem>
                    <SelectItem value="Sputum">Sputum</SelectItem>
                    <SelectItem value="Saliva">Saliva</SelectItem>
                    <SelectItem value="Cerebrospinal Fluid">Cerebrospinal Fluid</SelectItem>
                    <SelectItem value="Pleural Fluid">Pleural Fluid</SelectItem>
                    <SelectItem value="Synovial Fluid">Synovial Fluid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Collection Method</Label>
                <Select value={collectionForm.collectionMethod} onValueChange={(v) => handleCollectionInputChange('collectionMethod', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Venipuncture">Venipuncture</SelectItem>
                    <SelectItem value="Finger prick">Finger prick</SelectItem>
                    <SelectItem value="Heel prick">Heel prick</SelectItem>
                    <SelectItem value="Mid-stream urine">Mid-stream urine</SelectItem>
                    <SelectItem value="Clean catch urine">Clean catch urine</SelectItem>
                    <SelectItem value="Catheter sample">Catheter sample</SelectItem>
                    <SelectItem value="Spontaneous expectoration">Spontaneous expectoration</SelectItem>
                    <SelectItem value="Induced sputum">Induced sputum</SelectItem>
                    <SelectItem value="Lumbar puncture">Lumbar puncture</SelectItem>
                    <SelectItem value="Thoracentesis">Thoracentesis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Container Type</Label>
                <Select value={collectionForm.containerType} onValueChange={(v) => handleCollectionInputChange('containerType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select container type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDTA tube (Purple top)">EDTA tube (Purple top)</SelectItem>
                    <SelectItem value="Serum tube (Red top)">Serum tube (Red top)</SelectItem>
                    <SelectItem value="Heparin tube (Green top)">Heparin tube (Green top)</SelectItem>
                    <SelectItem value="Fluoride tube (Gray top)">Fluoride tube (Gray top)</SelectItem>
                    <SelectItem value="Citrate tube (Blue top)">Citrate tube (Blue top)</SelectItem>
                    <SelectItem value="Sterile urine container">Sterile urine container</SelectItem>
                    <SelectItem value="Stool container">Stool container</SelectItem>
                    <SelectItem value="Sputum container">Sputum container</SelectItem>
                    <SelectItem value="Blood culture bottle">Blood culture bottle</SelectItem>
                    <SelectItem value="Sterile tube">Sterile tube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Volume</Label>
                <Input value={collectionForm.volume} onChange={(e) => handleCollectionInputChange('volume', e.target.value)} placeholder="e.g., 5ml, 10ml, 50ml" />
              </div>
              <div>
                <Label>Collection Date</Label>
                <Input type="date" value={collectionForm.collectionDate} onChange={(e) => handleCollectionInputChange('collectionDate', e.target.value)} />
              </div>
              <div>
                <Label>Collection Time</Label>
                <Input type="time" value={collectionForm.collectionTime} onChange={(e) => handleCollectionInputChange('collectionTime', e.target.value)} />
              </div>
              <div>
                <Label>Fasting Status</Label>
                <Select value={collectionForm.fastingStatus} onValueChange={(v) => handleCollectionInputChange('fastingStatus', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fasting status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fasting">Fasting (8+ hours)</SelectItem>
                    <SelectItem value="non-fasting">Non-fasting</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="post-meal">Post-meal (2 hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Collected By</Label>
                <Input value={collectionForm.collectedBy} onChange={(e) => handleCollectionInputChange('collectedBy', e.target.value)} placeholder="Technician name" />
              </div>
            </div>

            <div>
              <Label>Special Instructions</Label>
              <Textarea value={collectionForm.specialInstructions} onChange={(e) => handleCollectionInputChange('specialInstructions', e.target.value)} rows={3} placeholder="Any special handling requirements, patient preparation notes..." />
            </div>

            <div>
              <Label>Collection Notes</Label>
              <Textarea value={collectionForm.notes} onChange={(e) => handleCollectionInputChange('notes', e.target.value)} rows={4} placeholder="Patient cooperation, collection difficulties, sample quality observations..." />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Sample Collection Guidelines</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• Verify patient identity using two identifiers</li>
                    <li>• Follow proper aseptic technique for all collections</li>
                    <li>• Use appropriate collection containers and preservatives</li>
                    <li>• Label samples immediately after collection</li>
                    <li>• Document collection time and any special circumstances</li>
                    <li>• Transport samples to laboratory promptly</li>
                    <li>• Ensure proper storage conditions during transport</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCollectionModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Record Collection
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SampleCollectionPage = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsCollection.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">STAT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsCollection.stat}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsCollection.urgent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Routine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsCollection.routine}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search patient, order, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "All")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="STAT">STAT</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[180px]"
          />
        </div>

        <div className="space-y-4">
          {paginatedPending.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{order.patientName}</CardTitle>
                    <CardDescription>Order {order.orderId} - {order.doctorName}</CardDescription>
                  </div>
                  <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Tests:</strong> {order.tests.map(t => t.name).join(', ')}</p>
                  <p><strong>Date:</strong> {formatDate(order.orderDate)} {order.orderTime}</p>
                  <p><strong>Clinical Notes:</strong> {order.clinicalNotes}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => {
                    setSelectedOrder(order);
                    setShowCollectionModal(true);
                  }}>
                    Collect Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPagesCollection}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPagesCollection, p + 1))}
            disabled={currentPage === totalPagesCollection}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const LabPoolQueue = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.collected}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Results Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.resultsReady}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">STAT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.stat}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.urgent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outsourced</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statsQueue.outsourced}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search patient, order, doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "All")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Collected">Collected</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Results Ready">Results Ready</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "All")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="STAT">STAT</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
            </SelectContent>
          </Select>
          <Select value={testTypeFilter} onValueChange={(v) => setTestTypeFilter(v as TestType | "All")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Test Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="In-house">In-house</SelectItem>
              <SelectItem value="Outsourced">Outsourced</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[180px]"
          />
        </div>

        <div className="space-y-4">
          {paginatedOrdersQueue.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{order.patientName}</CardTitle>
                    <CardDescription>Order {order.orderId} - {order.doctorName}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Tests:</strong> {order.tests.map(t => `${t.name} (${t.testType})`).join(', ')}</p>
                  <p><strong>Date:</strong> {formatDate(order.orderDate)} {order.orderTime}</p>
                  <p><strong>Clinical Notes:</strong> {order.clinicalNotes}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {order.status === "Pending" && (
                    <Button onClick={() => updateOrderStatus(order.id, "Collected")}>
                      Mark Collected
                    </Button>
                  )}
                  {order.status === "Collected" && (
                    <Button onClick={() => updateOrderStatus(order.id, "In Progress")}>
                      Start Processing
                    </Button>
                  )}
                  {order.status === "In Progress" && (
                    <Button onClick={() => {
                      setSelectedOrder(order);
                      setShowResultEntry(true);
                    }}>
                      Enter Results
                    </Button>
                  )}
                  {order.status === "Results Ready" && (
                    <Button onClick={() => sendSelectedResults(order)}>
                      Send to Doctor
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => updateTestType(order.id, order.tests[0].id, order.tests[0].testType === "In-house" ? "Outsourced" : "In-house")}>
                    Toggle Test Type
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPagesQueue}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPagesQueue, p + 1))}
            disabled={currentPage === totalPagesQueue}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const ResultsManagement = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
        </div>

        <div className="space-y-4">
          {labResults.filter(result => 
            result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.orderId.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{result.patientName}</CardTitle>
                    <CardDescription>Order {result.orderId} - {result.resultDate} {result.resultTime}</CardDescription>
                  </div>
                  <Badge className={getResultStatusColor(result.overallStatus)}>{result.overallStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Doctor:</strong> {result.doctorName}</p>
                  <p><strong>Technician:</strong> {result.technician}</p>
                  <p><strong>Results:</strong></p>
                  <ul className="list-disc pl-4">
                    {result.results.map((r, i) => (
                      <li key={i}>{r.testName}: {r.value} {r.unit} ({r.normalRange})</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => generatePDFReport(result)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Generate PDF
                  </Button>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send to Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const TemplatesManagement = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => {
            setSelectedTemplate(null);
            setIsEdit(true);
            setShowTemplateEditor(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resultTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEditTemplate(template)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => handlePreviewTemplate(template)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Laboratory Management</h1>
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
          onClick={() => setActiveTab("collection")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "collection"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Sample Collection
        </button>
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

      {activeTab === "collection" && <SampleCollectionPage />}
      {activeTab === "queue" && <LabPoolQueue />}
      {activeTab === "results" && <ResultsManagement />}
      {activeTab === "templates" && <TemplatesManagement />}

      <CollectionModal />
      <ResultEntryModal />
      <TemplateEditorModal />
    </div>
  );
}