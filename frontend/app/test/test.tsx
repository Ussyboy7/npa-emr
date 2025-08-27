"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Eye, Send, Plus, Printer } from "lucide-react";
import { LabOrder, Status, Priority, TestType, ResultStatus, LabResult, ResultTemplate } from "@/types/lab";
import { labOrdersMock, resultTemplatesData } from "@/types/labdata";
import { getResultStatusColor, formatDate, generatePDFReport } from "@/lib/labutils";
import { ResultEntryModal } from "@/components/lab/resultentrymodal";
import { TemplateEditorModal } from "@/components/lab/templateeditormodal";
import { LabQueueTab } from "@/components/lab/labqueuetab";

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
  
  const itemsPerPage = 5;

  const [labOrders, setLabOrders] = useState<LabOrder[]>(labOrdersMock);
  const [resultTemplates, setResultTemplates] = useState<ResultTemplate[]>(resultTemplatesData);
  const [labResults, setLabResults] = useState<LabResult[]>([]);

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

  // Handle result submission
  const handleSubmitResults = () => {
    if (!selectedOrder) return;

    const newResult: LabResult = {
      orderId: selectedOrder.orderId,
      patientId: selectedOrder.patientId,
      patientName: selectedOrder.patientName,
      doctorName: selectedOrder.doctorName,
      resultDate: new Date().toISOString().split('T')[0],
      resultTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      results: Object.entries(resultData).map(([key, value]) => ({
        testId: key,
        testName: selectedTemplate?.fields.find(f => f.id === key)?.name || key,
        value: value as string,
        unit: selectedTemplate?.fields.find(f => f.id === key)?.unit || "",
        normalRange: selectedTemplate?.fields.find(f => f.id === key)?.normalRange || "",
        status: "Normal" as ResultStatus // This would be calculated based on ranges
      })),
      overallStatus: "Normal" as ResultStatus,
      technician: "Current User",
      isOutsourced: selectedOrder.tests.some(test => test.testType === "Outsourced"),
      outsourceLab: selectedOrder.tests.some(test => test.testType === "Outsourced") ? "External Lab Inc." : undefined,
      uploadedFiles: uploadedFiles,
      templateUsed: selectedTemplate?.name
    };

    setLabResults(prev => [...prev, newResult]);
    updateOrderStatus(selectedOrder.id, "Results Ready");
    setShowResultEntry(false);
    setSelectedOrder(null);
    setResultData({});
    setUploadedFiles([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Laboratory Queue Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateEditor(true)}>
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
        <LabQueueTab
          labOrders={labOrders}
          labResults={labResults}
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          testTypeFilter={testTypeFilter}
          setTestTypeFilter={setTestTypeFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          paginatedOrders={paginatedOrders}
          filteredOrders={filteredOrders}
          updateOrderStatus={updateOrderStatus}
          setSelectedOrder={setSelectedOrder}
          setShowResultEntry={setShowResultEntry}
        />
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
                          <Printer className="h-4 w-4 mr-1" />
                          Generate PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm"
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
            <Button onClick={() => setShowTemplateEditor(true)}>
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
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
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

      {/* Modals */}
      <ResultEntryModal 
        show={showResultEntry}
        onClose={() => setShowResultEntry(false)}
        selectedOrder={selectedOrder}
        selectedTemplate={selectedTemplate}
        resultData={resultData}
        setResultData={setResultData}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        handleSubmitResults={handleSubmitResults}
        resultTemplates={resultTemplates}
        setSelectedTemplate={setSelectedTemplate}
      />
      <TemplateEditorModal 
        show={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
}