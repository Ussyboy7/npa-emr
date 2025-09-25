"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  FileText,
  Calendar,
  User,
  Heart,
  Activity,
  Edit,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Plus,
  AlertCircle,
  Clock,
  Upload,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/toast";
import { locations, clinics } from "@/lib/constants";

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
  status:
    | "Scheduled"
    | "Confirmed"
    | "In Progress"
    | "In Nursing Pool"
    | "Completed"
    | "Cancelled"
    | "Rescheduled";
  created_at: string;
  updated_at: string;
}

interface TimelineEvent {
  id: string;
  patient: string;
  date: string;
  time: string;
  type:
    | "registration"
    | "nursing"
    | "consultation"
    | "laboratory"
    | "radiology"
    | "pharmacy"
    | "discharge"
    | "admission";
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
const Loader = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
);

export default function PatientOverviewModalContent({
  patientId,
}: {
  patientId: string;
}) {
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    visit_date: "",
    visit_time: "",
    visit_location: "Bode Thomas Clinic",
    visit_type: "consultation",
    clinic: "General",
    priority: "Medium",
    special_instructions: "",
  });

  const [uploadForm, setUploadForm] = useState({
    report_name: "",
    report_type: "Blood Test",
    doctor: "",
    file: null as File | null,
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "consultation" as TimelineEvent["type"],
    location: "",
    staff: "",
    duration: "",
    notes: "",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // Fetch patient data
        const patientRes = await fetch(
          `${API_URL}/api/patients/${patientId}/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!patientRes.ok) {
          const err = await patientRes.json().catch(() => ({}));
          if (patientRes.status === 404) {
            throw new Error("Patient not found");
          }
          throw new Error(
            err.detail ||
              `Failed to fetch patient data (Status: ${patientRes.status})`
          );
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
          photo:
            patientData.photo_url || patientData.photo
              ? `${API_URL}${patientData.photo_url || patientData.photo}`
              : "",
          next_of_kin: {
            first_name:
              patientData.next_of_kin?.first_name ||
              patientData.nok_first_name ||
              "",
            last_name:
              patientData.next_of_kin?.last_name ||
              patientData.nok_last_name ||
              "",
            relationship:
              patientData.next_of_kin?.relationship ||
              patientData.nok_relationship ||
              "",
            address:
              patientData.next_of_kin?.address || patientData.nok_address || "",
            phone:
              patientData.next_of_kin?.phone || patientData.nok_phone || "",
          },
          created_at: patientData.created_at || "",
          last_visit: patientData.last_visit || "",
        });

        // Fetch vitals
        const vitalsRes = await fetch(
          `${API_URL}/api/patients/${patientId}/vitals/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!vitalsRes.ok) {
          if (vitalsRes.status === 404) {
            setVitals([]);
          } else {
            throw new Error(
              `Failed to fetch vitals (Status: ${vitalsRes.status})`
            );
          }
        } else {
          const vitalsData = await vitalsRes.json();
          setVitals(vitalsData);
        }

        // Mock reports data since the endpoint doesn't exist yet
        setReports([]);

        // Fetch visits
        const visitsRes = await fetch(
          `${API_URL}/api/patients/${patientId}/visits/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!visitsRes.ok) {
          if (visitsRes.status === 404) {
            setVisits([]);
          } else {
            throw new Error(
              `Failed to fetch visits (Status: ${visitsRes.status})`
            );
          }
        } else {
          const visitsData = await visitsRes.json();
          setVisits(visitsData);
        }

        // Mock timeline data since the endpoint doesn't exist yet
        setTimeline([]);
      } catch (err: any) {
        const errorMessage =
          err.message || "Failed to load patient data. Please try again.";
        setErrorMessage(errorMessage);
        setShowErrorDialog(true);
        console.error("Fetch patient data error:", err, err.stack);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, toast]);

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  };

  const handleScheduleVisit = () => {
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setScheduleForm((prev) => ({ ...prev, visit_date: today }));
    setShowScheduleModal(true);
  };

  const handleUploadReport = () => {
    setShowUploadModal(true);
  };

  const validateScheduleForm = () => {
    const errors: Record<string, string> = {};

    if (!scheduleForm.visit_date) {
      errors.visit_date = "Visit date is required";
    } else {
      const selectedDate = new Date(scheduleForm.visit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.visit_date = "Visit date cannot be in the past";
      }
    }

    if (!scheduleForm.visit_time) {
      errors.visit_time = "Visit time is required";
    }

    if (!scheduleForm.visit_location) {
      errors.visit_location = "Location is required";
    }

    if (!scheduleForm.visit_type) {
      errors.visit_type = "Visit type is required";
    }

    if (!scheduleForm.clinic) {
      errors.clinic = "Clinic is required";
    }

    if (!scheduleForm.priority) {
      errors.priority = "Priority is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitSchedule = async () => {
    if (!validateScheduleForm()) {
      return;
    }

    try {
      const payload = {
        patient: patientId,
        ...scheduleForm,
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
        throw new Error(
          err.detail || `Failed to schedule visit (Status: ${res.status})`
        );
      }

      toast({ title: "Success", description: "Visit scheduled successfully." });
      setShowScheduleModal(false);

      // Reset form
      setScheduleForm({
        visit_date: "",
        visit_time: "",
        visit_location: "Bode Thomas Clinic",
        visit_type: "consultation",
        clinic: "General",
        priority: "Medium",
        special_instructions: "",
      });
      setFormErrors({});

      // Refresh visits list
      const visitsRes = await fetch(
        `${API_URL}/api/patients/${patientId}/visits/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (visitsRes.ok) {
        const visitsData = await visitsRes.json();
        setVisits(visitsData);
      } else if (visitsRes.status === 404) {
        setVisits([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to schedule visit.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubmitUpload = async () => {
    try {
      if (!uploadForm.file) {
        toast({
          title: "Error",
          description: "Please select a file to upload.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("patient", patientId);
      formData.append("report_name", uploadForm.report_name);
      formData.append("report_type", uploadForm.report_type);
      formData.append("doctor", uploadForm.doctor);
      formData.append("file", uploadForm.file);
      formData.append("file_number", `RPT-${Date.now()}`);
      formData.append("date", new Date().toISOString().split("T")[0]);
      formData.append("status", "pending");

      // Since we don't have a real endpoint, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({ title: "Success", description: "Report uploaded successfully." });
      setShowUploadModal(false);

      // Reset form
      setUploadForm({
        report_name: "",
        report_type: "Blood Test",
        doctor: "",
        file: null,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload report.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubmitEvent = async () => {
    try {
      const newEvent: TimelineEvent = {
        id: `event-${Date.now()}`,
        patient: patientId,
        date: eventForm.date,
        time: eventForm.time,
        type: eventForm.type,
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        staff: eventForm.staff,
        status: "pending",
        duration: eventForm.duration ? parseInt(eventForm.duration) : undefined,
        notes: eventForm.notes,
      };

      // Since we don't have a real endpoint, we'll just add to local state
      setTimeline((prev) => [newEvent, ...prev]);

      toast({
        title: "Success",
        description: "Timeline event added successfully.",
      });
      setShowAddEventModal(false);

      // Reset form
      setEventForm({
        title: "",
        description: "",
        date: "",
        time: "",
        type: "consultation",
        location: "",
        staff: "",
        duration: "",
        notes: "",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add event.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditReport = (reportId: string) => {
    toast({
      title: "Edit Report",
      description: `Edit report ${reportId} functionality to be implemented.`,
    });
  };

  const handleViewRelatedRecord = (recordId: string) => {
    toast({
      title: "View Record",
      description: `View record ${recordId} functionality to be implemented.`,
    });
  };

  const getTimelineIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "registration":
        return <User className="h-4 w-4" />;
      case "nursing":
        return <Stethoscope className="h-4 w-4" />;
      case "consultation":
        return <User className="h-4 w-4" />;
      case "laboratory":
        return <Activity className="h-4 w-4" />;
      case "radiology":
        return <FileText className="h-4 w-4" />;
      case "pharmacy":
        return <Plus className="h-4 w-4" />;
      case "discharge":
        return <Calendar className="h-4 w-4" />;
      case "admission":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "registration":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "nursing":
        return "bg-green-100 text-green-800 border-green-200";
      case "consultation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "laboratory":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "radiology":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "pharmacy":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "discharge":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "admission":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "In Nursing Pool":
        return "bg-cyan-100 text-cyan-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Rescheduled":
        return "bg-orange-100 text-orange-800";
      case "No Show":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Employee":
        return "bg-blue-100 text-blue-800";
      case "Retiree":
        return "bg-purple-100 text-purple-800";
      case "NonNPA":
        return "bg-orange-100 text-orange-800";
      case "Dependent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                  {patient.title} {patient.first_name} {patient.last_name}{" "}
                  {patient.surname}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Badge
                    className={getCategoryBadgeColor(patient.patient_type)}
                  >
                    {patient.patient_type}
                    {patient.non_npa_type ? ` (${patient.non_npa_type})` : ""}
                    {patient.dependent_type
                      ? ` (${patient.dependent_type})`
                      : ""}
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
                  <p className="font-semibold">
                    {patient.age} years / {patient.gender}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <Badge variant="outline">
                    {patient.blood_group || "Not provided"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Genotype</p>
                  <Badge variant="outline">
                    {patient.genotype || "Not provided"}
                  </Badge>
                </div>
                {patient.type && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Employee Type
                    </p>
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
                  <p className="text-sm text-muted-foreground">
                    Marital Status
                  </p>
                  <p className="font-semibold">
                    {patient.marital_status || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-semibold">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                </div>
                {patient.last_visit && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Visit</p>
                    <p className="font-semibold">
                      {new Date(patient.last_visit).toLocaleDateString()}
                    </p>
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
                          {vitals[vitals.length - 1].systolic}/
                          {vitals[vitals.length - 1].diastolic}
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
                        <div className="text-2xl font-bold">
                          {vitals[vitals.length - 1].heart_rate}
                        </div>
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
                        <div className="text-2xl font-bold">
                          {vitals[vitals.length - 1].blood_sugar}
                        </div>
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
                        <div className="text-2xl font-bold">
                          {vitals[vitals.length - 1].weight}
                        </div>
                        <p className="text-xs text-muted-foreground">kg</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {report.report_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {report.report_type} •{" "}
                                {new Date(report.date).toLocaleDateString()}
                              </p>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {report.download_url &&
                                report.status === "completed" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(report.download_url, "_blank")
                                    }
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditReport(report.id)}
                              >
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
                            <p className="text-sm text-muted-foreground">
                              Clinic
                            </p>
                            <p className="font-medium">{visits[0].clinic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date & Time
                            </p>
                            <p className="font-medium">
                              {new Date(
                                visits[0].visit_date
                              ).toLocaleDateString()}{" "}
                              {visits[0].visit_time}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Type
                            </p>
                            <p className="font-medium">
                              {visits[0].visit_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Priority
                            </p>
                            <Badge
                              className={
                                visits[0].priority === "Emergency"
                                  ? "bg-red-100 text-red-800"
                                  : visits[0].priority === "High"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {visits[0].priority}
                            </Badge>
                          </div>
                        </div>
                        {visits[0].special_instructions && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Notes
                            </p>
                            <p className="text-sm">
                              {visits[0].special_instructions}
                            </p>
                          </div>
                        )}
                      </>
                    )}
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
                      <Button
                        className="bg-gray-900 hover:bg-gray-900 text-white"
                        size="sm"
                        onClick={handleAddEvent}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mr-4">
                      Legend:
                    </div>
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
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTimelineColor(
                          item.type as TimelineEvent["type"]
                        )}`}
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
                          .sort(
                            (a, b) =>
                              new Date(`${b.date} ${b.time}`).getTime() -
                              new Date(`${a.date} ${a.time}`).getTime()
                          )
                          .map((event) => (
                            <div
                              key={event.id}
                              className="relative flex items-start gap-4"
                            >
                              <div
                                className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center ${getTimelineColor(
                                  event.type
                                )}`}
                              >
                                {getTimelineIcon(event.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Card
                                  className={`${
                                    event.status === "pending"
                                      ? "border-dashed"
                                      : ""
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-lg">
                                          {event.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {event.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          className={getStatusColor(
                                            event.status
                                          )}
                                        >
                                          {event.status}
                                        </Badge>
                                        {event.status === "pending" && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Scheduled
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">
                                          Date & Time
                                        </p>
                                        <p className="font-medium">
                                          {new Date(
                                            event.date
                                          ).toLocaleDateString()}{" "}
                                          at {event.time}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">
                                          Location
                                        </p>
                                        <p className="font-medium">
                                          {event.location}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">
                                          Staff
                                        </p>
                                        <p className="font-medium">
                                          {event.staff}
                                        </p>
                                      </div>
                                      {event.duration && (
                                        <div>
                                          <p className="text-muted-foreground">
                                            Duration
                                          </p>
                                          <p className="font-medium">
                                            {formatDuration(event.duration)}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {event.notes && (
                                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                          Notes:
                                        </p>
                                        <p className="text-sm">{event.notes}</p>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center gap-2">
                                        {event.related_record_id && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            ID: {event.related_record_id}
                                          </Badge>
                                        )}
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTimelineColor(
                                            event.type
                                          )}`}
                                        >
                                          {event.type.charAt(0).toUpperCase() +
                                            event.type.slice(1)}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        {event.related_record_id && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleViewRelatedRecord(
                                                event.related_record_id!
                                              )
                                            }
                                          >
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
                      <CardTitle className="text-lg">
                        Timeline Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {
                              timeline.filter((e) => e.status === "completed")
                                .length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Completed Events
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {
                              timeline.filter((e) => e.status === "pending")
                                .length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pending Events
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {
                              timeline.filter((e) => e.type === "consultation")
                                .length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Consultations
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(
                              (timeline
                                .filter((e) => e.duration)
                                .reduce(
                                  (acc, e) => acc + (e.duration || 0),
                                  0
                                ) /
                                60) *
                                10
                            ) / 10}
                            h
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Time
                          </div>
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
                    <Button
                      className="bg-gray-900 hover:bg-gray-900 text-white"
                      onClick={handleScheduleVisit}
                    >
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
                                <h3 className="font-semibold">
                                  {visit.clinic}
                                </h3>
                                <Badge className={getStatusColor(visit.status)}>
                                  {visit.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">
                                    Date & Time
                                  </p>
                                  <p>
                                    {new Date(
                                      visit.visit_date
                                    ).toLocaleDateString()}{" "}
                                    at {visit.visit_time}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Type</p>
                                  <p>{visit.visit_type}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Priority
                                  </p>
                                  <Badge
                                    className={
                                      visit.priority === "Emergency"
                                        ? "bg-red-100 text-red-800"
                                        : visit.priority === "High"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }
                                  >
                                    {visit.priority}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Location
                                  </p>
                                  <p>{visit.visit_location}</p>
                                </div>
                                {visit.special_instructions && (
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">
                                      Notes
                                    </p>
                                    <p>{visit.special_instructions}</p>
                                  </div>
                                )}
                              </div>
                            </div>
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
                    <Button
                      className="bg-gray-900 hover:bg-gray-900 text-white"
                      onClick={handleUploadReport}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {report.report_name}
                              </h4>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>File: {report.file_number}</div>
                              <div>Type: {report.report_type}</div>
                              <div>
                                Date:{" "}
                                {new Date(report.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Doctor: {report.doctor}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {report.download_url &&
                              report.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(report.download_url, "_blank")
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditReport(report.id)}
                            >
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
                          <p className="font-medium">
                            {patient.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {patient.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Residential Address
                          </p>
                          <p className="font-medium">
                            {patient.residential_address || "Not provided"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.state_of_residence || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Permanent Address
                          </p>
                          <p className="font-medium">
                            {patient.permanent_address || "Not provided"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.state_of_origin || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Local Government Area
                          </p>
                          <p className="font-medium">
                            {patient.local_government_area || "Not provided"}
                          </p>
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
                        {patient.next_of_kin.first_name}{" "}
                        {patient.next_of_kin.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Relationship
                      </p>
                      <p className="font-medium">
                        {patient.next_of_kin.relationship || "Not provided"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {patient.next_of_kin.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {patient.next_of_kin.address || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Schedule Visit Modal */}
          <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Schedule New Visit
                </DialogTitle>
                <DialogDescription>
                  Schedule a new visit for {patient.first_name}{" "}
                  {patient.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit_date">Visit Date *</Label>
                    <Input
                      id="visit_date"
                      type="date"
                      value={scheduleForm.visit_date}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          visit_date: e.target.value,
                        }))
                      }
                      className={formErrors.visit_date ? "border-red-500" : ""}
                    />
                    {formErrors.visit_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="visit_time">Visit Time *</Label>
                    <Input
                      id="visit_time"
                      type="time"
                      value={scheduleForm.visit_time}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          visit_time: e.target.value,
                        }))
                      }
                      className={formErrors.visit_time ? "border-red-500" : ""}
                    />
                    {formErrors.visit_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_time}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit_location">Location *</Label>
                    <Select
                      value={scheduleForm.visit_location}
                      onValueChange={(value) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          visit_location: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        className={
                          formErrors.visit_location ? "border-red-500" : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {loc}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.visit_location && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_location}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="clinic">Clinic *</Label>
                    <Select
                      value={scheduleForm.clinic}
                      onValueChange={(value) =>
                        setScheduleForm((prev) => ({ ...prev, clinic: value }))
                      }
                    >
                      <SelectTrigger
                        className={formErrors.clinic ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic} value={clinic}>
                            {clinic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.clinic && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.clinic}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit_type">Visit Type *</Label>
                    <Select
                      value={scheduleForm.visit_type}
                      onValueChange={(value) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          visit_type: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        className={
                          formErrors.visit_type ? "border-red-500" : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="routine">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.visit_type && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visit_type}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={scheduleForm.priority}
                      onValueChange={(value) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        className={formErrors.priority ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.priority && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.priority}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="special_instructions">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="special_instructions"
                    placeholder="Any special instructions or notes for this visit..."
                    value={scheduleForm.special_instructions}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        special_instructions: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitSchedule}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Schedule Visit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Upload Report Modal */}
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-500" />
                  Upload Medical Report
                </DialogTitle>
                <DialogDescription>
                  Upload a new medical report for {patient.first_name}{" "}
                  {patient.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    placeholder="Enter report name"
                    value={uploadForm.report_name}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        report_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select
                    value={uploadForm.report_type}
                    onValueChange={(value) =>
                      setUploadForm((prev) => ({ ...prev, report_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="CT Scan">CT Scan</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="ECG">ECG</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input
                    id="doctor"
                    placeholder="Enter doctor's name"
                    value={uploadForm.doctor}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        doctor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="file">Report File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setUploadForm((prev) => ({ ...prev, file }));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitUpload}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Upload Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Event Modal */}
          <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-500" />
                  Add Timeline Event
                </DialogTitle>
                <DialogDescription>
                  Add a new event to {patient.first_name} {patient.last_name}'s
                  timeline
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter event description"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      value={eventForm.type}
                      onValueChange={(value) =>
                        setEventForm((prev) => ({
                          ...prev,
                          type: value as TimelineEvent["type"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">
                          Registration
                        </SelectItem>
                        <SelectItem value="nursing">Nursing</SelectItem>
                        <SelectItem value="consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="discharge">Discharge</SelectItem>
                        <SelectItem value="admission">Admission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={eventForm.location}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staff">Staff</Label>
                    <Input
                      id="staff"
                      placeholder="Enter staff name"
                      value={eventForm.staff}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          staff: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="Enter duration in minutes"
                      value={eventForm.duration}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the event"
                    value={eventForm.notes}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddEventModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEvent}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
