"use client";

import React from "react";
import Link from "next/link"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
} from "lucide-react";

// ✅ Mock data
const recentDispensed = [
  {
    id: "RX001",
    patient: "John Smith",
    medication: "Amoxicillin 500mg",
    time: "10:30 AM",
    amount: "$15.50",
  },
  {
    id: "RX002",
    patient: "Mary Johnson",
    medication: "Metformin 850mg",
    time: "10:15 AM",
    amount: "$22.00",
  },
  {
    id: "RX003",
    patient: "Robert Davis",
    medication: "Lisinopril 10mg",
    time: "09:45 AM",
    amount: "$18.75",
  },
];

const lowStockAlerts = [
  { name: "Paracetamol 250mg", current: 50, minimum: 200, status: "Critical" },
  { name: "Insulin Rapid", current: 25, minimum: 50, status: "Low" },
  { name: "Aspirin 75mg", current: 80, minimum: 100, status: "Low" },
];

const todayStats = {
  prescriptions: { processed: 142, pending: 28, urgent: 5 },
  revenue: { today: 3450, target: 4000, percentage: 86 },
  efficiency: { avgWait: 12, target: 15, improvement: 2 },
};

export default function PharmacyDashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Pharmacy Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/pharmacy/pool-queue">
              <Pill className="h-4 w-4 mr-2" />
              View Queue
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pharmacy/inventory">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Prescriptions
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStats.prescriptions.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayStats.prescriptions.urgent} urgent orders
            </p>
            <Button size="sm" className="mt-2" asChild>
              <Link href="/pharmacy/review-dispensary">Review Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStats.prescriptions.processed}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +18% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayStats.revenue.today.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayStats.revenue.percentage}% of $
              {todayStats.revenue.target.toLocaleString()} target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Wait Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStats.efficiency.avgWait} min
            </div>
            <p className="text-xs text-muted-foreground">
              -{todayStats.efficiency.improvement} min from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Stock Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockAlerts.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.current}/{item.minimum} units
                  </p>
                </div>
                <Badge
                  variant={item.status === "Critical" ? "destructive" : "secondary"}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
            <Button size="sm" className="w-full" variant="outline" asChild>
              <Link href="/pharmacy/inventory">View All Inventory</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Dispensed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Dispensed
            </CardTitle>
            <CardDescription>Latest prescription activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDispensed.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium text-sm">{item.patient}</p>
                  <p className="text-xs text-muted-foreground">{item.medication}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.amount}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
            <Button size="sm" className="w-full" variant="outline" asChild>
              <Link href="/pharmacy/dispense-history">View History</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" asChild>
              <Link href="/pharmacy/review-dispensary">
                <Pill className="h-4 w-4 mr-2" />
                Review Prescriptions
              </Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/pharmacy/inventory">
                <Package className="h-4 w-4 mr-2" />
                Manage Inventory
              </Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/pharmacy/item-management">
                <FileText className="h-4 w-4 mr-2" />
                Add New Item
              </Link>
            </Button>
            <Button className="w-full" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}