"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/lib/toast";
import { Download, FileText, Calendar, User, Heart, Activity, Edit, Phone, Mail, MapPin, Stethoscope, Plus, AlertCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Patient {
  id: string;
  patient_id: string;
  patient_type: "Employee" | "Retiree" | "NonNPA" | "Dependent";
  dependent_type?: "Employee Dependent" | "Retiree Dependent" | "";
  personal_number: string;
  title: string;
  surname: string;
  first_name: string;
  last_name: string;
  type?: string;
  division?: string;
  location?: string;
  marital_status: string;
  gender: string;
  date_of_birth: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  residential_address: string;
  state_of_residence: string;
  permanent_address: string;
  state_of_origin: string;
  local_government_area: string;
  blood_group: string;
  genotype: string;
  non_npa_type?: string;
  photo?: string;
  next_of_kin: {
    first_name: string;
    last_name: string;
    relationship: string;
    address: string;
    phone: string;
  };
  created_at: string;
  last_visit?: string;
}

interface VitalReading {
  id: string;
  patient: string;
  date: string;
  systolic?: number;
  diastolic?: number;
  heart_rate?: number;
  blood_sugar?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  recorded_by: string;
}

interface MedicalReport {
  id: string;
  patient: string;
  file_number: string;
  report_name: string;
  report_type: string;
  date: string;
  doctor: string;
  status: "completed" | "pending" | "cancelled";
  download_url?: string;
}

interface Visit {
  id: string;
  patient: string;
  patient_name: string;
  personal_number: string;
  visit_date: string;
  visit_time: string;
  visit_location: string;
  visit_type: string;
  clinic: string;
  priority: string;
  special_instructions: string;
  status: "Scheduled" | "Confirmed" | "In Progress" | "In Nursing Pool" | "Completed" | "Cancelled" | "Rescheduled";
  created_at: string;
  updated_at: string;
}

interface TimelineEvent {
  id: string;
  patient: string;
  date: string;
  time: string;
  type: "registration" | "nursing" | "consultation" | "laboratory" | "radiology" | "pharmacy" | "discharge" | "admission";
  title: string;
  description: string;
  location: string;
  staff: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  duration?: number;
  notes?: string;
  related_record_id?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const Loader = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />;

export default function PatientOverviewModalContent({ patientId }: { patientId: string }) {
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // Fetch patient data
        const patientRes = await fetch(`${API_URL}/api/patients/${patientId}/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!patientRes.ok) {
          const err = await patientRes.json().catch(() => ({}));
          if (patientRes.status === 404) {
            throw new Error("Patient not found");
          }
          throw new Error(err.detail || `Failed to fetch patient data (Status: ${patientRes.status})`);
        }
        
        const patientData = await patientRes.json();
        setPatient({
          id: patientData.id || "",
          patient_id: patientData.patient_id || "",
          patient_type: patientData.patient_type || "",
          dependent_type: patientData.dependent_type || "",
          personal_number: patientData.personal_number || "",
          title: patientData.title || "",
          surname: patientData.surname || "",
          first_name: patientData.first_name || "",
          last_name: patientData.last_name || "",
          type: patientData.type || "",
          division: patientData.division || "",
          location: patientData.location || "",
          marital_status: patientData.marital_status || "",
          gender: patientData.gender || "",
          date_of_birth: patientData.date_of_birth || "",
          age: patientData.age || 0,
          email: patientData.email || "",
          phone: patientData.phone || "",
          address: patientData.address || "",
          residential_address: patientData.residential_address || "",
          state_of_residence: patientData.state_of_residence || "",
          permanent_address: patientData.permanent_address || "",
          state_of_origin: patientData.state_of_origin || "",
          local_government_area: patientData.local_government_area || "",
          blood_group: patientData.blood_group || "",
          genotype: patientData.genotype || "",
          non_npa_type: patientData.non_npa_type || "",
          photo: patientData.photo_url || patientData.photo ? `${API_URL}${patientData.photo_url || patientData.photo}` : "",
          next_of_kin: {
            first_name: patientData.next_of_kin?.first_name || patientData.nok_first_name || "",
            last_name: patientData.next_of_kin?.last_name || patientData.nok_last_name || "",
            relationship: patientData.next_of_kin?.relationship || patientData.nok_relationship || "",
            address: patientData.next_of_kin?.address || patientData.nok_address || "",
            phone: patientData.next_of_kin?.phone || patientData.nok_phone || "",
          },
          created_at: patientData.created_at || "",
          last_visit: patientData.last_visit || "",
        });
        
        // Fetch vitals
        const vitalsRes = await fetch(`${API_URL}/api/patients/${patientId}/vitals/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!vitalsRes.ok) {
          if (vitalsRes.status === 404) {
            setVitals([]);
          } else {
            throw new Error(`Failed to fetch vitals (Status: ${vitalsRes.status})`);
          }
        } else {
          const vitalsData = await vitalsRes.json();
          setVitals(vitalsData);
        }
        
        // Mock reports data since the endpoint doesn't exist yet
        setReports([]);
        
        // Fetch visits
        const visitsRes = await fetch(`${API_URL}/api/patients/${patientId}/visits/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!visitsRes.ok) {
          if (visitsRes.status === 404) {
            setVisits([]);
          } else {
            throw new Error(`Failed to fetch visits (Status: ${visitsRes.status})`);
          }
        } else {
          const visitsData = await visitsRes.json();
          setVisits(visitsData);
        }
        
        // Mock timeline data since the endpoint doesn't exist yet
        setTimeline([]);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load patient data. Please try again.";
        setErrorMessage(errorMessage);
        setShowErrorDialog(true);
        console.error("Fetch patient data error:", err, err.stack);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId, toast]);

  const handleExportTimeline = () => {
    toast({ title: "Export Timeline", description: "Timeline export functionality to be implemented." });
  };

  const handleAddEvent = () => {
    toast({ title: "Add Event", description: "Add event functionality to be implemented." });
  };

  const handleRecordVitals = () => {
    toast({ title: "Record Vitals", description: "Record vitals functionality to be implemented." });
  };

  const handleScheduleVisit = async () => {
    try {
      const payload = {
        patient: patientId,
        visit_date: new Date().toISOString().split("T")[0],
        visit_time: "10:00:00",
        visit_location: "Bode Thomas Clinic",
        visit_type: "consultation",
        clinic: "General",
        priority: "Medium",
        special_instructions: "",
      };
      
      const res = await fetch(`${API_URL}/api/visits/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Failed to schedule visit (Status: ${res.status})`);
      }
      
      toast({ title: "Success", description: "Visit scheduled successfully." });
      
      // Refresh visits list
      const visitsRes = await fetch(`${API_URL}/api/patients/${patientId}/visits/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (visitsRes.ok) {
        const visitsData = await visitsRes.json();
        setVisits(visitsData);
      } else if (visitsRes.status === 404) {
        setVisits([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to schedule visit.";
      setErrorMessage(errorMessage);
      setShowErrorDialog(true);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleUploadReport = () => {
    toast({ title: "Upload Report", description: "Upload report functionality to be implemented." });
  };

  const handleEditContact = () => {
    toast({ title: "Edit Contact", description: "Edit contact functionality to be implemented." });
  };

  const handleEditVisit = (visitId: string) => {
    toast({ title: "Edit Visit", description: `Edit visit ${visitId} functionality to be implemented.` });
  };

  const handleEditReport = (reportId: string) => {
    toast({ title: "Edit Report", description: `Edit report ${reportId} functionality to be implemented.` });
  };

  const handleEditTimelineEvent = (eventId: string) => {
    toast({ title: "Edit Event", description: `Edit timeline event ${eventId} functionality to be implemented.` });
  };

  const handleViewRelatedRecord = (recordId: string) => {
    toast({ title: "View Record", description: `View record ${recordId} functionality to be implemented.` });
  };

  const getTimelineIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "registration": return <User className="h-4 w-4" />;
      case "nursing": return <Stethoscope className="h-4 w-4" />;
      case "consultation": return <User className="h-4 w-4" />;
      case "laboratory": return <Activity className="h-4 w-4" />;
      case "radiology": return <FileText className="h-4 w-4" />;
      case "pharmacy": return <Plus className="h-4 w-4" />;
      case "discharge": return <Calendar className="h-4 w-4" />;
      case "admission": return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "registration": return "bg-blue-100 text-blue-800 border-blue-200";
      case "nursing": return "bg-green-100 text-green-800 border-green-200";
      case "consultation": return "bg-purple-100 text-purple-800 border-purple-200";
      case "laboratory": return "bg-orange-100 text-orange-800 border-orange-200";
      case "radiology": return "bg-pink-100 text-pink-800 border-pink-200";
      case "pharmacy": return "bg-teal-100 text-teal-800 border-teal-200";
      case "discharge": return "bg-gray-100 text-gray-800 border-gray-200";
      case "admission": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-800";
      case "Confirmed": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-purple-100 text-purple-800";
      case "In Nursing Pool": return "bg-cyan-100 text-cyan-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Rescheduled": return "bg-orange-100 text-orange-800";
      case "No Show": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Employee": return "bg-blue-100 text-blue-800";
      case "Retiree": return "bg-purple-100 text-purple-800";
      case "NonNPA": return "bg-orange-100 text-orange-800";
      case "Dependent": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2" />
        <div className="text-lg">Loading patient data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {patient ? (
        <>
          {/* Patient Header Card */}
          <Card>
            <CardHeader className="rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <User className="h-6 w-6 text-blue-500" />
                  {patient.title} {patient.first_name} {patient.last_name} {patient.surname}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Badge className={getCategoryBadgeColor(patient.patient_type)}>
                    {patient.patient_type}
                    {patient.non_npa_type ? ` (${patient.non_npa_type})` : ""}
                    {patient.dependent_type ? ` (${patient.dependent_type})` : ""}
                  </Badge>
                  <div className="text-sm font-semibold">
                    Patient ID: {patient.patient_id}
                  </div>
                  {patient.photo && (
                    <img
                      src={patient.photo}
                      alt={`${patient.first_name} ${patient.surname}`}
                      className="w-20 h-20 rounded object-cover"
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold">{patient.patient_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Age / Gender</p>
                  <p className="font-semibold">{patient.age} years / {patient.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <Badge variant="outline">{patient.blood_group || "Not provided"}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Genotype</p>
                  <Badge variant="outline">{patient.genotype || "Not provided"}</Badge>
                </div>
                {patient.type && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Employee Type</p>
                    <p className="font-semibold">{patient.type}</p>
                  </div>
                )}
                {patient.division && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Division</p>
                    <p className="font-semibold">{patient.division}</p>
                  </div>
                )}
                {patient.location && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{patient.location}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Marital Status</p>
                  <p className="font-semibold">{patient.marital_status || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-semibold">{new Date(patient.created_at).toLocaleDateString()}</p>
                </div>
                {patient.last_visit && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Visit</p>
                    <p className="font-semibold">{new Date(patient.last_visit).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="visits">Visits</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {vitals.length > 0 && (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          Blood Pressure
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {vitals[vitals.length - 1].systolic}/{vitals[vitals.length - 1].diastolic}
                        </div>
                        <p className="text-xs text-muted-foreground">mmHg</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          Heart Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{vitals[vitals.length - 1].heart_rate}</div>
                        <p className="text-xs text-muted-foreground">BPM</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Blood Sugar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{vitals[vitals.length - 1].blood_sugar}</div>
                        <p className="text-xs text-muted-foreground">mg/dL</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-purple-500" />
                          Weight
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{vitals[vitals.length - 1].weight}</div>
                        <p className="text-xs text-muted-foreground">kg</p>
                      </CardContent>
                    </Card>
                  </>
                )}
                <div className="flex justify-end">
                  <Button className="bg-gray-900 hover:bg-gray-900 text-white" onClick={handleRecordVitals}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Vitals
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Last Visit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {visits.length > 0 && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Clinic</p>
                            <p className="font-medium">{visits[0].clinic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                              {new Date(visits[0].visit_date).toLocaleDateString()} {visits[0].visit_time}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-medium">{visits[0].visit_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Priority</p>
                            <Badge className={visits[0].priority === "Emergency" ? "bg-red-100 text-red-800" : visits[0].priority === "High" ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"}>
                              {visits[0].priority}
                            </Badge>
                          </div>
                        </div>
                        {visits[0].special_instructions && (
                          <div>
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-sm">{visits[0].special_instructions}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Recent Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reports.length > 0 ? (
                        reports.slice(0, 3).map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{report.report_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {report.report_type} • {new Date(report.date).toLocaleDateString()}
                              </p>
                              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                            </div>
                            <div className="flex gap-2">
                              {report.download_url && report.status === "completed" && (
                                <Button size="sm" variant="outline" onClick={() => window.open(report.download_url, "_blank")}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleEditReport(report.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No reports available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Patient Journey Timeline
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleExportTimeline}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Timeline
                      </Button>
                      <Button className="bg-gray-900 hover:bg-gray-900 text-white" size="sm" onClick={handleAddEvent}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mr-4">Legend:</div>
                    {[
                      { type: "registration", label: "Registration" },
                      { type: "nursing", label: "Nursing" },
                      { type: "consultation", label: "Consultation" },
                      { type: "laboratory", label: "Laboratory" },
                      { type: "radiology", label: "Radiology" },
                      { type: "pharmacy", label: "Pharmacy" },
                      { type: "discharge", label: "Discharge" },
                      { type: "admission", label: "Admission" },
                    ].map((item) => (
                      <div
                        key={item.type}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTimelineColor(item.type as TimelineEvent["type"])}`}
                      >
                        {getTimelineIcon(item.type as TimelineEvent["type"])}
                        {item.label}
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative mt-6">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                      {timeline.length > 0 ? (
                        timeline
                          .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
                          .map((event) => (
                            <div key={event.id} className="relative flex items-start gap-4">
                              <div
                                className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center ${getTimelineColor(event.type)}`}
                              >
                                {getTimelineIcon(event.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Card className={`${event.status === "pending" ? "border-dashed" : ""}`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                        {event.status === "pending" && (
                                          <Badge variant="outline" className="text-xs">
                                            Scheduled
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Date & Time</p>
                                        <p className="font-medium">
                                          {new Date(event.date).toLocaleDateString()} at {event.time}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Location</p>
                                        <p className="font-medium">{event.location}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Staff</p>
                                        <p className="font-medium">{event.staff}</p>
                                      </div>
                                      {event.duration && (
                                        <div>
                                          <p className="text-muted-foreground">Duration</p>
                                          <p className="font-medium">{formatDuration(event.duration)}</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {event.notes && (
                                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                                        <p className="text-sm">{event.notes}</p>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center gap-2">
                                        {event.related_record_id && (
                                          <Badge variant="outline" className="text-xs">
                                            ID: {event.related_record_id}
                                          </Badge>
                                        )}
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTimelineColor(event.type)}`}
                                        >
                                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditTimelineEvent(event.id)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        {event.related_record_id && (
                                          <Button variant="outline" size="sm" onClick={() => handleViewRelatedRecord(event.related_record_id!)}>
                                            <FileText className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No timeline events available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Timeline Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {timeline.filter((e) => e.status === "completed").length}
                          </div>
                          <div className="text-sm text-muted-foreground">Completed Events</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {timeline.filter((e) => e.status === "pending").length}
                          </div>
                          <div className="text-sm text-muted-foreground">Pending Events</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {timeline.filter((e) => e.type === "consultation").length}
                          </div>
                          <div className="text-sm text-muted-foreground">Consultations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(timeline.filter((e) => e.duration).reduce((acc, e) => acc + (e.duration || 0), 0) / 60 * 10) / 10}h
                          </div>
                          <div className="text-sm text-muted-foreground">Total Time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="visits" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Visit History
                    </CardTitle>
                    <Button className="bg-gray-900 hover:bg-gray-900 text-white" onClick={handleScheduleVisit}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Visit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visits.length > 0 ? (
                      visits.map((visit) => (
                        <div key={visit.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{visit.clinic}</h3>
                                <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Date & Time</p>
                                  <p>
                                    {new Date(visit.visit_date).toLocaleDateString()} at {visit.visit_time}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Type</p>
                                  <p>{visit.visit_type}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Priority</p>
                                  <Badge className={visit.priority === "Emergency" ? "bg-red-100 text-red-800" : visit.priority === "High" ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"}>
                                    {visit.priority}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Location</p>
                                  <p>{visit.visit_location}</p>
                                </div>
                                {visit.special_instructions && (
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Notes</p>
                                    <p>{visit.special_instructions}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEditVisit(visit.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No visits available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Medical Reports
                    </CardTitle>
                    <Button className="bg-gray-900 hover:bg-gray-900 text-white" onClick={handleUploadReport}>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{report.report_name}</h4>
                              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>File: {report.file_number}</div>
                              <div>Type: {report.report_type}</div>
                              <div>Date: {new Date(report.date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Doctor: {report.doctor}</div>
                          </div>
                          <div className="flex gap-2">
                            {report.download_url && report.status === "completed" && (
                              <Button size="sm" variant="outline" onClick={() => window.open(report.download_url, "_blank")}>
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEditReport(report.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No reports available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{patient.email || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{patient.phone || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Residential Address</p>
                          <p className="font-medium">{patient.residential_address || "Not provided"}</p>
                          <p className="text-sm text-muted-foreground">{patient.state_of_residence || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Permanent Address</p>
                          <p className="font-medium">{patient.permanent_address || "Not provided"}</p>
                          <p className="text-sm text-muted-foreground">{patient.state_of_origin || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Local Government Area</p>
                          <p className="font-medium">{patient.local_government_area || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Next of Kin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {patient.next_of_kin.first_name} {patient.next_of_kin.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium">{patient.next_of_kin.relationship || "Not provided"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{patient.next_of_kin.phone || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{patient.next_of_kin.address || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Error</AlertDialogTitle>
                <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => setShowErrorDialog(false)}
                  className="bg-gray-900 hover:bg-gray-900 text-white"
                >
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No patient data available.
        </div>
      )}
    </div>
  );
}