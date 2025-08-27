"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Search, User, Briefcase, Mail, Phone, MapPin, Heart, Users } from "lucide-react";

import {
  nameTitles,
  locations,
  divisions,
  employeeTypes,       // ["Staff", "Officer", ...]
  maritalStatuses,
  genders,
  bloodGroups,
  genotypes,
  nokRelationships,
  nigerianStates
} from "@/lib/constants";
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

/* -------------------------
   Types
------------------------- */
type EmployeeCategory = "Employee" | "Retiree" | "NonNPA" | "Dependent";

interface NextOfKin {
  firstName: string;
  lastName: string;
  relationship: string;
  address: string;
  phone: string;
}

interface Patient {
  // category + dependent subtype
  employeeCategory: EmployeeCategory;
  dependentType?: "Employee Dependent" | "Retiree Dependent" | "";

  // search / linking numbers
  searchNumber: string;       // only used by Employee (search box)
  personalNumber: string;     // Employee & Retiree (manual or populated); Dependent uses this as Sponsor PN

  // personal core
  title: string;
  surname: string;
  firstName: string;
  lastName: string;

  // employee-only work fields
  type: string;               // Staff | Officer (employeeTypes)
  division: string;
  location: string;

  // shared “work & personal information”
  maritalStatus: string;
  gender: string;
  dateOfBirth: string;
  age: string;

  // contact (shared)
  email: string;
  phone: string;
  address: string;
  residentialAddress: string; // Current residential address
  stateOfResidence: string;   // State of residence
  permanentAddress: string;   // Permanent home address
  stateOfOrigin: string;      // State of origin
  localgovernmentarea: string; // Local Government Area

  // medical (shared)
  bloodGroup: string;
  genotype: string;

  // non-npa
  nonnpaType: string;         // Police | IT | NYSC | CSR | MD Outfit | Board Member | Seaview

  // NOK (shared)
  nextOfKin: NextOfKin;

  
}

/* -------------------------
   Non-NPA types (per your note)
------------------------- */
const NON_NPA_TYPES = [
  "Police",
  "IT",
  "NYSC",
  "CSR",
  "MD Outfit",
  "Board Member",
  "Seaview",
];

/* -------------------------
   Helpers / initial state
------------------------- */
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
  localgovernmentarea: "",

  bloodGroup: "",
  genotype: "",

  nonnpaType: "",

  nextOfKin: { ...EMPTY_NOK },
});

