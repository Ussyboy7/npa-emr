"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin } from "lucide-react";
import { useToast } from "@/lib/toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Import constants to ensure consistency with other components
const visitTypes = [
  { value: "consultation", label: "Consultation"},
  { value: "follow-up", label: "Follow-up"},
  { value: "emergency", label: "Emergency"},
  { value: "routine-checkup", label: "Routine Checkup"},
  { value: "vaccination", label: "Vaccination"},
];

const clinics = ["General", "Physiotherapy", "Eye", "Sickle Cell", "Dental", "Cardiology"];

const priorities = ["Low", "Medium", "High", "Emergency"];
const locations = [
  "Bode Thomas Clinic", 
  "Headquarters", 
  "Tincan", 
  "LPC", 
  "Rivers Port Complex",
  "Onne Port Complex",
  "Delta Port Complex",
  "Calabar Port",
  "Lekki Deep Sea Port"
];

// Define the VisitStatus type to match all components
type VisitStatus = 
  | "Scheduled" 
  | "Confirmed" 
  | "In Progress" 
  | "In Nursing Pool"  // Added this status
  | "Completed" 
  | "Cancelled" 
  | "Rescheduled";

interface Visit {
  id: string;
  patient: string;
  patient_name: string;
  personal_number: string;
  clinic: string;
  visit_time: string;
  visit_date: string;
  visit_type: string;
  visit_location: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: VisitStatus; // Updated to use the VisitStatus type
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  assigned_nurse?: string; // Added this field
  nursing_received_at?: string; // Added this field
}

interface VisitFormData {
  visit_date: string;
  visit_time: string;
  visit_location: string;
  visit_type: string;
  clinic: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  special_instructions: string;
  status: VisitStatus; // Added this field
}

interface EditVisitModalProps {
  open: boolean;
  onClose: () => void;
  visit: Visit | null;
  patientId: string;
  patientName: string;
  onSave: (visit: Visit) => void;
}

export default function EditVisitModal({ open, onClose, visit, patientId, patientName, onSave }: EditVisitModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<VisitFormData>({
    visit_date: "",
    visit_time: "",
    visit_location: "",
    visit_type: "",
    clinic: "",
    priority: "Medium",
    special_instructions: "",
    status: "Scheduled", // Added this field with default value
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    if (visit) {
      setFormData({
        visit_date: visit.visit_date,
        visit_time: visit.visit_time,
        visit_location: visit.visit_location,
        visit_type: visit.visit_type,
        clinic: visit.clinic,
        priority: visit.priority,
        special_instructions: visit.special_instructions || "",
        status: visit.status, // Use the status from visit
      });
    } else {
      setFormData({
        visit_date: "",
        visit_time: "",
        visit_location: "",
        visit_type: "",
        clinic: "",
        priority: "Medium",
        special_instructions: "",
        status: "Scheduled", // Added this field with default value
      });
    }
  }, [visit]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.visit_date) errors.visit_date = "Visit date is required";
    if (!formData.visit_time) errors.visit_time = "Visit time is required";
    if (!formData.visit_location) errors.visit_location = "Location is required";
    if (!formData.visit_type) errors.visit_type = "Visit type is required";
    if (!formData.clinic) errors.clinic = "Clinic is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateFormData = (field: keyof VisitFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const updatedVisit: Visit = {
        ...visit!,
        patient: patientId,
        patient_name: patientName,
        personal_number: visit?.personal_number || "",
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        visit_location: formData.visit_location,
        visit_type: formData.visit_type,
        clinic: formData.clinic,
        priority: formData.priority as "Low" | "Medium" | "High" | "Emergency",
        special_instructions: formData.special_instructions,
        status: formData.status, // Use the status from form data
        created_at: visit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assigned_nurse: visit?.assigned_nurse,
        nursing_received_at: visit?.nursing_received_at,
      };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/visits/${updatedVisit.id}/`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          patient: updatedVisit.patient,
          patient_name: updatedVisit.patient_name,
          personal_number: updatedVisit.personal_number,
          visit_date: updatedVisit.visit_date,
          visit_time: updatedVisit.visit_time,
          visit_location: updatedVisit.visit_location,
          visit_type: updatedVisit.visit_type,
          clinic: updatedVisit.clinic,
          priority: updatedVisit.priority,
          special_instructions: updatedVisit.special_instructions,
          status: updatedVisit.status,
          assigned_nurse: updatedVisit.assigned_nurse,
          nursing_received_at: updatedVisit.nursing_received_at,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update visit");
      }
      
      const data = await res.json();
      onSave(data); // Use the returned data instead of our constructed object
      toast({ title: "Success", description: "Visit updated successfully", variant: "success" });
    } catch (err: any) {
      setDialogMessage(err.message || "Failed to update visit. Please try again.");
      setShowErrorDialog(true);
      console.error("Failed to save visit:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <Card>
          <CardHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Calendar className="h-6 w-6 text-blue-500" />
              Edit Visit for {patientName}
            </DialogTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {formErrors.general && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                <div className="text-red-500 font-medium">Error</div>
                <p className="text-sm text-red-700">{formErrors.general}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visit-date">Visit Date *</Label>
                <Input
                  id="visit-date"
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => updateFormData("visit_date", e.target.value)}
                  className={formErrors.visit_date ? "border-red-500" : ""}
                />
                {formErrors.visit_date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.visit_date}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="visit-time">Visit Time *</Label>
                <Input
                  id="visit-time"
                  type="time"
                  value={formData.visit_time}
                  onChange={(e) => updateFormData("visit_time", e.target.value)}
                  className={formErrors.visit_time ? "border-red-500" : ""}
                />
                {formErrors.visit_time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.visit_time}</p>
                )}
              </div>
              
              <div>
                <Label>Location *</Label>
                <Select
                  value={formData.visit_location}
                  onValueChange={(value) => updateFormData("visit_location", value)}
                >
                  <SelectTrigger className={formErrors.visit_location ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Location" />
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
                  <p className="text-red-500 text-sm mt-1">{formErrors.visit_location}</p>
                )}
              </div>
              
              <div>
                <Label>Visit Type *</Label>
                <Select
                  value={formData.visit_type}
                  onValueChange={(value) => updateFormData("visit_type", value)}
                >
                  <SelectTrigger className={formErrors.visit_type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Visit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.visit_type && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.visit_type}</p>
                )}
              </div>
              
              <div>
                <Label>Clinic *</Label>
                <Select
                  value={formData.clinic}
                  onValueChange={(value) => updateFormData("clinic", value)}
                >
                  <SelectTrigger className={formErrors.clinic ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Clinic" />
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
                  <p className="text-red-500 text-sm mt-1">{formErrors.clinic}</p>
                )}
              </div>
              
              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateFormData("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
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
                          {priority}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="In Nursing Pool">In Nursing Pool</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any notes or special instructions..."
                  value={formData.special_instructions}
                  onChange={(e) => updateFormData("special_instructions", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            
            <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Error</AlertDialogTitle>
                  <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    onClick={() => setShowErrorDialog(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    OK
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
          
          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}