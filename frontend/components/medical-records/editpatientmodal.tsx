"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast";
import { Search, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import shared constants
import {
  nameTitles,
  locations,
  divisions,
  employeeTypes,
  maritalStatuses,
  genders,
  bloodGroups,
  genotypes,
  nokRelationships,
  nigerianStates,
  nonnpaCategories,
} from "@/lib/constants";

type EmployeeCategory = "Employee" | "Retiree" | "NonNPA" | "Dependent";

interface NextOfKin {
  firstName: string;
  lastName: string;
  relationship: string;
  address: string;
  phone: string;
}

interface Patient {
  id: string;
  patient_id: string;
  employeeCategory: EmployeeCategory;
  dependentType?: "Employee Dependent" | "Retiree Dependent" | "";
  searchNumber: string;
  personalNumber: string;
  sponsorId?: string;
  title: string;
  surname: string;
  firstName: string;
  lastName: string;
  type: string;
  division: string;
  location: string;
  maritalStatus: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  email: string;
  phone: string;
  address: string;
  residentialAddress: string;
  stateOfResidence: string;
  permanentAddress: string;
  stateOfOrigin: string;
  localGovernmentArea: string;
  bloodGroup: string;
  genotype: string;
  nonnpaType: string;
  nextOfKin: NextOfKin;
  relationship?: string;
}

const EMPTY_NOK: NextOfKin = {
  firstName: "",
  lastName: "",
  relationship: "",
  address: "",
  phone: "",
};

const makeEmptyPatient = (category: EmployeeCategory): Patient => ({
  id: "",
  patient_id: "",
  employeeCategory: category,
  dependentType: "",
  searchNumber: "",
  personalNumber: "",
  sponsorId: "",
  title: "",
  surname: "",
  firstName: "",
  lastName: "",
  type: "",
  division: "",
  location: "",
  maritalStatus: "",
  gender: "",
  dateOfBirth: "",
  age: "",
  email: "",
  phone: "",
  address: "",
  residentialAddress: "",
  stateOfResidence: "",
  permanentAddress: "",
  stateOfOrigin: "",
  localGovernmentArea: "",
  bloodGroup: "",
  genotype: "",
  nonnpaType: "",
  nextOfKin: { ...EMPTY_NOK },
  relationship: category === "Dependent" ? "" : undefined,
});

const calculateAge = (dob: string) => {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return String(age);
};

export default function EditPatientModalContent({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<EmployeeCategory>("Employee");
  const [pendingCategory, setPendingCategory] = useState<EmployeeCategory | null>(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [patient, setPatient] = useState<Patient>(makeEmptyPatient("Employee"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Fetch patient data on mount
  useEffect(() => {
    const loadPatient = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/patients/${patientId}/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to load patient data.");
        }
        
        const data = await res.json();
        setCategory(data.patient_type);
        setPatient({
          ...makeEmptyPatient(data.patient_type),
          id: data.id,
          patient_id: data.patient_id,
          employeeCategory: data.patient_type,
          dependentType: data.dependent_type,
          personalNumber: data.personal_number || data.sponsor?.personal_number || "",
          sponsorId: data.sponsor?.id || "",
          title: data.title || "",
          surname: data.surname || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          type: data.type || "",
          division: data.division || "",
          location: data.location || "",
          maritalStatus: data.marital_status || "",
          gender: data.gender || "",
          dateOfBirth: data.date_of_birth || "",
          age: calculateAge(data.date_of_birth || ""),
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          residentialAddress: data.residential_address || "",
          stateOfResidence: data.state_of_residence || "",
          permanentAddress: data.permanent_address || "",
          stateOfOrigin: data.state_of_origin || "",
          localGovernmentArea: data.local_government_area || "",
          bloodGroup: data.blood_group || "",
          genotype: data.genotype || "",
          nonnpaType: data.non_npa_type || "",
          relationship: data.relationship || "",
          nextOfKin: {
            firstName: data.next_of_kin?.first_name || data.nok_first_name || "",
            lastName: data.next_of_kin?.last_name || data.nok_last_name || "",
            relationship: data.next_of_kin?.relationship || data.nok_relationship || "",
            address: data.next_of_kin?.address || data.nok_address || "",
            phone: data.next_of_kin?.phone || data.nok_phone || "",
          },
        });
        
        if (data.photo) {
          setPhotoPreview(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${data.photo}`);
        }
      } catch (err: any) {
        setDialogMessage(err.message || "Failed to load patient data. Please try again.");
        setShowErrorDialog(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPatient();
  }, [patientId]);

  const updatePatient = <K extends keyof Patient>(field: K, value: Patient[K]) => {
    setPatient((prev) => {
      const next = { ...prev, [field]: value } as Patient;
      if (field === "dateOfBirth") {
        next.age = calculateAge(String(value));
      }
      return next;
    });
  };

  const updateNok = <K extends keyof NextOfKin>(field: K, value: NextOfKin[K]) => {
    setPatient((prev) => ({
      ...prev,
      nextOfKin: { ...prev.nextOfKin, [field]: value },
    }));
  };

  const switchCategory = (newCat: EmployeeCategory) => {
    setPendingCategory(newCat);
    setShowSwitchConfirm(true);
  };

  const confirmSwitchCategory = () => {
    if (pendingCategory) {
      setCategory(pendingCategory);
      setPatient(makeEmptyPatient(pendingCategory));
      setPhoto(null);
      setPhotoPreview(null);
      setPendingCategory(null);
      setShowSwitchConfirm(false);
      toast({ title: "Category Switched", description: `Switched to ${pendingCategory} category. Fields reset.` });
    }
  };

  const cancelSwitchCategory = () => {
    setPendingCategory(null);
    setShowSwitchConfirm(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSearch = async () => {
    if (!patient.searchNumber.trim()) {
      setDialogMessage("Enter a personal number to search.");
      setShowErrorDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/patients/search/?q=${patient.searchNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Search failed");
      }
      
      const data = await res.json();
      
      // Only employees can be searched
      if (data.patient_type !== "Employee") {
        throw new Error("Only Employee records can be searched.");
      }
      
      updatePatient("sponsorId", data.id);
      updatePatient("personalNumber", data.personal_number || "");
      updatePatient("surname", data.surname || "");
      updatePatient("firstName", data.first_name || "");
      updatePatient("lastName", data.last_name || "");
      updatePatient("division", data.division || "");
      updatePatient("location", data.location || "");
      updatePatient("email", data.email || "");
      updatePatient("address", data.address || "");
      
      toast({ title: "Success", description: "Employee found and fields populated." });
    } catch (err: any) {
      setDialogMessage(err.message || "Employee not found or error occurred.");
      setShowErrorDialog(true);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = (): { ok: boolean; message?: string } => {
    if (!patient.surname.trim() || !patient.firstName.trim()) {
      return { ok: false, message: "Please provide Surname and First Name." };
    }
    
    if ((category === "Employee" || category === "Retiree") && !patient.personalNumber.trim()) {
      return { ok: false, message: "Personal Number is required." };
    }
    
    if (category === "Dependent") {
      if (!patient.sponsorId) {
        return { ok: false, message: "Please search for a sponsor first." };
      }
      if (!patient.dependentType) {
        return { ok: false, message: "Please select Dependent Type." };
      }
      if (!patient.relationship) {
        return { ok: false, message: "Please select Relationship." };
      }
    }
    
    if (category === "Employee") {
      if (!patient.type || !patient.division || !patient.location) {
        return { ok: false, message: "Type, Division, and Location are required for Employees." };
      }
    }
    
    if (category === "NonNPA" && !patient.nonnpaType) {
      return { ok: false, message: "Please select a Non-NPA Category." };
    }
    
    if (patient.email && !/^\S+@\S+\.\S+$/.test(patient.email)) {
      return { ok: false, message: "Please enter a valid email." };
    }
    
    if (photo && !["image/jpeg", "image/png"].includes(photo.type)) {
      return { ok: false, message: "Photo must be a JPEG or PNG image." };
    }
    
    return { ok: true };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (!v.ok) {
      setDialogMessage(v.message || "");
      setShowErrorDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = `${baseURL}/api/patients/${patientId}/`;
      const formData = new FormData();
      
      // Add common fields
      formData.append("title", patient.title);
      formData.append("surname", patient.surname);
      formData.append("first_name", patient.firstName);
      formData.append("last_name", patient.lastName);
      formData.append("marital_status", patient.maritalStatus);
      formData.append("gender", patient.gender);
      formData.append("date_of_birth", patient.dateOfBirth);
      formData.append("email", patient.email);
      formData.append("phone", patient.phone);
      formData.append("address", patient.address);
      formData.append("residential_address", patient.residentialAddress);
      formData.append("state_of_residence", patient.stateOfResidence);
      formData.append("permanent_address", patient.permanentAddress);
      formData.append("state_of_origin", patient.stateOfOrigin);
      formData.append("local_government_area", patient.localGovernmentArea);
      formData.append("blood_group", patient.bloodGroup);
      formData.append("genotype", patient.genotype);
      formData.append("nok_first_name", patient.nextOfKin.firstName);
      formData.append("nok_last_name", patient.nextOfKin.lastName);
      formData.append("nok_relationship", patient.nextOfKin.relationship);
      formData.append("nok_address", patient.nextOfKin.address);
      formData.append("nok_phone", patient.nextOfKin.phone);
      
      if (photo) formData.append("photo", photo);
      
      // Add category-specific fields
      if (category === "Employee") {
        formData.append("personal_number", patient.personalNumber);
        formData.append("type", patient.type);
        formData.append("division", patient.division);
        formData.append("location", patient.location);
      } else if (category === "Retiree") {
        formData.append("personal_number", patient.personalNumber);
      } else if (category === "Dependent") {
        if (patient.sponsorId) {
          formData.append("sponsor_id", patient.sponsorId);
        }
        formData.append("dependent_type", patient.dependentType || "");
        formData.append("relationship", patient.relationship || "");
      } else if (category === "NonNPA") {
        formData.append("non_npa_type", patient.nonnpaType);
      }
      
      const res = await fetch(endpoint, {
        method: "PUT", // Changed from PATCH to PUT to match backend
        headers: {},
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Update failed:", err);
        setDialogMessage(err.detail || "Failed to update patient data.");
        setShowErrorDialog(true);
        return;
      }
      
      await res.json().catch(() => null);
      setDialogMessage("Patient updated successfully!");
      setShowSuccessDialog(true);
      setPhoto(null);
      setPhotoPreview(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      setDialogMessage(err.message || "Unexpected error occurred. Please try again.");
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEmployeeSearch = category === "Employee";
  const showPersonalNumber = category === "Employee" || category === "Retiree";
  const showEmployeeWorkFields = category === "Employee";
  const showNonNpaType = category === "NonNPA";
  const isDependent = category === "Dependent";
  const personalNumberLabel = useMemo(() => {
    if (category === "Dependent") return "Sponsor Personal Number";
    return "Personal Number";
  }, [category]);

  if (loading) {
    return (
      <Card className="max-w-6xl mx-auto shadow-xl">
        <CardContent className="p-6 flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
          <div className="text-lg">Loading patient data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto shadow-xl">
      <CardHeader className="rounded-t-lg">
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8 text-blue-500" />
          Edit Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div>
            <Label className="text-lg font-semibold mb-2 block">Patient Category</Label>
            <ToggleGroup
              type="single"
              value={category}
              onValueChange={(value) => value && switchCategory(value as EmployeeCategory)}
              className="flex flex-wrap gap-2"
            >
              {(["Employee", "Retiree", "NonNPA", "Dependent"] as EmployeeCategory[]).map((c) => (
                <ToggleGroupItem
                  key={c}
                  value={c}
                  variant="outline"
                  className="flex-1 min-w-[120px] data-[state=on]:bg-gray-900 data-[state=on]:text-white"
                >
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Separator />
          
          {/* Employee Search Section */}
          {showEmployeeSearch && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Search Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={patient.searchNumber}
                    onChange={(e) => updatePatient("searchNumber", e.target.value)}
                    placeholder="Enter personal number"
                  />
                  <Button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSubmitting}
                    className="bg-gray-900 hover:bg-gray-900 text-white"
                  >
                    {isSubmitting ? "Searching..." : "Search"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Personal Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showPersonalNumber && (
                <div>
                  <Label>{personalNumberLabel}</Label>
                  <Input
                    value={patient.personalNumber}
                    onChange={(e) => updatePatient("personalNumber", e.target.value)}
                    placeholder={personalNumberLabel}
                    readOnly={category === "Dependent"}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Title</Label>
                  <Select value={patient.title} onValueChange={(v) => updatePatient("title", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      {nameTitles.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Surname</Label>
                  <Input
                    value={patient.surname}
                    onChange={(e) => updatePatient("surname", e.target.value)}
                    placeholder="Surname"
                  />
                </div>
                
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={patient.firstName}
                    onChange={(e) => updatePatient("firstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={patient.lastName}
                    onChange={(e) => updatePatient("lastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <Label>Photo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="max-w-[300px]"
                  />
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Photo preview"
                        className="h-20 w-20 object-cover rounded-full"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0 h-6 w-6 p-0"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Work & Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Work & Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {showEmployeeWorkFields && (
                  <>
                    <div>
                      <Label>Type</Label>
                      <Select value={patient.type} onValueChange={(v) => updatePatient("type", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Division</Label>
                      <Select value={patient.division} onValueChange={(v) => updatePatient("division", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Location</Label>
                      <Select value={patient.location} onValueChange={(v) => updatePatient("location", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {showNonNpaType && (
                  <div className="md:col-span-1">
                    <Label>Non-NPA Category</Label>
                    <Select value={patient.nonnpaType} onValueChange={(v) => updatePatient("nonnpaType", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Non-NPA category" />
                      </SelectTrigger>
                      <SelectContent>
                        {nonnpaCategories.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {isDependent && (
                  <>
                    <div className="md:col-span-1">
                      <Label>Dependent Type</Label>
                      <Select
                        value={patient.dependentType || ""}
                        onValueChange={(v) => updatePatient("dependentType", v as Patient["dependentType"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select dependent type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employee Dependent">Employee Dependent</SelectItem>
                          <SelectItem value="Retiree Dependent">Retiree Dependent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-1">
                      <Label>Relationship</Label>
                      <Select
                        value={patient.relationship || ""}
                        onValueChange={(v) => updatePatient("relationship", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {nokRelationships.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div>
                  <Label>Marital Status</Label>
                  <Select value={patient.maritalStatus} onValueChange={(v) => updatePatient("maritalStatus", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Gender</Label>
                  <Select value={patient.gender} onValueChange={(v) => updatePatient("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={patient.dateOfBirth}
                    onChange={(e) => updatePatient("dateOfBirth", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Age</Label>
                  <Input value={patient.age} readOnly className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={patient.email}
                    onChange={(e) => updatePatient("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={patient.phone}
                    onChange={(e) => updatePatient("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <Label>State of Residence</Label>
                  <Select value={patient.stateOfResidence} onValueChange={(v) => updatePatient("stateOfResidence", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Residential Address</Label>
                <Input
                  value={patient.residentialAddress}
                  onChange={(e) => updatePatient("residentialAddress", e.target.value)}
                  placeholder="Current residential address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>State of Origin</Label>
                  <Select value={patient.stateOfOrigin} onValueChange={(v) => updatePatient("stateOfOrigin", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Local Government Area</Label>
                  <Input
                    value={patient.localGovernmentArea}
                    onChange={(e) => updatePatient("localGovernmentArea", e.target.value)}
                    placeholder="Local Government Area"
                  />
                </div>
              </div>
              
              <div>
                <Label>Permanent Address</Label>
                <Input
                  value={patient.permanentAddress}
                  onChange={(e) => updatePatient("permanentAddress", e.target.value)}
                  placeholder="Permanent home address"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Medical Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Medical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Blood Group</Label>
                  <Select value={patient.bloodGroup} onValueChange={(v) => updatePatient("bloodGroup", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Genotype</Label>
                  <Select value={patient.genotype} onValueChange={(v) => updatePatient("genotype", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genotype" />
                    </SelectTrigger>
                    <SelectContent>
                      {genotypes.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Next of Kin Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Next of Kin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={patient.nextOfKin.firstName}
                    onChange={(e) => updateNok("firstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={patient.nextOfKin.lastName}
                    onChange={(e) => updateNok("lastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                
                <div>
                  <Label>Relationship</Label>
                  <Select
                    value={patient.nextOfKin.relationship}
                    onValueChange={(v) => updateNok("relationship", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {nokRelationships.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Address</Label>
                  <Input
                    value={patient.nextOfKin.address}
                    onChange={(e) => updateNok("address", e.target.value)}
                    placeholder="Address"
                  />
                </div>
                
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={patient.nextOfKin.phone}
                    onChange={(e) => updateNok("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-gray-900 text-white font-bold py-3"
          >
            {isSubmitting ? "Updating..." : "Update Patient"}
          </Button>
        </form>
        
        {/* Dialogs */}
        <AlertDialog open={showSwitchConfirm} onOpenChange={setShowSwitchConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Switch Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to switch to {pendingCategory}? This will reset some fields.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSwitchCategory}
                disabled={isSubmitting}
                className="bg-gray-900 hover:bg-gray-900 text-white"
              >
                {isSubmitting ? "Switching..." : "Switch Category"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Successful</AlertDialogTitle>
              <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowSuccessDialog(false);
                  onClose();
                }}
                className="bg-gray-900 hover:bg-gray-900 text-white"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
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
      </CardContent>
    </Card>
  );
}