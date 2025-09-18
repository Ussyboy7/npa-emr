"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast";
import { Search, User } from "lucide-react";
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
import Link from "next/link";

// Constants (assume in /lib/constants.ts)
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
  NON_NPA_TYPES,
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

export default function RegisterPatient() {
  const { toast } = useToast();
  const [category, setCategory] = useState<EmployeeCategory>("Employee");
  const [pendingCategory, setPendingCategory] = useState<EmployeeCategory | null>(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [patient, setPatient] = useState<Patient>(makeEmptyPatient("Employee"));
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

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
      setPendingCategory(null);
      setShowSwitchConfirm(false);
      setPhoto(null);
      setPhotoPreview(null);
      setApiErrors({});
      toast({ title: "Category Switched", description: `Switched to ${pendingCategory} category. Fields reset.` });
    }
  };

  const cancelSwitchCategory = () => {
    setPendingCategory(null);
    setShowSwitchConfirm(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size > 2 * 1024 * 1024) {
      setDialogMessage("Photo size must be less than 2MB.");
      setShowErrorDialog(true);
      return;
    }
    if (file && !file.type.startsWith("image/")) {
      setDialogMessage("Photo must be an image file.");
      setShowErrorDialog(true);
      return;
    }
    setPhoto(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSearch = async () => {
    if (!patient.searchNumber.trim()) {
      setDialogMessage("Enter a sponsor personal number to search.");
      setShowErrorDialog(true);
      return;
    }
    setIsSearching(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseURL}/api/patients/search/?q=${patient.searchNumber}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Search failed" }));
        if (res.status === 404) {
          throw new Error(
            `Sponsor with personal number ${patient.searchNumber} not found. Please register the Employee or Retiree first.`
          );
        }
        const errorMsg =
          err.detail ||
          Object.entries(err)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join(", ") ||
          `Search failed (Status: ${res.status})`;
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (data.patient_type !== "Employee" && data.patient_type !== "Retiree") {
        throw new Error("Selected patient is not an Employee or Retiree. Please search for a valid sponsor.");
      }
      setPatient((prev) => ({
        ...prev,
        sponsorId: data.id || "",
        personalNumber: data.personal_number || "",
        dependentType: data.patient_type === "Employee" ? "Employee Dependent" : "Retiree Dependent",
      }));
      toast({ title: "Success", description: "Sponsor found and fields populated." });
    } catch (err: any) {
      const errorMessage = err.message || "Unexpected error during search. Check network or console.";
      setDialogMessage(errorMessage);
      setShowErrorDialog(true);
      console.error("Search error:", err, err.stack);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSearching(false);
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
        return { ok: false, message: "Please search for a valid Employee or Retiree sponsor first." };
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
    if (photo && !photo.type.startsWith("image/")) {
      return { ok: false, message: "Photo must be an image file." };
    }
    if (patient.dateOfBirth && new Date(patient.dateOfBirth) > new Date()) {
      return { ok: false, message: "Date of Birth cannot be in the future." };
    }
    return { ok: true };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (!v.ok) {
      setDialogMessage(v.message || "Validation failed - check fields.");
      setShowErrorDialog(true);
      return;
    }
    setIsSubmitting(true);
    setApiErrors({});
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = `${baseURL}/api/patients/`;
      const formData = new FormData();
      formData.append("patient_type", category);
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
      if (category === "Employee") {
        formData.append("personal_number", patient.personalNumber);
        formData.append("type", patient.type);
        formData.append("division", patient.division);
        formData.append("location", patient.location);
      } else if (category === "Retiree") {
        formData.append("personal_number", patient.personalNumber);
      } else if (category === "Dependent") {
        formData.append("sponsor_id", patient.sponsorId || "");
        formData.append("dependent_type", patient.dependentType || "");
        formData.append("relationship", patient.relationship || "");
      } else if (category === "NonNPA") {
        formData.append("non_npa_type", patient.nonnpaType);
      }
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Submit failed:", err);
        const fieldErrors: Record<string, string> = {};
        Object.entries(err).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setApiErrors(fieldErrors);
        const errorMsg = err.detail || Object.values(fieldErrors).join(", ") || `Submission failed (Status: ${res.status})`;
        setDialogMessage(errorMsg);
        setShowErrorDialog(true);
        return;
      }
      const data = await res.json();
      setDialogMessage(`Patient registered successfully! Patient ID: ${data.patient_id}`);
      setShowSuccessDialog(true);
      setPatient(makeEmptyPatient(category));
      setPhoto(null);
      setPhotoPreview(null);
      setApiErrors({});
    } catch (err: any) {
      console.error("Submit error:", err, err.stack);
      setDialogMessage(err.message || "Unexpected error occurred - check network or console.");
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSponsorSearch = category === "Dependent";
  const showPersonalNumber = category === "Employee" || category === "Retiree" || category === "Dependent";
  const showEmployeeWorkFields = category === "Employee";
  const showNonNpaType = category === "NonNPA";
  const isDependent = category === "Dependent";
  const personalNumberLabel = isDependent ? "Sponsor Personal Number" : "Personal Number";

  return (
    <Card className="max-w-6xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg">
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Register New Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
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
          {showSponsorSearch && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Search Sponsor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={patient.searchNumber}
                    onChange={(e) => updatePatient("searchNumber", e.target.value)}
                    placeholder="Enter sponsor personal number"
                  />
                  <Button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-gray-900 hover:bg-gray-900 text-white"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
                {showErrorDialog && dialogMessage.includes("not found") && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Sponsor not found. Please{" "}
                    <Link href="/medical-records/register-patient" className="text-blue-500 underline">
                      register the Employee or Retiree
                    </Link>{" "}
                    first.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
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
                    readOnly={isDependent}
                    className={isDependent ? "bg-gray-50" : ""}
                  />
                  {apiErrors.personal_number && (
                    <p className="text-red-500 text-sm">{apiErrors.personal_number}</p>
                  )}
                  {apiErrors.sponsor_id && (
                    <p className="text-red-500 text-sm">{apiErrors.sponsor_id}</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:row-span-2 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-2">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Patient preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="photo-upload">Upload Photo</label>
                    </Button>
                  </Label>
                </div>
                <div>
                  <Label>Title</Label>
                  <Select value={patient.title} onValueChange={(v: string) => v && updatePatient("title", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      {nameTitles.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.title && <p className="text-red-500 text-sm">{apiErrors.title}</p>}
                </div>
                <div>
                  <Label>Surname *</Label>
                  <Input
                    value={patient.surname}
                    onChange={(e) => updatePatient("surname", e.target.value)}
                    placeholder="Surname"
                  />
                  {apiErrors.surname && <p className="text-red-500 text-sm">{apiErrors.surname}</p>}
                </div>
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={patient.firstName}
                    onChange={(e) => updatePatient("firstName", e.target.value)}
                    placeholder="First name"
                  />
                  {apiErrors.first_name && <p className="text-red-500 text-sm">{apiErrors.first_name}</p>}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={patient.lastName}
                    onChange={(e) => updatePatient("lastName", e.target.value)}
                    placeholder="Last name"
                  />
                  {apiErrors.last_name && <p className="text-red-500 text-sm">{apiErrors.last_name}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
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
                      <Label>Type *</Label>
                      <Select value={patient.type} onValueChange={(v: string) => v && updatePatient("type", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {apiErrors.type && <p className="text-red-500 text-sm">{apiErrors.type}</p>}
                    </div>
                    <div>
                      <Label>Division *</Label>
                      <Select value={patient.division} onValueChange={(v: string) => v && updatePatient("division", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {apiErrors.division && <p className="text-red-500 text-sm">{apiErrors.division}</p>}
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Select value={patient.location} onValueChange={(v: string) => v && updatePatient("location", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {apiErrors.location && <p className="text-red-500 text-sm">{apiErrors.location}</p>}
                    </div>
                  </>
                )}
                {showNonNpaType && (
                  <div className="md:col-span-1">
                    <Label>Non-NPA Category *</Label>
                    <Select
                      value={patient.nonnpaType}
                      onValueChange={(v: string) => v && updatePatient("nonnpaType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Non-NPA category" />
                      </SelectTrigger>
                      <SelectContent>
                        {NON_NPA_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {apiErrors.non_npa_type && (
                      <p className="text-red-500 text-sm">{apiErrors.non_npa_type}</p>
                    )}
                  </div>
                )}
                {isDependent && (
                  <>
                    <div className="md:col-span-1">
                      <Label>Dependent Type *</Label>
                      <Select
                        value={patient.dependentType || ""}
                        onValueChange={(v: string) => v && updatePatient("dependentType", v as Patient["dependentType"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select dependent type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employee Dependent">Employee Dependent</SelectItem>
                          <SelectItem value="Retiree Dependent">Retiree Dependent</SelectItem>
                        </SelectContent>
                      </Select>
                      {apiErrors.dependent_type && (
                        <p className="text-red-500 text-sm">{apiErrors.dependent_type}</p>
                      )}
                    </div>
                    <div className="md:col-span-1">
                      <Label>Relationship *</Label>
                      <Select
                        value={patient.relationship || ""}
                        onValueChange={(v: string) => v && updatePatient("relationship", v)}
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
                      {apiErrors.relationship && (
                        <p className="text-red-500 text-sm">{apiErrors.relationship}</p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <Label>Marital Status</Label>
                  <Select
                    value={patient.maritalStatus}
                    onValueChange={(v: string) => v && updatePatient("maritalStatus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.marital_status && (
                    <p className="text-red-500 text-sm">{apiErrors.marital_status}</p>
                  )}
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select value={patient.gender} onValueChange={(v: string) => v && updatePatient("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.gender && <p className="text-red-500 text-sm">{apiErrors.gender}</p>}
                </div>
                <div>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={patient.dateOfBirth}
                    onChange={(e) => updatePatient("dateOfBirth", e.target.value)}
                  />
                  {apiErrors.date_of_birth && (
                    <p className="text-red-500 text-sm">{apiErrors.date_of_birth}</p>
                  )}
                </div>
                <div>
                  <Label>Age</Label>
                  <Input value={patient.age} readOnly className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                  {apiErrors.email && <p className="text-red-500 text-sm">{apiErrors.email}</p>}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={patient.phone}
                    onChange={(e) => updatePatient("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                  {apiErrors.phone && <p className="text-red-500 text-sm">{apiErrors.phone}</p>}
                </div>
                <div>
                  <Label>State of Residence</Label>
                  <Select
                    value={patient.stateOfResidence}
                    onValueChange={(v: string) => v && updatePatient("stateOfResidence", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.state_of_residence && (
                    <p className="text-red-500 text-sm">{apiErrors.state_of_residence}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Residential Address</Label>
                <Input
                  value={patient.residentialAddress}
                  onChange={(e) => updatePatient("residentialAddress", e.target.value)}
                  placeholder="Current residential address"
                />
                {apiErrors.residential_address && (
                  <p className="text-red-500 text-sm">{apiErrors.residential_address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>State of Origin</Label>
                  <Select
                    value={patient.stateOfOrigin}
                    onValueChange={(v: string) => v && updatePatient("stateOfOrigin", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.state_of_origin && (
                    <p className="text-red-500 text-sm">{apiErrors.state_of_origin}</p>
                  )}
                </div>
                <div>
                  <Label>Local Government Area</Label>
                  <Input
                    value={patient.localGovernmentArea}
                    onChange={(e) => updatePatient("localGovernmentArea", e.target.value)}
                    placeholder="Local Government Area"
                  />
                  {apiErrors.local_government_area && (
                    <p className="text-red-500 text-sm">{apiErrors.local_government_area}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Permanent Address</Label>
                <Input
                  value={patient.permanentAddress}
                  onChange={(e) => updatePatient("permanentAddress", e.target.value)}
                  placeholder="Permanent home address"
                />
                {apiErrors.permanent_address && (
                  <p className="text-red-500 text-sm">{apiErrors.permanent_address}</p>
                )}
              </div>
            </CardContent>
          </Card>
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
                  <Select
                    value={patient.bloodGroup}
                    onValueChange={(v: string) => v && updatePatient("bloodGroup", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.blood_group && (
                    <p className="text-red-500 text-sm">{apiErrors.blood_group}</p>
                  )}
                </div>
                <div>
                  <Label>Genotype</Label>
                  <Select
                    value={patient.genotype}
                    onValueChange={(v: string) => v && updatePatient("genotype", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genotype" />
                    </SelectTrigger>
                    <SelectContent>
                      {genotypes.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiErrors.genotype && <p className="text-red-500 text-sm">{apiErrors.genotype}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
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
                  {apiErrors.nok_first_name && (
                    <p className="text-red-500 text-sm">{apiErrors.nok_first_name}</p>
                  )}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={patient.nextOfKin.lastName}
                    onChange={(e) => updateNok("lastName", e.target.value)}
                    placeholder="Last name"
                  />
                  {apiErrors.nok_last_name && (
                    <p className="text-red-500 text-sm">{apiErrors.nok_last_name}</p>
                  )}
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Select
                    value={patient.nextOfKin.relationship}
                    onValueChange={(v: string) => v && updateNok("relationship", v)}
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
                  {apiErrors.nok_relationship && (
                    <p className="text-red-500 text-sm">{apiErrors.nok_relationship}</p>
                  )}
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
                  {apiErrors.nok_address && (
                    <p className="text-red-500 text-sm">{apiErrors.nok_address}</p>
                  )}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={patient.nextOfKin.phone}
                    onChange={(e) => updateNok("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                  {apiErrors.nok_phone && <p className="text-red-500 text-sm">{apiErrors.nok_phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-gray-900 text-white font-bold py-3"
          >
            {isSubmitting ? "Submitting..." : "Register Patient"}
          </Button>
        </form>
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
              <AlertDialogAction onClick={confirmSwitchCategory} disabled={isSubmitting}>
                {isSubmitting ? "Switching..." : "Switch Category"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registration Successful</AlertDialogTitle>
              <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>OK</AlertDialogAction>
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
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}