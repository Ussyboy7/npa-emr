"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Users,
  Stethoscope,
  Activity,
  AlertTriangle,
  Clock,
  Bed,
  Syringe,
  Bandage,
  Calendar,
  ClipboardList,
  Droplets,
  FileText,
  Eye,
  ArrowRight,
  RefreshCw,
  Heart,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockPoolQueueData = {
  totalPatients: 8,
  awaitingVitals: 3,
  vitalsComplete: 4,
  completed: 1,
  emergencyPatients: 2,
  averageWaitTime: 35,
  patientsWithAlerts: 2,
  recentPatients: [
    {
      id: "P001",
      name: "John Doe",
      status: "Awaiting Vitals",
      priority: "High",
      clinic: "General",
      waitTime: 45,
      alerts: [],
    },
    {
      id: "P002",
      name: "Jane Smith",
      status: "Vitals Complete",
      priority: "Medium",
      clinic: "Eye",
      waitTime: 30,
      alerts: [],
    },
    {
      id: "P003",
      name: "Michael Johnson",
      status: "Vitals Complete",
      priority: "Emergency",
      clinic: "General",
      waitTime: 10,
      alerts: ["High Temperature", "High Blood Pressure"],
    },
  ],
};

const mockInjectionData = {
  totalPatients: 4,
  awaitingInjection: 3,
  injectionComplete: 1,
  emergencyPatients: 0,
  averageWaitTime: 18,
  patientsWithAlerts: 1,
  recentPatients: [
    {
      id: "PI001",
      name: "John Doe",
      status: "Awaiting Injection",
      priority: "High",
      waitTime: 25,
      injectionType: "Insulin",
      alerts: ["Insulin administration required"],
    },
    {
      id: "PI002",
      name: "Jane Smith",
      status: "Awaiting Injection",
      priority: "Medium",
      waitTime: 15,
      injectionType: "B12",
      alerts: [],
    },
  ],
};

const mockDressingData = {
  totalPatients: 4,
  awaitingDressing: 3,
  dressingComplete: 1,
  emergencyPatients: 1,
  averageWaitTime: 22,
  patientsWithAlerts: 2,
  recentPatients: [
    {
      id: "PD001",
      name: "Jane Smith",
      status: "Awaiting Dressing",
      priority: "Emergency",
      waitTime: 10,
      woundType: "Burn",
      alerts: ["Infected burn wound"],
    },
    {
      id: "PD002",
      name: "Michael Johnson",
      status: "Awaiting Dressing",
      priority: "Medium",
      waitTime: 45,
      woundType: "Pressure Ulcer",
      alerts: ["Wound deteriorating"],
    },
  ],
};

const mockWardData = {
  maleWard: {
    occupancy: 2,
    capacity: 5,
    criticalPatients: 1,
    dischargeReady: 0,
  },
  femaleWard: {
    occupancy: 1,
    capacity: 5,
    criticalPatients: 0,
    dischargeReady: 0,
  },
  patients: [
    {
      id: "WP001",
      name: "John Doe",
      bedNumber: 1,
      status: "Stable",
      ward: "Male",
      diagnosis: "Hypertension",
      daysSinceAdmission: 1,
      pendingOrders: 1,
    },
    {
      id: "WP002",
      name: "Michael Johnson",
      bedNumber: 3,
      status: "Critical",
      ward: "Male",
      diagnosis: "Chest Pain Investigation",
      daysSinceAdmission: 1,
      pendingOrders: 1,
    },
    {
      id: "WP003",
      name: "Jane Smith",
      bedNumber: 2,
      status: "Stable",
      ward: "Female",
      diagnosis: "Diabetes Mellitus Type 2",
      daysSinceAdmission: 2,
      pendingOrders: 1,
    },
  ],
};

const mockVitalsOverview = {
  totalRecords: 15,
  recordsToday: 6,
  patientsWithAlerts: 2,
  avgTemperature: 37.1,
  avgBloodPressure: "125/82",
  recentVitals: [
    {
      patientName: "John Doe",
      time: "12:10",
      temperature: "37.0",
      bp: "120/80",
      alerts: [],
    },
    {
      patientName: "Michael Johnson",
      time: "11:45",
      temperature: "38.8",
      bp: "145/95",
      alerts: ["High Temperature", "High Blood Pressure"],
    },
  ],
};

