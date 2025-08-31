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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin } from "lucide-react";

// Mock locations and visit types
const locations = ["Bode Thomas Clinic", "HQ", "Tincan", "LPC"];
const visitTypes = [
  { value: "consultation", label: "Consultation", duration: 30 },
  { value: "follow-up", label: "Follow-up", duration: 15 },
  { value: "emergency", label: "Emergency", duration: 60 },
  { value: "routine-checkup", label: "Routine Checkup", duration: 45 },
  { value: "vaccination", label: "Vaccination", duration: 15 }
];
const clinics = ["General", "Physiotherapy", "Eye", "Sickle Cell", "Dental", "Cardiology"];
const priorities = ["Low", "Medium", "High", "Emergency"];

interface VisitFormData {
  visitDate: string;
  visitTime: string;
  visitLocation: string;
  visitType: string;
  clinic: string;
  priority: string;
  specialInstructions: string;
}

interface EditVisitModalProps {
  open: boolean;
  onClose: () => void;
  visit: any | null;
  onSave: (updatedVisit: any) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

export default function EditVisitModal({ open, onClose, visit, onSave }: EditVisitModalProps) {
  const [formData, setFormData] = useState<VisitFormData>({
    visitDate: "",
    visitTime: "",
    visitLocation: "",
    visitType: "",
    clinic: "",
    priority: "Medium",
    specialInstructions: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visit) {
      setFormData({
        visitDate: visit.visitDate,
        visitTime: visit.visitTime,
        visitLocation: visit.location || "", // Assuming location is part of visit or patient
        visitType: visit.visitType,
        clinic: visit.clinic,
        priority: visit.priority,
        specialInstructions: visit.notes || "",
      });
    }
  }, [visit]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.visitDate) errors.visitDate = "Visit date is required";
    if (!formData.visitTime) errors.visitTime = "Visit time is required";
    if (!formData.visitLocation) errors.visitLocation = "Location is required";
    if (!formData.visitType) errors.visitType = "Visit type is required";
    if (!formData.clinic) errors.clinic = "Clinic is required";

    // Date validation
    if (formData.visitDate) {
      const selectedDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.visitDate = "Visit date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateFormData = (field: keyof VisitFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedVisit = {
        ...visit,
        ...formData,
        notes: formData.specialInstructions,
      };
      onSave(updatedVisit);
    } catch (error) {
      console.error("Failed to save visit:", error);
      alert("Failed to save visit. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetModal = () => {
    setFormData({
      visitDate: "",
      visitTime: "",
      visitLocation: "",
      visitType: "",
      clinic: "",
      priority: "Medium",
      specialInstructions: "",
    });
    setFormErrors({});
    onClose();
  };

  if (!visit) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Visit for {visit.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Patient Info */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Personal Number:</strong> {visit.patientId} {/* Assuming personalNumber is not in visit, adjust if needed */}
              </div>
              <div>
                <strong>Category:</strong> {/* Adjust if category is available */}
              </div>
              <div>
                <strong>Gender/Age:</strong> {/* Adjust if available */}
              </div>
              <div>
                <strong>Last Visit:</strong> {/* Adjust if available */}
              </div>
              <div className="col-span-2">
                <strong>Contact:</strong> {/* Adjust if available */}
              </div>
            </div>
          </div>

          {/* Enhanced Visit Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visit-date">Visit Date *</Label>
              <Input
                id="visit-date"
                type="date"
                value={formData.visitDate}
                onChange={(e) => updateFormData('visitDate', e.target.value)}
                className={formErrors.visitDate ? "border-red-500" : ""}
              />
              {formErrors.visitDate && (
                <p className="text-red-500 text-sm mt-1">{formErrors.visitDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="visit-time">Visit Time *</Label>
              <Input
                id="visit-time"
                type="time"
                value={formData.visitTime}
                onChange={(e) => updateFormData('visitTime', e.target.value)}
                className={formErrors.visitTime ? "border-red-500" : ""}
              />
              {formErrors.visitTime && (
                <p className="text-red-500 text-sm mt-1">{formErrors.visitTime}</p>
              )}
            </div>

            <div>
              <Label>Location *</Label>
              <Select 
                value={formData.visitLocation} 
                onValueChange={(value) => updateFormData('visitLocation', value)}
              >
                <SelectTrigger className={formErrors.visitLocation ? "border-red-500" : ""}>
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
              {formErrors.visitLocation && (
                <p className="text-red-500 text-sm mt-1">{formErrors.visitLocation}</p>
              )}
            </div>

            <div>
              <Label>Visit Type *</Label>
              <Select 
                value={formData.visitType} 
                onValueChange={(value) => updateFormData('visitType', value)}
              >
                <SelectTrigger className={formErrors.visitType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        <span className="text-xs text-gray-500 ml-2">({type.duration} min)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.visitType && (
                <p className="text-red-500 text-sm mt-1">{formErrors.visitType}</p>
              )}
            </div>

            <div>
              <Label>Clinic *</Label>
              <Select 
                value={formData.clinic} 
                onValueChange={(value) => updateFormData('clinic', value)}
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
                onValueChange={(value) => updateFormData('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          priority === 'Emergency' ? 'bg-red-500' :
                          priority === 'High' ? 'bg-orange-500' :
                          priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        {priority}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Any special instructions or notes..."
                value={formData.specialInstructions}
                onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={resetModal}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
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
      </DialogContent>
    </Dialog>
  );
}