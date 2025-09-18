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
import { Search, User, Calendar, Beaker, Save, X, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

const pendingOrders = [
  {
    id: "LO001",
    orderId: "ORD-2024-001",
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    priority: "Urgent",
    orderDate: "2024-12-17",
    orderTime: "08:30 AM",
    clinicalNotes: "Pre-operative workup, chest pain investigation",
    tests: [
      { id: "CBC001", name: "Complete Blood Count", code: "CBC", specimenType: "Blood", containerType: "EDTA tube", volume: "5ml", fastingRequired: false },
      { id: "LIP001", name: "Lipid Panel", code: "LIP", specimenType: "Blood", containerType: "Serum tube", volume: "5ml", fastingRequired: true }
    ],
    age: 45,
    gender: "Male",
    phoneNumber: "123-456-7890",
    clinic: "GOP",
    location: "Headquarters"
  },
  {
    id: "LO002",
    orderId: "ORD-2024-002",
    patientName: "Jane Smith",
    doctorName: "Dr. Wilson",
    priority: "STAT",
    orderDate: "2024-12-17",
    orderTime: "07:45 AM",
    clinicalNotes: "Emergency case, suspected thyroid storm",
    tests: [
      { id: "TSH001", name: "Thyroid Function Test", code: "TFT", specimenType: "Blood", containerType: "Serum tube", volume: "3ml", fastingRequired: false }
    ],
    age: 34,
    gender: "Female",
    phoneNumber: "987-654-3210",
    clinic: "Emergency",
    location: "Main Hospital"
  }
];

export default function SampleCollectionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTests, setSelectedTests] = useState({});
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionForm, setCollectionForm] = useState({
    collectionDate: new Date().toISOString().split('T')[0],
    collectionTime: '',
    collectionMethod: '',
    fastingStatus: '',
    collectedBy: '',
    notes: ''
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Routine": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  const handleTestSelection = (orderId: string, testId: string, checked: string | boolean) => {
    setSelectedTests(prev => {
      const current = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: checked 
          ? [...current, testId]
          : current.filter((id: any) => id !== testId)
      };
    });
  };

  const handleSelectAllTests = (orderId: string, allTestIds: string[]) => {
    setSelectedTests(prev => ({
      ...prev,
      [orderId]: allTestIds
    }));
  };

  const handleCollectionSubmit = () => {
    if (!selectedOrder) return;
    alert(`Sample collection recorded for ${selectedOrder.patientName}`);
    setShowCollectionModal(false);
    setSelectedOrder(null);
    setCollectionForm({
      collectionDate: new Date().toISOString().split('T')[0],
      collectionTime: '',
      collectionMethod: '',
      fastingStatus: '',
      collectedBy: '',
      notes: ''
    });
  };

  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: filteredOrders.length,
    stat: filteredOrders.filter(o => o.priority === "STAT").length,
    urgent: filteredOrders.filter(o => o.priority === "Urgent").length,
    routine: filteredOrders.filter(o => o.priority === "Routine").length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Collection</h1>
          <p className="text-gray-600">Collect samples for pending lab orders</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting collection</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">STAT Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.stat}</div>
            <p className="text-xs text-muted-foreground">Immediate collection needed</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Priority collection</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Routine</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.routine}</div>
            <p className="text-xs text-muted-foreground">Standard collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Search Orders</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by patient or order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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

      {/* Pending Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const selectedTestsForOrder = selectedTests[order.id] || [];
          const hasSelection = selectedTestsForOrder.length > 0;
          
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
                      <div>
                        <strong>Clinical Notes:</strong> {order.clinicalNotes}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={getPriorityColor(order.priority)} variant="outline">
                      {order.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm">Tests for Collection ({order.tests.length}):</strong>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllTests(order.id, order.tests.map(t => t.id))}
                      >
                        Select All Tests
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {order.tests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedTestsForOrder.includes(test.id)}
                              onCheckedChange={(checked) => handleTestSelection(order.id, test.id, checked)}
                            />
                            <div>
                              <span className="font-medium">{test.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({test.code})</span>
                              <div className="text-xs text-gray-600 mt-1">
                                {test.specimenType} • {test.containerType} • {test.volume}
                                {test.fastingRequired && <span className="text-orange-600 font-medium"> • Fasting Required</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="sm"
                      disabled={!hasSelection}
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowCollectionModal(true);
                      }}
                      className="hover:bg-blue-600"
                    >
                      <Beaker className="h-4 w-4 mr-1" />
                      Collect Sample ({selectedTestsForOrder.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Collection Modal */}
      {showCollectionModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
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

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Collection Date</Label>
                  <Input 
                    type="date" 
                    value={collectionForm.collectionDate} 
                    onChange={(e) => setCollectionForm(prev => ({...prev, collectionDate: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Collection Time</Label>
                  <Input 
                    type="time" 
                    value={collectionForm.collectionTime} 
                    onChange={(e) => setCollectionForm(prev => ({...prev, collectionTime: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label>Collection Method</Label>
                <Select value={collectionForm.collectionMethod} onValueChange={(v) => setCollectionForm(prev => ({...prev, collectionMethod: v}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Venipuncture">Venipuncture</SelectItem>
                    <SelectItem value="Finger prick">Finger prick</SelectItem>
                    <SelectItem value="Catheter sample">Catheter sample</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fasting Status</Label>
                <Select value={collectionForm.fastingStatus} onValueChange={(v) => setCollectionForm(prev => ({...prev, fastingStatus: v}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fasting">Fasting (8+ hours)</SelectItem>
                    <SelectItem value="non-fasting">Non-fasting</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Collected By</Label>
                <Input 
                  value={collectionForm.collectedBy} 
                  onChange={(e) => setCollectionForm(prev => ({...prev, collectedBy: e.target.value}))} 
                  placeholder="Technician name"
                />
              </div>

              <div>
                <Label>Collection Notes</Label>
                <Textarea 
                  value={collectionForm.notes} 
                  onChange={(e) => setCollectionForm(prev => ({...prev, notes: e.target.value}))} 
                  rows={4} 
                  placeholder="Patient cooperation, collection difficulties, sample quality observations..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCollectionModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCollectionSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  Record Collection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}