const NursingDashboard = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [alerts, setAlerts] = useState([
    {
      id: "A001",
      type: "critical",
      message: "Michael Johnson - Critical vitals detected",
      time: "2 mins ago",
      patientId: "P003",
    },
    {
      id: "A002",
      type: "warning",
      message: "3 patients awaiting vitals > 30 minutes",
      time: "5 mins ago",
    },
    {
      id: "A003",
      type: "info",
      message: "Male Ward: 1 patient ready for discharge",
      time: "15 mins ago",
    },
  ]);

  // Update time every minute
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate total bed occupancy
  const totalOccupancy =
    mockWardData.maleWard.occupancy + mockWardData.femaleWard.occupancy;
  const totalCapacity =
    mockWardData.maleWard.capacity + mockWardData.femaleWard.capacity;
  const occupancyRate = Math.round((totalOccupancy / totalCapacity) * 100);

  // Calculate critical metrics across all areas
  const totalCriticalPatients = mockWardData.patients.filter(
    (p) => p.status === "Critical"
  ).length;
  const totalEmergencyQueue =
    mockPoolQueueData.emergencyPatients +
    mockInjectionData.emergencyPatients +
    mockDressingData.emergencyPatients;
  const totalHighPriority = totalCriticalPatients + totalEmergencyQueue;

  // Calculate total patients across all areas
  const totalAllPatients =
    mockPoolQueueData.totalPatients +
    mockInjectionData.totalPatients +
    mockDressingData.totalPatients +
    totalOccupancy;
  const totalWithAlerts =
    mockPoolQueueData.patientsWithAlerts +
    mockInjectionData.patientsWithAlerts +
    mockDressingData.patientsWithAlerts;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nursing Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of nursing operations and patient care
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Last updated:{" "}
            {currentTime
              ? currentTime.toLocaleTimeString("en-US", { hour12: false })
              : "Loading..."}
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({alerts.length})
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter((a) => a.type === "critical").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong>{" "}
            {alerts.find((a) => a.type === "critical")?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview - Updated with all nursing areas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllPatients}</div>
            <p className="text-xs text-muted-foreground">across all areas</p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Queue Patients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPoolQueueData.totalPatients}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockPoolQueueData.awaitingVitals} awaiting vitals
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Injection Room
            </CardTitle>
            <Syringe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInjectionData.totalPatients}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockInjectionData.awaitingInjection} awaiting
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dressing Room</CardTitle>
            <Bandage className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDressingData.totalPatients}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockDressingData.awaitingDressing} awaiting
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ward Occupancy
            </CardTitle>
            <Bed className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOccupancy}/{totalCapacity}
            </div>
            <p className="text-xs text-muted-foreground">
              {occupancyRate}% occupied
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalHighPriority}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCriticalPatients} critical, {totalEmergencyQueue} emergency
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalWithAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              patients with alerts
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Records
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockVitalsOverview.recordsToday}
            </div>
            <p className="text-xs text-muted-foreground">vitals recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs - Updated with injection and dressing areas */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="injection">Injection</TabsTrigger>
          <TabsTrigger value="dressing">Dressing</TabsTrigger>
          <TabsTrigger value="wards">Wards</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/nursing/pool-queue">
                  <Button className="w-full justify-start" variant="outline">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Go to Pool Queue
                  </Button>
                </Link>
                <Link href="/nursing/patient--vitals">
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Patient Vitals
                  </Button>
                </Link>
                <Link href="/nursing/wards">
                  <Button className="w-full justify-start" variant="outline">
                    <Bed className="h-4 w-4 mr-2" />
                    Ward Management
                  </Button>
                </Link>
                <Link href="/nursing/injection">
                  <Button className="w-full justify-start" variant="outline">
                    <Syringe className="h-4 w-4 mr-2" />
                    Injection Room
                  </Button>
                </Link>
                <Link href="/nursing/dressing">
                  <Button className="w-full justify-start" variant="outline">
                    <Bandage className="h-4 w-4 mr-2" />
                    Dressing Room
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity - Updated to include all areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="text-sm">
                      <div className="font-medium">
                        Infected burn wound - Jane Smith
                      </div>
                      <div className="text-xs text-gray-600">
                        Dressing Room • 2 mins ago
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="text-sm">
                      <div className="font-medium">
                        Vitals recorded - John Doe
                      </div>
                      <div className="text-xs text-gray-600">
                        Pool Queue • 12:10 PM
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="text-sm">
                      <div className="font-medium">
                        Insulin injection - John Doe
                      </div>
                      <div className="text-xs text-gray-600">
                        Injection Room • 11:30 AM
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="text-sm">
                      <div className="font-medium">
                        Patient admitted - Ward 1
                      </div>
                      <div className="text-xs text-gray-600">
                        Male Ward • 10:30 AM
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Admitted
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Patients - Updated to include all areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Patients Requiring Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Emergency/Critical from Dressing Room */}
                {mockDressingData.recentPatients
                  .filter(
                    (p) => p.priority === "Emergency" || p.alerts.length > 0
                  )
                  .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                    >
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">
                          Dressing Room • {patient.woundType} • Waiting:{" "}
                          {patient.waitTime}m
                        </div>
                        {patient.alerts.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {patient.alerts.join(" • ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">
                          {patient.priority}
                        </Badge>
                        <Button size="sm">
                          <Bandage className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {/* Emergency/Critical from Pool Queue */}
                {mockPoolQueueData.recentPatients
                  .filter(
                    (p) => p.priority === "Emergency" || p.alerts.length > 0
                  )
                  .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                    >
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">
                          Pool Queue • {patient.clinic} • Waiting:{" "}
                          {patient.waitTime}m
                        </div>
                        {patient.alerts.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {patient.alerts.join(" • ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">
                          {patient.priority}
                        </Badge>
                        <Button size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {/* High Priority from Injection Room */}
                {mockInjectionData.recentPatients
                  .filter((p) => p.priority === "High" || p.alerts.length > 0)
                  .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-orange-50"
                    >
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">
                          Injection Room • {patient.injectionType} • Waiting:{" "}
                          {patient.waitTime}m
                        </div>
                        {patient.alerts.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {patient.alerts.join(" • ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800">
                          {patient.priority}
                        </Badge>
                        <Button size="sm">
                          <Syringe className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Tab - Updated to include all areas */}
        <TabsContent value="queue" className="space-y-6">
          {/* Overall Queue Performance */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pool Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPoolQueueData.totalPatients}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mockPoolQueueData.averageWaitTime}m avg wait
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Injection Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockInjectionData.totalPatients}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mockInjectionData.averageWaitTime}m avg wait
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Dressing Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockDressingData.totalPatients}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mockDressingData.averageWaitTime}m avg wait
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Emergency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {totalEmergencyQueue}
                </div>
                <div className="text-xs text-muted-foreground">
                  across all areas
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {totalWithAlerts}
                </div>
                <div className="text-xs text-muted-foreground">
                  requiring attention
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Queue Workflow Status */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Flow Across All Areas</CardTitle>
              <CardDescription>
                Real-time view of patient movement through nursing workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="text-center p-4 border rounded-lg bg-red-50">
                  <div className="text-2xl font-bold text-red-600">
                    {mockPoolQueueData.awaitingVitals}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    Awaiting Vitals
                  </div>
                  <div className="text-xs text-gray-600">Pool Queue</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-yellow-50">
                  <div className="text-2xl font-bold text-yellow-600">
                    {mockPoolQueueData.vitalsComplete}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    Ready for Doctor
                  </div>
                  <div className="text-xs text-gray-600">Pool Queue</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">
                    {mockInjectionData.awaitingInjection}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    Awaiting Injection
                  </div>
                  <div className="text-xs text-gray-600">Injection Room</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">
                    {mockDressingData.awaitingDressing}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    Awaiting Dressing
                  </div>
                  <div className="text-xs text-gray-600">Dressing Room</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalOccupancy}
                  </div>
                  <div className="text-sm font-medium mt-1">In Wards</div>
                  <div className="text-xs text-gray-600">Admitted</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Injection Room Tab */}
        <TabsContent value="injection" className="space-y-6">
          {/* Injection Room Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Total in Injection Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockInjectionData.totalPatients}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Awaiting Injection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {mockInjectionData.awaitingInjection}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">With Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {mockInjectionData.patientsWithAlerts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {mockInjectionData.averageWaitTime}m
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Injection Room Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Injection Room Queue</CardTitle>
              <CardDescription>Patients requiring injections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockInjectionData.recentPatients
                  .sort((a, b) => {
                    const priorityOrder = {
                      Emergency: 0,
                      High: 1,
                      Medium: 2,
                      Low: 3,
                    };
                    return (
                      priorityOrder[a.priority as keyof typeof priorityOrder] -
                      priorityOrder[b.priority as keyof typeof priorityOrder]
                    );
                  })
                  .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            patient.priority === "Emergency"
                              ? "bg-red-500"
                              : patient.priority === "High"
                              ? "bg-orange-500"
                              : patient.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-600">
                            {patient.injectionType} • {patient.waitTime}m wait
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            patient.status === "Awaiting Injection"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {patient.status}
                        </Badge>
                        {patient.status === "Awaiting Injection" && (
                          <Button size="sm">
                            <Syringe className="h-4 w-4 mr-1" />
                            Administer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dressing Room Tab */}
        <TabsContent value="dressing" className="space-y-6">
          {/* Dressing Room Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Total in Dressing Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockDressingData.totalPatients}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Awaiting Dressing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {mockDressingData.awaitingDressing}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">With Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {mockDressingData.patientsWithAlerts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {mockDressingData.averageWaitTime}m
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dressing Room Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Dressing Room Queue</CardTitle>
              <CardDescription>Patients requiring dressings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDressingData.recentPatients
                  .sort((a, b) => {
                    const priorityOrder = {
                      Emergency: 0,
                      High: 1,
                      Medium: 2,
                      Low: 3,
                    };
                    return (
                      priorityOrder[a.priority as keyof typeof priorityOrder] -
                      priorityOrder[b.priority as keyof typeof priorityOrder]
                    );
                  })
                  .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            patient.priority === "Emergency"
                              ? "bg-red-500"
                              : patient.priority === "High"
                              ? "bg-orange-500"
                              : patient.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-600">
                            {patient.woundType} • {patient.waitTime}m wait
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            patient.status === "Awaiting Dressing"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {patient.status}
                        </Badge>
                        {patient.status === "Awaiting Dressing" && (
                          <Button size="sm">
                            <Bandage className="h-4 w-4 mr-1" />
                            Perform
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wards Tab */}
        <TabsContent value="wards" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Male Ward */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Male Ward Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Occupied Beds</span>
                    <Badge variant="outline">
                      {mockWardData.maleWard.occupancy}/
                      {mockWardData.maleWard.capacity}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (mockWardData.maleWard.occupancy /
                            mockWardData.maleWard.capacity) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {mockWardData.maleWard.capacity -
                      mockWardData.maleWard.occupancy}{" "}
                    beds available
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Female Ward */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Female Ward
                </CardTitle>
                <CardDescription>
                  {mockWardData.femaleWard.occupancy}/
                  {mockWardData.femaleWard.capacity} beds occupied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Occupied Beds</span>
                    <Badge variant="outline">
                      {mockWardData.femaleWard.occupancy}/
                      {mockWardData.femaleWard.capacity}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (mockWardData.femaleWard.occupancy /
                            mockWardData.femaleWard.capacity) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {mockWardData.femaleWard.capacity -
                      mockWardData.femaleWard.occupancy}{" "}
                    beds available
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ward Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Ward Tasks</CardTitle>
              <CardDescription>
                Tasks requiring nursing attention across all wards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      Treatment Records
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">3</div>
                  <div className="text-xs text-gray-600">
                    pending documentation
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-sm">
                      Fluid Monitoring
                    </span>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">2</div>
                  <div className="text-xs text-gray-600">due for update</div>
                </div>
                <div className="p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Syringe className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Medications</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">5</div>
                  <div className="text-xs text-gray-600">due in next hour</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Active Alerts from All Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts Across All Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        Jane Smith - Infected burn wound
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Dressing Room • 2 mins ago
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Bandage className="h-4 w-4 mr-1" />
                      Go to Dressing
                    </Button>
                  </AlertDescription>
                </Alert>
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        John Doe - Insulin administration required
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Injection Room • 5 mins ago
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Syringe className="h-4 w-4 mr-1" />
                      Go to Injection
                    </Button>
                  </AlertDescription>
                </Alert>
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        Michael Johnson - Critical vitals detected
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Pool Queue • 10 mins ago
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Stethoscope className="h-4 w-4 mr-1" />
                      View Vitals
                    </Button>
                  </AlertDescription>
                </Alert>
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        3 patients awaiting vitals {">"} 30 minutes
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Pool Queue • 15 mins ago
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Queue
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Today's Task Summary - Updated */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Tasks by Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Vitals to Record</span>
                  <Badge className="bg-red-100 text-red-800">
                    {mockPoolQueueData.awaitingVitals}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Injections to Give</span>
                  <Badge className="bg-green-100 text-green-800">
                    {mockInjectionData.awaitingInjection}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Dressings to Change</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {mockDressingData.awaitingDressing}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Ward Observations</span>
                  <Badge className="bg-blue-100 text-blue-800">6</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Medication Admin</span>
                  <Badge className="bg-orange-100 text-orange-800">5</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Vitals Recorded</span>
                  <span className="font-bold text-green-600">
                    {mockVitalsOverview.recordsToday}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Injections Given</span>
                  <span className="font-bold text-green-600">8</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Dressings Changed</span>
                  <span className="font-bold text-green-600">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Patients Processed</span>
                  <span className="font-bold text-green-600">19</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Efficiency Score</span>
                  <span className="font-bold text-green-600">96%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Tasks - Updated */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks (Next 2 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Syringe className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">
                        Insulin Injection - John Doe
                      </div>
                      <div className="text-sm text-gray-600">Due now</div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bandage className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium">
                        Burn Dressing Change - Jane Smith
                      </div>
                      <div className="text-sm text-gray-600">
                        Due in 10 minutes
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">
                        Observation Round - Male Ward
                      </div>
                      <div className="text-sm text-gray-600">
                        Due in 15 minutes
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">
                        Vitals Check - 3 Patients
                      </div>
                      <div className="text-sm text-gray-600">
                        Due in 30 minutes
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium">Treatment Sheet Updates</div>
                      <div className="text-sm text-gray-600">
                        Due in 1 hour 20 minutes
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Routine</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Bar - Updated with all areas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div>
              <h3 className="font-semibold text-blue-900">Quick Actions</h3>
              <p className="text-sm text-blue-700">
                Jump to common nursing tasks across all areas
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Record Vitals
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <Syringe className="h-4 w-4 mr-2" />
                Give Injection
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <Bandage className="h-4 w-4 mr-2" />
                Change Dressing
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Send to Consultation
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Treatment Sheet
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Shift Summary - Updated with all areas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Shift Summary
            </CardTitle>
            <CardDescription>
              Your performance across all nursing areas this shift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {mockVitalsOverview.recordsToday}
                </div>
                <div className="text-xs text-gray-600">Vitals Recorded</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">8</div>
                <div className="text-xs text-gray-600">Injections Given</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">5</div>
                <div className="text-xs text-gray-600">Dressings Changed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">8</div>
                <div className="text-xs text-gray-600">Ward Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Patient Distribution
            </CardTitle>
            <CardDescription>
              Patient locations across all nursing areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Pool Queue</span>
              <Badge variant="outline">{mockPoolQueueData.totalPatients}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Injection Room</span>
              <Badge variant="outline">{mockInjectionData.totalPatients}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Dressing Room</span>
              <Badge variant="outline">{mockDressingData.totalPatients}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Male Ward</span>
              <Badge variant="outline">{mockWardData.maleWard.occupancy}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Female Ward</span>
              <Badge variant="outline">
                {mockWardData.femaleWard.occupancy}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">In Consultation</span>
              <Badge variant="outline">{mockPoolQueueData.completed}</Badge>
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Active Patients</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {totalAllPatients}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NursingDashboard;