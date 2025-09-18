"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, TestTube, FileText, Send, Eye, Clock, User, Calendar, Beaker, CheckCircle2, Activity, AlertTriangle } from "lucide-react";

const labOrders = [
  {
    id: "LO001",
    orderId: "ORD-2024-001",
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    priority: "Urgent",
    status: "In Progress",
    orderDate: "2024-12-17",
    orderTime: "08:30 AM",
    collectionDate: "2024-12-17",
    collectionTime: "09:15 AM",
    clinicalNotes: "Pre-operative workup, chest pain investigation",
    tests: [
      { id: "CBC001", name: "Complete Blood Count", code: "CBC", testType: "In-house", turnaroundTime: "2-4 hours" },
      { id: "LIP001", name: "Lipid Panel", code: "LIP", testType: "In-house", turnaroundTime: "4-6 hours" }
    ],
    age: 45,
    gender: "Male",
    clinic: "GOP",
    location: "Headquarters",
    collectedBy: "Nurse Johnson",
    testStatuses: { "CBC001": "Results Ready", "LIP001": "In Progress" }
  },
  {
    id: "LO002",
    orderId: "ORD-2024-002",
    patientName: "Jane Smith",
    doctorName: "Dr. Wilson",
    priority: "STAT",
    status: "Results Ready",
    orderDate: "2024-12-17",
    orderTime: "07:45 AM",
    collectionDate: "2024-12-17",
    collectionTime: "08:00 AM",
    completedDate: "2024-12-17",
    completedTime: "11:30 AM",
    clinicalNotes: "Emergency case, suspected thyroid storm",
    tests: [
      { id: "TSH001", name: "Thyroid Function Test", code: "TFT", testType: "Outsourced", turnaroundTime: "24-48 hours" }
    ],
    age: 34,
    gender: "Female",
    clinic: "Emergency",
    location: "Main Hospital",
    collectedBy: "Lab Tech A",
    testStatuses: { "TSH001": "Results Ready" }
  },
  {
    id: "LO003",
    orderId: "ORD-2024-003",
    patientName: "Robert Johnson",
    doctorName: "Dr. Davis",
    priority: "Routine",
    status: "Pending",
    orderDate: "2024-12-17",
    orderTime: "10:00 AM",
    expectedDate: "2024-12-19",
    clinicalNotes: "Annual health checkup",
    tests: [
      { id: "CBC002", name: "Complete Blood Count", code: "CBC", testType: "In-house", turnaroundTime: "2-4 hours" },
      { id: "BMP001", name: "Basic Metabolic Panel", code: "BMP", testType: "In-house", turnaroundTime: "4-6 hours" }
    ],
    age: 28,
    gender: "Male",
    clinic: "GOP",
    location: "Branch Office",
    testStatuses: {}
  }
];

export default function LabPoolQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [testTypeFilter, setTestTypeFilter] = useState("All");
  const [selectedTests, setSelectedTests] = useState({});

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Routine": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Collected": return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Results Ready": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Validated": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
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

  const handleTestSelection = (orderId, testId, checked) => {
    setSelectedTests(prev => {
      const current = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: checked 
          ? [...current, testId]
          : current.filter(id => id !== testId)
      };
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    alert(`Order ${orderId} status updated to ${newStatus}`);
  };

  const sendSelectedResults = (order) => {
    const selected = selectedTests[order.id] || [];
    if (selected.length === 0) {
      alert("Please select tests to send");
      return;
    }
    alert(`Sent ${selected.length} test results to doctor for ${order.patientName}`);
    setSelectedTests(prev => ({ ...prev, [order.id]: [] }));
  };

  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter;
    const matchesTestType = testTypeFilter === "All" || order.tests.some(test => test.testType === testTypeFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesTestType;
  });

  const stats = {
    total: labOrders.length,
    pending: labOrders.filter(order => order.status === "Pending").length,
    collected: labOrders.filter(order => order.status === "Collected").length,
    inProgress: labOrders.filter(order => order.status === "In Progress").length,
    resultsReady: labOrders.filter(order => order.status === "Results Ready").length,
    validated: labOrders.filter(order => order.status === "Validated").length,
    completed: labOrders.filter(order => order.status === "Completed").length,
    stat: labOrders.filter(order => order.priority === "STAT").length,
    urgent: labOrders.filter(order => order.priority === "Urgent").length,
    outsourced: labOrders.filter(order => order.tests.some(test => test.testType === "Outsourced")).length
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratory Queue Management</h1>
          <p className="text-gray-600">Monitor and manage all laboratory orders</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.stat} STAT priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.collected}</div>
            <p className="text-xs text-muted-foreground">Ready for processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Results Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.resultsReady}</div>
            <p className="text-xs text-muted-foreground">Awaiting validation</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search Orders</Label>
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
            <Label>Status Filter</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Collected">Collected</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Results Ready">Results Ready</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
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
            <Label>Test Type</Label>
            <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
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
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredOrders.length} lab orders
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const selectedForThis = (selectedTests[order.id] || []).length;
          return (
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
                          <span><strong>Clinic:</strong> {order.clinic}</span>
                          <span><strong>Location:</strong> {order.location}</span>
                        </div>
                        <div>
                          <strong>Clinical Notes:</strong> {order.clinicalNotes}
                        </div>
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
                  <div>
                    <strong className="text-sm">Tests Ordered ({order.tests.length}):</strong>
                    <div className="mt-2 space-y-2">
                      {order.tests.map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={(selectedTests[order.id] || []).includes(test.id)}
                              onCheckedChange={(checked) => {
                                handleTestSelection(order.id, test.id, checked);
                              }}
                            />
                            <div>
                              <span className="font-medium">{test.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({test.code})</span>
                              {order.testStatuses && order.testStatuses[test.id] && (
                                <Badge className={`${getStatusColor(order.testStatuses[test.id])} ml-2`} variant="outline">
                                  {order.testStatuses[test.id]}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={test.testType} onValueChange={() => alert('Test type updated')}>
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
                        onClick={() => alert('Opening result entry modal')}
                        className="hover:bg-green-600"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Enter Results
                      </Button>
                    )}
                    {order.status === "Results Ready" && selectedForThis > 0 && (
                      <Button 
                        size="sm"
                        onClick={() => alert('Validating results')}
                        className="hover:bg-indigo-600"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Validate ({selectedForThis})
                      </Button>
                    )}
                    {order.status === "Validated" && selectedForThis > 0 && (
                      <Button 
                        size="sm"
                        onClick={() => sendSelectedResults(order)}
                        className="hover:bg-green-600"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Selected ({selectedForThis})
                      </Button>
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
          );
        })}
      </div>
    </div>
  );
}