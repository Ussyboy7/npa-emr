// components/medical-records/visitoverviewmodal.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VisitOverviewModalContentProps {
  visitId: string;
}

export default function VisitOverviewModalContent({ visitId }: VisitOverviewModalContentProps) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/visits/${visitId}/`,
          {
            method: "GET",
            // No Authorization header for testing
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch visit details");
        }
        const data = await res.json();
        setVisit({
          id: data.id,
          patient_id: data.patient,
          patient_name: data.patient_name,
          personal_number: data.personal_number || "",
          visit_date: data.visit_date,
          visit_time: data.visit_time,
          visit_location: data.visit_location,
          visit_type: data.visit_type,
          clinic: data.clinic,
          priority: data.priority,
          created_at: data.created_at,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisit();
  }, [visitId]);

  if (isLoading) return <div>Loading...</div>;
  if (!visit) return <div>Visit not found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Visit ID:</strong> {visit.id}</p>
        <p><strong>Patient Name:</strong> {visit.patient_name}</p>
        <p><strong>Personal Number:</strong> {visit.personal_number}</p>
        <p><strong>Date/Time:</strong> {formatDate(visit.visit_date)} {formatTime(visit.visit_time)}</p>
        <p><strong>Location:</strong> {visit.visit_location}</p>
        <p><strong>Visit Type:</strong> {visitTypes.find((t) => t.value === visit.visit_type)?.label || visit.visit_type}</p>
        <p><strong>Clinic:</strong> {visit.clinic}</p>
        <p><strong>Priority:</strong> {visit.priority}</p>
      </CardContent>
    </Card>
  );
}