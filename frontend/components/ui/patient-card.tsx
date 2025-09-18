// components/ui/patient-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, Calendar, Clock } from "lucide-react";
import { Patient } from "@/types/types";

interface patientCardProps {
  patient: Patient;
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patientId: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export default function patientCard({ 
  patient, 
  onView, 
  onEdit, 
  onDelete, 
  actions,
  className = "" 
}: patientCardProps) {
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Employee": return "bg-blue-100 text-blue-800";
      case "Retiree": return "bg-purple-100 text-purple-800";
      case "NonNPA": return "bg-orange-100 text-orange-800";
      case "Dependent": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`hover:shadow-md transition-all ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-3">
                <User className="h-5 w-5 text-blue-500" />
                <span>{patient.name}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  ID: {patient.id}
                </span>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-4 text-xs">
                  <span>
                    <strong>Personal Number:</strong> {patient.personalNumber || "N/A"}
                  </span>
                  <span>
                    <strong>Category:</strong> {patient.employeeCategory}
                    {patient.non_npa_type ? ` (${patient.non_npa_type})` : ""}
                  </span>
                  <span>
                    <strong>Gender:</strong> {patient.gender || "N/A"}
                  </span>
                  <span>
                    <strong>Age:</strong> {patient.age || 0} yrs
                  </span>
                </div>
                <div className="text-xs">
                  <strong>Phone:</strong> {patient.phoneNumber || "N/A"}
                  {patient.emergencyContact && (
                    <span className="ml-4">
                      <strong>Emergency:</strong> {patient.emergencyContact}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge className={getCategoryBadgeColor(patient.employeeCategory)} variant="outline">
              {patient.employeeCategory}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Blood Group:</strong> {patient.blood_group || "N/A"}
          </div>
          <div>
            <strong>Genotype:</strong> {patient.genotype || "N/A"}
          </div>
          <div>
            <strong>Registered:</strong> {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
          </div>
          {patient.last_visit && (
            <div>
              <strong>Last Visit:</strong> {new Date(patient.last_visit).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          {onView && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onView(patient)}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(patient)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(patient.id)}
            >
              Delete
            </Button>
          )}
          {actions}
        </div>
      </CardContent>
    </Card>
  );
}