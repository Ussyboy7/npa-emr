"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar } from "lucide-react";
import { parseISO, isSameDay, format } from "date-fns";
import Link from "next/link";

/* ---------------------------
   Types
--------------------------- */
type Patient = {
  id: string;
  fullName: string;
  personalNumber: string;
  employeeCategory: string;
  dependents: number;
};

type Visit = {
  id: string;
  patientId: string;
  visitDate: string; // YYYY-MM-DD
  visitTime: string;
  clinic: string;
  category: string;
  status: "Completed" | "In Progress" | "Scheduled" | string;
};

/* ---------------------------
   Mock data
--------------------------- */
const mockPatients: Patient[] = [
  { id: "#80762", fullName: "Wendi Combs", personalNumber: "80762", employeeCategory: "Active", dependents: 1 },
  { id: "#82348", fullName: "Reba Fisher", personalNumber: "82348", employeeCategory: "Active", dependents: 1 },
  { id: "#82894", fullName: "Nick Morrow", personalNumber: "82894", employeeCategory: "Retired", dependents: 0 },
];

const recentVisits: Visit[] = [
  { id: "1", patientId: "#80762", visitDate: "2025-07-30", visitTime: "09:00 AM", clinic: "General Outpatient", category: "Employee", status: "Completed" },
  { id: "2", patientId: "#82348", visitDate: "2025-07-30", visitTime: "11:00 AM", clinic: "Dental", category: "Employee Dependent", status: "In Progress" },
  { id: "3", patientId: "#82894", visitDate: "2025-07-29", visitTime: "2:00 PM", clinic: "Eye Clinic", category: "Retiree", status: "Scheduled" },
];

/* ---------------------------
   Status Badge
--------------------------- */
function StatusBadge({ status }: { status: Visit["status"] }) {
  const styles: Record<string, string> = {
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    default: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const cls = styles[status] ?? styles.default;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cls}`}>
      {status}
    </span>
  );
}

/* ---------------------------
   Page
--------------------------- */
export default function MedicalDashboard() {
  const totalPatients = useMemo(() => mockPatients.length, []);
  const activePatients = useMemo(
    () => mockPatients.filter((p) => p.employeeCategory === "Active").length,
    []
  );
  const totalDependents = useMemo(
    () => mockPatients.reduce((sum, p) => sum + p.dependents, 0),
    []
  );

  const today = new Date();
  const todaysVisits = useMemo(
    () => recentVisits.filter((v) => isSameDay(parseISO(v.visitDate), today)).length,
    []
  );

  const recentVisitsSorted = useMemo(
    () => [...recentVisits].sort(
      (a, b) => parseISO(b.visitDate).getTime() - parseISO(a.visitDate).getTime()
    ),
    []
  );

  return (
    <main className="flex-1 p-6 md:p-8 space-y-6 bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Medical Records Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of patients, visits, and activities.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Patients" value={totalPatients} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <MetricCard title="Today's Visits" value={todaysVisits} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        <MetricCard title="Active Records" value={activePatients} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
        <MetricCard title="Dependents" value={totalDependents} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* Recent Visits */}
      <Card className="overflow-hidden bg-card text-card-foreground">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle className="text-lg font-semibold">Recent Visits</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                {["Patient", "Date", "Time", "Clinic", "Category", "Status"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {recentVisitsSorted.map((visit) => {
                const patient = mockPatients.find((p) => p.id === visit.patientId);
                const formattedDate = format(parseISO(visit.visitDate), "yyyy-MM-dd");

                return (
                  <tr key={visit.id} className="hover:bg-muted/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link href={`/medical/patient/${encodeURIComponent(patient?.id ?? "")}`} className="underline hover:no-underline">
                          {patient?.fullName ?? "Unknown"}
                        </Link>
                        <div className="text-sm text-muted-foreground">{patient?.personalNumber ?? ""}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formattedDate}</td>
                    <td className="px-6 py-4 text-sm">{visit.visitTime}</td>
                    <td className="px-6 py-4 text-sm">{visit.clinic}</td>
                    <td className="px-6 py-4 text-sm">{visit.category}</td>
                    <td className="px-6 py-4"><StatusBadge status={visit.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}

/* ---------------------------
   MetricCard
--------------------------- */
function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="bg-card text-card-foreground transition hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}