// safer age calc
const calculateAge = (dob: string) => {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

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
      toast({ title: "Category Switched", description: `Switched to ${pendingCategory} category. Fields reset.` });
    }
  };

  const cancelSwitchCategory = () => {
    setPendingCategory(null);
    setShowSwitchConfirm(false);
  };

  /* -------------------------
     Derived UI flags
  ------------------------- */
  const showEmployeeSearch = category === "Employee";
  const showPersonalNumber =
    category === "Employee" || category === "Retiree" || category === "Dependent"; // Dependent = Sponsor PN
  const showEmployeeWorkFields = category === "Employee";
  const showNonNpaType = category === "NonNPA";
  const isDependent = category === "Dependent";

  const personalNumberLabel = useMemo(() => {
    if (category === "Dependent") return "Sponsor Personal Number";
    return "Personal Number";
  }, [category]);

  /* -------------------------
     Mock search (Employee only)
  ------------------------- */
  const handleSearch = () => {
    if (!patient.searchNumber.trim()) {
      setDialogMessage("Enter a personal number to search.");
      setShowErrorDialog(true);
      return;
    }

    // Mock result
    toast({ title: "Success", description: "Mock search populated." });
    setPatient((prev) => ({
      ...prev,
      personalNumber: prev.searchNumber,
      surname: "Doe",
      firstName: "John",
      lastName: "Smith",
      division: divisions[0] ?? "",
      location: locations[0] ?? "",
      email: "john.smith@example.com",
      address: "123 Main Street",
    }));
  };

  /* -------------------------
     Validation (light, client-side)
  ------------------------- */
  const validate = (): { ok: boolean; message?: string } => {
    // core names
    if (!patient.surname.trim() || !patient.firstName.trim()) {
      return { ok: false, message: "Please provide Surname and First Name." };
    }

    // Employee & Retiree require PN; Dependent requires Sponsor PN
    if ((category === "Employee" || category === "Retiree" || category === "Dependent") && !patient.personalNumber.trim()) {
      return { ok: false, message: `${personalNumberLabel} is required.` };
    }

    // Dependent subtype
    if (isDependent && !patient.dependentType) {
      return { ok: false, message: "Please select Dependent Type." };
    }

    // Employee work fields
    if (showEmployeeWorkFields) {
      if (!patient.type || !patient.division || !patient.location) {
        return { ok: false, message: "Type, Division, and Location are required for Employees." };
      }
    }

    // Non-NPA: require category
    if (showNonNpaType && !patient.nonnpaType) {
      return { ok: false, message: "Please select a Non-NPA Category." };
    }

    // Email format (optional)
    if (patient.email && !/^\S+@\S+\.\S+$/.test(patient.email)) {
      return { ok: false, message: "Please enter a valid email." };
    }

    return { ok: true };
  };

  /* -------------------------
     Submit (JSON style like your second file)
  ------------------------- */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const v = validate();
    if (!v.ok) {
      setDialogMessage(v.message);
      setShowErrorDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const baseURL = "/api/registry";
      let endpoint = "";
      const payload: Record<string, unknown> = {
        // common
        employee_category: category,
        title: patient.title,
        surname: patient.surname,
        first_name: patient.firstName,
        last_name: patient.lastName,
        marital_status: patient.maritalStatus,
        gender: patient.gender,
        date_of_birth: patient.dateOfBirth,
        age: patient.age,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        blood_group: patient.bloodGroup,
        genotype: patient.genotype,
        // NOK
        nok_first_name: patient.nextOfKin.firstName,
        nok_last_name: patient.nextOfKin.lastName,
        nok_relationship: patient.nextOfKin.relationship,
        nok_address: patient.nextOfKin.address,
        nok_phone: patient.nextOfKin.phone,
      };

      if (category === "Employee") {
        endpoint = `${baseURL}/employees/`;
        payload.personal_number = patient.personalNumber;
        payload.type = patient.type;
        payload.division = patient.division;
        payload.location = patient.location;
      } else if (category === "Retiree") {
        endpoint = `${baseURL}/retirees/`;
        payload.personal_number = patient.personalNumber;
      } else if (category === "Dependent") {
        if (patient.dependentType === "Employee Dependent") {
          endpoint = `${baseURL}/employee-dependents/?sponsor_type=employee`;
        } else if (patient.dependentType === "Retiree Dependent") {
          endpoint = `${baseURL}/retiree-dependents/?sponsor_type=retiree`;
        } else {
          throw new Error("Dependent type missing.");
        }
        payload.sponsor_personal_number = patient.personalNumber;
        payload.dependent_type = patient.dependentType;
      } else if (category === "NonNPA") {
        endpoint = `${baseURL}/nonnpas/`;
        payload.non_npa_type = patient.nonnpaType;
      } else {
        throw new Error("Invalid category.");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Submit failed:", err);
        setDialogMessage("Submission failed. Check console.");
        setShowErrorDialog(true);
        return;
      }

      await res.json().catch(() => null);
      setDialogMessage("Patient registered successfully!");
      setShowSuccessDialog(true);
      setPatient(makeEmptyPatient(category));
    } catch (err) {
      console.error(err);
      setDialogMessage("Unexpected error occurred.");
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------
     Render
  ------------------------- */
  return (
    <Card className="max-w-6xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r text-gray rounded-t-lg">
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Register New Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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

          {/* Employee Search (Employee only) */}
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
                  <Button type="button" onClick={handleSearch}>Search</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Personal Number (Employee, Retiree, Dependent) */}
              {showPersonalNumber && (
                <div>
                  <Label>{personalNumberLabel}</Label>
                  <Input
                    value={patient.personalNumber}
                    onChange={(e) => updatePatient("personalNumber", e.target.value)}
                    placeholder={personalNumberLabel}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Title</Label>
                  <Select value={patient.title} onValueChange={(v) => updatePatient("title", v)}>
                    <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Work & Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Work & Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Employee-only fields */}
                {showEmployeeWorkFields && (
                  <>
                    <div>
                      <Label>Type</Label>
                      <Select value={patient.type} onValueChange={(v) => updatePatient("type", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
                        <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
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
                        <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Non-NPA type (Non-NPA only) */}
                {showNonNpaType && (
                  <div className="md:col-span-1">
                    <Label>Non-NPA Category</Label>
                    <Select value={patient.nonnpaType} onValueChange={(v) => updatePatient("nonnpaType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select Non-NPA category" /></SelectTrigger>
                      <SelectContent>
                        {NON_NPA_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dependent Type (Dependent only) */}
                {isDependent && (
                  <div className="md:col-span-1">
                    <Label>Dependent Type</Label>
                    <Select
                      value={patient.dependentType || ""}
                      onValueChange={(v) => updatePatient("dependentType", v as Patient["dependentType"])}
                    >
                      <SelectTrigger><SelectValue placeholder="Select dependent type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee Dependent">Employee Dependent</SelectItem>
                        <SelectItem value="Retiree Dependent">Retiree Dependent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Shared personal fields */}
                <div>
                  <Label>Marital Status</Label>
                  <Select
                    value={patient.maritalStatus}
                    onValueChange={(v) => updatePatient("maritalStatus", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Gender *</Label>
                  <Select value={patient.gender} onValueChange={(v) => updatePatient("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date of Birth *</Label>
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

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
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
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
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
                    value={patient.localgovernmentarea}
                    onChange={(e) => updatePatient("localgovernmentarea", e.target.value)}
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

          {/* Medical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                Medical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Blood Group</Label>
                  <Select value={patient.bloodGroup} onValueChange={(v) => updatePatient("bloodGroup", v)}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Select genotype" /></SelectTrigger>
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

          {/* Next of Kin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
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
                    <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
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

          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3">
            {isSubmitting ? "Submitting..." : "Register Patient"}
          </Button>
        </form>

        {/* Switch Category Confirmation Dialog */}
        <AlertDialog open={showSwitchConfirm} onOpenChange={setShowSwitchConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Switch Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to switch to {pendingCategory}? 
                This will reset some fields.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSwitchCategory} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    Switching...
                  </>
                ) : (
                  "Switch Category"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registration Successful</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}