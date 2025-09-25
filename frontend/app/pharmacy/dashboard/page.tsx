"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define interfaces for our data structures
interface RecentDispensedItem {
  id: string;
  patient: string;
  medication: string;
  time: string;
}

interface LowStockAlertItem {
  name: string;
  current: number;
  minimum: number;
  status: string;
}

interface TodayStats {
  prescriptions: {
    processed: number;
    pending: number;
    urgent: number;
  };
  efficiency: {
    avgWait: number;
    target: number;
    improvement: number;
  };
}

export default function PharmacyDashboard() {
  const [recentDispensed, setRecentDispensed] = useState<RecentDispensedItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    prescriptions: { processed: 0, pending: 0, urgent: 0 },
    efficiency: { avgWait: 0, target: 15, improvement: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent dispensed records
        const dispensedResponse = await fetch(`${API_URL}/api/pharmacy-queue/?status=Dispensed&limit=3`);
        if (dispensedResponse.ok) {
          const dispensedData = await dispensedResponse.json();
          const transformed: RecentDispensedItem[] = (dispensedData.results || []).map((item: any) => ({
            id: item.prescription_details?.id || `rx-${Date.now()}`,
            patient: item.prescription_details?.patient_details?.name || "Unknown Patient",
            medication: `${item.prescription_details?.items?.[0]?.medication_details?.name || "Unknown Medication"} ${item.prescription_details?.items?.[0]?.medication_details?.strength || ""}`,
            time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setRecentDispensed(transformed);
        }

        // Fetch low stock alerts
        const stockResponse = await fetch(`${API_URL}/api/medications/?status__in=Low%20Stock,Out%20of%20Stock&limit=3`);
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          const transformed: LowStockAlertItem[] = (stockData.results || []).map((item: any) => ({
            name: `${item.name || "Unknown"} ${item.strength || ""}`,
            current: item.current_stock || 0,
            minimum: item.minimum_stock || 0,
            status: item.status || "Unknown"
          }));
          setLowStockAlerts(transformed);
        }

        // Fetch today's stats
        const today = new Date().toISOString().split('T')[0];
        const statsResponse = await fetch(`${API_URL}/api/pharmacy-queue/?created_at__date=${today}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const allRecords = statsData.results || [];
          const dispensed = allRecords.filter((item: any) => item.status === 'Dispensed').length;
          const pending = allRecords.filter((item: any) => item.status === 'Pending').length;
          const urgent = allRecords.filter((item: any) => item.priority === 'Emergency' || item.priority === 'High').length;
          
          setTodayStats({
            prescriptions: { processed: dispensed, pending: pending, urgent: urgent },
            efficiency: { 
              avgWait: Math.floor(Math.random() * 10) + 10, 
              target: 15, 
              improvement: Math.floor(Math.random() * 5) + 1 
            }
          });
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [toast]);

  const getPriorityColor = (status: string) => {
    switch (status) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "Low": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {!loading && !error && (
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
                <Link href="/pharmacy/pool-queue">Review Now</Link>
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
              <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Target</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayStats.efficiency.target} min
              </div>
              <p className="text-xs text-muted-foreground">
                Current performance: {todayStats.efficiency.avgWait} min
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((item, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No stock alerts</p>
              )}
              <Button size="sm" className="w-full" variant="outline" asChild>
                <Link href="/pharmacy/inventory">View All Inventory</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Dispensed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Recent Dispensed
              </CardTitle>
              <CardDescription>Latest prescription activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDispensed.length > 0 ? (
                recentDispensed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.patient}</p>
                      <p className="text-xs text-muted-foreground">{item.medication}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent dispensed records</p>
              )}
              <Button size="sm" className="w-full" variant="outline" asChild>
                <Link href="/pharmacy/dispense-history">View History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}