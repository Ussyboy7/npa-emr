"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, TestTube, Clock, User, Calendar, Beaker } from "lucide-react";
import { SampleCollectionModal } from "@/components/lab/samplecollectionmodal";
import { LabOrder, Priority, Status } from "@/types/lab"; // Import types

// Mock data (replace with API)
const labOrdersMock: LabOrder[] = [
  // ... (from original code)
];

const LabOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedTestsForCollection, setSelectedTestsForCollection] = useState<string[]>([]);

  const itemsPerPage = 5;
  const [labOrders, setLabOrders] = useState<LabOrder[]>(labOrdersMock);

  // Filter pending orders
  const filteredOrders = useMemo(() => {
    return labOrders
      .filter(order => order.status === "Pending")
      .filter(order => {
        const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter;
        const matchesDate = !dateFilter || order.orderDate === dateFilter;
        return matchesSearch && matchesPriority && matchesDate;
      });
  }, [labOrders, searchTerm, priorityFilter, dateFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    stat: filteredOrders.filter(o => o.priority === "STAT").length,
    urgent: filteredOrders.filter(o => o.priority === "Urgent").length,
    routine: filteredOrders.filter(o => o.priority === "Routine").length,
  }), [filteredOrders]);

  // Handle collection start
  const startCollection = (order: LabOrder, selectedTests: string[]) => {
    setSelectedOrder(order);
    setSelectedTestsForCollection(selectedTests);
    setShowCollectionModal(true);
  };

  // Update order status after collection
  const onCollectionComplete = (orderId: string) => {
    setLabOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: "Collected" as Status } : o
    ));
  };

  // Utility functions
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Routine": return "bg-blue-100 text-blue-800 border-blue-200";
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lab Orders (Pending)</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        {/* Add other stats cards similarly */}
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search patient, order, doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="STAT">STAT</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.map((order) => (
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
                <p><strong>Notes:</strong> {order.clinicalNotes}</p>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  {order.tests.map(test => (
                    <Checkbox
                      key={test.id}
                      checked={selectedTestsForCollection.includes(test.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTestsForCollection(prev => 
                          checked ? [...prev, test.id] : prev.filter(id => id !== test.id)
                        );
                      }}
                    >
                      {test.name}
                    </Checkbox>
                  ))}
                </div>
                <Button onClick={() => startCollection(order, selectedTestsForCollection)}>
                  Collect Sample
                </Button>
                <Button variant="outline" onClick={() => alert(`View details for ${order.orderId}`)}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <SampleCollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        order={selectedOrder}
        selectedTests={selectedTestsForCollection}
        onComplete={onCollectionComplete}
      />
    </div>
  );
};

export default LabOrdersPage;