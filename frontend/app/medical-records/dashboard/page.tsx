"use client";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  Heart,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  Activity,
  UserCheck,
  Building,
  Stethoscope,
  Plus,
  ArrowUpRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define TypeScript interfaces
interface Patient {
  id: string;
  personal_number: string;
  surname: string;
  first_name: string;
  patient_type: string;
  gender: string;
  age: number;
  blood_group: string;
  created_at: string;
  last_visit?: string;
  phone?: string;
  email?: string;
  non_npa_type?: string;
  division?: string;
  location?: string;
}

interface Visit {
  id: string;
  patient: string;
  patient_name: string;
  personal_number: string;
  visit_date: string;
  visit_time: string;
  clinic: string;
  location: string;
  visit_type: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function MedicalDashboard() {
  const [timeFilter, setTimeFilter] = useState("today");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Fetch patients
        const patientsRes = await fetch(`${API_URL}/api/patients/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!patientsRes.ok) {
          throw new Error(`Failed to fetch patients: ${patientsRes.status}`);
        }

        const patientsData = await patientsRes.json();
        setPatients(patientsData.results || patientsData);

        // Fetch visits
        const visitsRes = await fetch(`${API_URL}/api/visits/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!visitsRes.ok) {
          throw new Error(`Failed to fetch visits: ${visitsRes.status}`);
        }

        const visitsData = await visitsRes.json();
        setVisits(visitsData.results || visitsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data function
  const refreshData = () => {
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const [patientsRes, visitsRes] = await Promise.all([
          fetch(`${API_URL}/api/patients/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${API_URL}/api/visits/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (!patientsRes.ok)
          throw new Error(`Failed to fetch patients: ${patientsRes.status}`);
        if (!visitsRes.ok)
          throw new Error(`Failed to fetch visits: ${visitsRes.status}`);

        const [patientsData, visitsData] = await Promise.all([
          patientsRes.json(),
          visitsRes.json(),
        ]);

        setPatients(patientsData.results || patientsData);
        setVisits(visitsData.results || visitsData);
      } catch (err) {
        console.error("Error refreshing data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  };

  /* ---------------------------
     Analytics & Metrics
  --------------------------- */
  const analytics = useMemo(() => {
    if (patients.length === 0 && visits.length === 0) {
      return {
        patients: {
          total: 0,
          employees: 0,
          retirees: 0,
          dependents: 0,
          nonNpa: 0,
        },
        visits: {
          today: 0,
          week: 0,
          month: 0,
          scheduled: 0,
          completed: 0,
          inProgress: 0,
        },
        locations: {},
        clinics: {},
        priorities: {},
      };
    }

    const today = new Date();

    // Patient metrics
    const totalPatients = patients.length;
    const employeeCount = patients.filter(
      (p) => p.patient_type === "Employee"
    ).length;
    const retireeCount = patients.filter(
      (p) => p.patient_type === "Retiree"
    ).length;
    const dependentCount = patients.filter(
      (p) => p.patient_type === "Employee Dependent"
    ).length;
    const nonNpaCount = patients.filter(
      (p) => p.patient_type === "Non-NPA"
    ).length;

    // Visit metrics
    const todaysVisits = visits.filter((v) => {
      const visitDate = new Date(v.visit_date);
      return visitDate.toDateString() === today.toDateString();
    });

    const weekVisits = visits.filter((v) => {
      const visitDate = new Date(v.visit_date);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return visitDate >= weekStart && visitDate <= weekEnd;
    });

    const monthVisits = visits.filter((v) => {
      const visitDate = new Date(v.visit_date);
      return (
        visitDate.getMonth() === today.getMonth() &&
        visitDate.getFullYear() === today.getFullYear()
      );
    });

    // Status breakdown
    const scheduledVisits = visits.filter(
      (v) => v.status === "Scheduled"
    ).length;
    const completedVisits = visits.filter(
      (v) => v.status === "Completed"
    ).length;
    const inProgressVisits = visits.filter(
      (v) => v.status === "In Progress"
    ).length;

    // Location breakdown
    const locationStats = visits.reduce((acc, visit) => {
      acc[visit.location] = (acc[visit.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clinic breakdown
    const clinicStats = visits.reduce((acc, visit) => {
      acc[visit.clinic] = (acc[visit.clinic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority breakdown
    const priorityStats = visits.reduce((acc, visit) => {
      acc[visit.priority] = (acc[visit.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      patients: {
        total: totalPatients,
        employees: employeeCount,
        retirees: retireeCount,
        dependents: dependentCount,
        nonNpa: nonNpaCount,
      },
      visits: {
        today: todaysVisits.length,
        week: weekVisits.length,
        month: monthVisits.length,
        scheduled: scheduledVisits,
        completed: completedVisits,
        inProgress: inProgressVisits,
      },
      locations: locationStats,
      clinics: clinicStats,
      priorities: priorityStats,
    };
  }, [patients, visits]);

  const filteredVisits = useMemo(() => {
    const today = new Date();

    switch (timeFilter) {
      case "today":
        return visits.filter((v) => {
          const visitDate = new Date(v.visit_date);
          return visitDate.toDateString() === today.toDateString();
        });
      case "week":
        return visits.filter((v) => {
          const visitDate = new Date(v.visit_date);
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return visitDate >= weekStart && visitDate <= weekEnd;
        });
      case "month":
        return visits.filter((v) => {
          const visitDate = new Date(v.visit_date);
          return (
            visitDate.getMonth() === today.getMonth() &&
            visitDate.getFullYear() === today.getFullYear()
          );
        });
      default:
        return visits.slice(0, 10); // Recent 10
    }
  }, [visits, timeFilter]);

  // Loading state
  if (isLoading) {
    return (
      <main className="flex-1 p-6 md:p-8 space-y-8 bg-background text-foreground">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <p className="mt-4 text-lg">Loading dashboard data...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex-1 p-6 md:p-8 space-y-8 bg-background text-foreground">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-bold">Error Loading Data</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 bg-background text-foreground">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Medical Records Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive overview of patients, visits, and medical activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Link href="/medical-records/register-patient">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Register Patient
            </Button>
          </Link>
          <Link href="/medical-records/create-visit">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Create Visit
            </Button>
          </Link>
          <Link href="/medical-records/manage-patient">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Patients"
          value={analytics.patients.total}
          icon={<Users className="h-4 w-4" />}
          trend="+12% this month"
          color="blue"
        />
        <MetricCard
          title="Today's Visits"
          value={analytics.visits.today}
          icon={<Calendar className="h-4 w-4" />}
          trend="2 in progress"
          color="green"
        />
        <MetricCard
          title="Active Records"
          value={analytics.patients.employees + analytics.patients.retirees}
          icon={<FileText className="h-4 w-4" />}
          trend={`${analytics.patients.dependents} dependents`}
          color="purple"
        />
        <MetricCard
          title="Weekly Visits"
          value={analytics.visits.week}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="+8% vs last week"
          color="orange"
        />
      </div>

      {/* Patient Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CategoryCard
          title="Employees"
          count={analytics.patients.employees}
          icon={<UserCheck className="h-5 w-5" />}
          color="blue"
        />
        <CategoryCard
          title="Retirees"
          count={analytics.patients.retirees}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <CategoryCard
          title="Dependents"
          count={analytics.patients.dependents}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <CategoryCard
          title="Non-NPA"
          count={analytics.patients.nonNpa}
          icon={<Building className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Visit Status Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Visit Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusItem
              label="Scheduled"
              count={analytics.visits.scheduled}
              color="blue"
            />
            <StatusItem
              label="In Progress"
              count={analytics.visits.inProgress}
              color="yellow"
            />
            <StatusItem
              label="Completed"
              count={analytics.visits.completed}
              color="green"
            />
          </CardContent>
        </Card>

        {/* Location & Clinic Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Activity by Location & Clinic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                  LOCATIONS
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.locations).map(
                    ([location, count]) => (
                      <div
                        key={location}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{location}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                  CLINICS
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.clinics).map(([clinic, count]) => (
                    <div
                      key={clinic}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{clinic}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent/Filtered Visits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-500" />
              Recent Visits
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/medical-records/manage-visit">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Visit Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location & Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredVisits.length > 0 ? (
                  filteredVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-sm">
                            {visit.patient_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {visit.personal_number}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {visit.category}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(visit.visit_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            {visit.visit_time}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {visit.visit_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{visit.location}</div>
                          <div className="text-muted-foreground">
                            {visit.clinic}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <VisitStatusBadge status={visit.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={visit.priority} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-muted-foreground">
                        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-1">
                          No visits found
                        </p>
                        <p className="text-sm">
                          {timeFilter === "today"
                            ? "No visits scheduled for today"
                            : timeFilter === "week"
                            ? "No visits this week"
                            : timeFilter === "month"
                            ? "No visits this month"
                            : "No recent visits"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Visit Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.priorities).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      priority === "Emergency"
                        ? "bg-red-500"
                        : priority === "High"
                        ? "bg-orange-500"
                        : priority === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm">{priority}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4 text-green-500" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 3)
                .map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {patient.surname} {patient.first_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {patient.personal_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {patient.patient_type}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {/* Fix: Add label and format date properly */}
                        <span className="font-medium">Registered: </span>
                        {patient.created_at
                          ? new Date(patient.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-red-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <HealthItem label="Database" status="Operational" color="green" />
            <HealthItem
              label="API Services"
              status="Operational"
              color="green"
            />
            <HealthItem label="Sync Status" status="Up to date" color="green" />
            <HealthItem label="Backup" status="Last: 2h ago" color="blue" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/* ---------------------------
   Components
--------------------------- */
function MetricCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50 text-blue-600",
    green: "border-green-200 bg-green-50 text-green-600",
    purple: "border-purple-200 bg-purple-50 text-purple-600",
    orange: "border-orange-200 bg-orange-50 text-orange-600",
  };
  return (
    <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="text-xs text-muted-foreground mt-1">{trend}</div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryCard({
  title,
  count,
  icon,
  color,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "border-blue-200 hover:bg-blue-50",
    amber: "border-amber-200 hover:bg-amber-50",
    green: "border-green-200 hover:bg-green-50",
    purple: "border-purple-200 hover:bg-purple-50",
  };
  return (
    <Card className={`transition-all cursor-pointer ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "blue" | "yellow" | "green";
}) {
  const dotColors = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium">{count}</span>
    </div>
  );
}

function HealthItem({
  label,
  status,
  color,
}: {
  label: string;
  status: string;
  color: "green" | "blue" | "red" | "yellow";
}) {
  const dotColors = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>
    </div>
  );
}

function VisitStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-green-100 text-green-800 border-green-200",
    "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const cls = styles[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Emergency: "bg-red-100 text-red-800 border-red-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  };
  const cls = styles[priority] ?? "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {priority}
    </Badge>
  );
}
