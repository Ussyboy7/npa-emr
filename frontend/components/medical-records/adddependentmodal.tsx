"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/toast";
import { User, Upload, X, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Constants from register patient page
const nameTitles = ["Mr", "Mrs", "Miss", "Dr", "Prof", "Rev", "Chief"];
const genders = ["Male", "Female"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genotypes = ["AA", "AS", "SS", "AC", "SC"];
const nokRelationships = ["Spouse", "Son", "Daughter", "Parent", "Sibling", "Guardian", "Other"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

interface NextOfKin {
  firstName: string;
  lastName: string;
  relationship: string;
  address: string;
  phone: string;
}

interface Sponsor {
  id: string;
  name: string;
  type: "Employee" | "Retiree";
  personalNumber: string;
}

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dependent: any) => void;
  sponsorId?: string;
  sponsorType?: "Employee" | "Retiree";
  preFilledSponsor?: Sponsor | null;
}

const EMPTY_NOK: NextOfKin = {
  firstName: "",
  lastName: "",
  relationship: "",
  address: "",
  phone: "",
};

export default function AddDependentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  sponsorId, 
  sponsorType, 
  preFilledSponsor 
}: AddDependentModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sponsorId: sponsorId || "",
    sponsorName: preFilledSponsor?.name || "", // Display sponsor name
    dependentType: sponsorType === "Employee" ? "Employee Dependent" : "Retiree Dependent",
    title: "",
    surname: "",
    firstName: "",
    lastName: "",
    relationship: "",
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
    nextOfKin: { ...EMPTY_NOK },
    id: "",
    searchNumber: preFilledSponsor?.personalNumber || "", // Pre-fill sponsor's personal number
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Sponsor | null>(null);
  const [searchError, setSearchError] = useState<string>("");

  // Calculate age from DOB
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

  // Update form field
  const updateField = (field: string, value: string) => {
    if (field === "dateOfBirth") {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: value,
        age: calculateAge(value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Update Next of Kin field
  const updateNok = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      nextOfKin: { ...prev.nextOfKin, [field]: value },
    }));
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "Photo size must be less than 2MB.", variant: "destructive" });
      return;
    }
    if (file && !file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Photo must be an image file.", variant: "destructive" });
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

  // Remove photo
  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.relationship) {
      newErrors.relationship = "Relationship is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.sponsorId) {
      newErrors.sponsorId = "Sponsor is required";
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle search for sponsor
  const handleSearch = async () => {
    if (!formData.searchNumber.trim()) {
      setSearchError("Please enter a sponsor personal number");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseURL}/api/patients/search/?q=${formData.searchNumber}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Search failed" }));
        if (res.status === 404) {
          throw new Error(`Sponsor with personal number ${formData.searchNumber} not found. Please register the Employee or Retiree first.`);
        }
        const errorMsg = err.detail || Object.entries(err).map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`).join(", ") || `Search failed (Status: ${res.status})`;
        throw new Error(errorMsg);
      }
      
      const data = await res.json();
      if (data.patient_type !== "Employee" && data.patient_type !== "Retiree") {
        throw new Error("Selected patient is not an Employee or Retiree. Please search for a valid sponsor.");
      }
      
      const sponsor: Sponsor = {
        id: data.id,
        name: `${data.surname} ${data.first_name}`.trim(),
        type: data.patient_type,
        personalNumber: data.personal_number,
      };
      
      setSearchResult(sponsor);
      setFormData(prev => ({
        ...prev,
        sponsorId: data.id,
        sponsorName: sponsor.name, // Update sponsor name
        dependentType: data.patient_type === "Employee" ? "Employee Dependent" : "Retiree Dependent",
      }));
      toast({ title: "Success", description: "Sponsor found and fields populated." });
    } catch (err: any) {
      setSearchError(err.message || "Unexpected error during search. Check network or console.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Submit form to backend
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("patient_type", "Dependent");
      formDataToSend.append("sponsor_id", formData.sponsorId);
      formDataToSend.append("dependent_type", formData.dependentType);
      formDataToSend.append("relationship", formData.relationship);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("surname", formData.surname);
      formDataToSend.append("first_name", formData.firstName);
      formDataToSend.append("last_name", formData.lastName);
      formDataToSend.append("marital_status", formData.maritalStatus);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("date_of_birth", formData.dateOfBirth);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("residential_address", formData.residentialAddress);
      formDataToSend.append("state_of_residence", formData.stateOfResidence);
      formDataToSend.append("permanent_address", formData.permanentAddress);
      formDataToSend.append("state_of_origin", formData.stateOfOrigin);
      formDataToSend.append("local_government_area", formData.localGovernmentArea);
      formDataToSend.append("blood_group", formData.bloodGroup);
      formDataToSend.append("genotype", formData.genotype);
      formDataToSend.append("nok_first_name", formData.nextOfKin.firstName);
      formDataToSend.append("nok_last_name", formData.nextOfKin.lastName);
      formDataToSend.append("nok_relationship", formData.nextOfKin.relationship);
      formDataToSend.append("nok_address", formData.nextOfKin.address);
      formDataToSend.append("nok_phone", formData.nextOfKin.phone);
      
      if (photo) {
        formDataToSend.append("photo", photo);
      }

      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseURL}/api/patients/`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMsg = err.detail || Object.entries(err).map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`).join(", ") || "Failed to register dependent.";
        throw new Error(errorMsg);
      }

      const data = await res.json();
      
      // Create a new dependent object with the patient_id
      const newDependent = {
        id: data.patient_id, // Use the patient_id from the response
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        relationship: formData.relationship,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        type: formData.dependentType as "Employee Dependent" | "Retiree Dependent",
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        residentialAddress: formData.residentialAddress,
        stateOfResidence: formData.stateOfResidence,
        permanentAddress: formData.permanentAddress,
        stateOfOrigin: formData.stateOfOrigin,
        localGovernmentArea: formData.localGovernmentArea,
        bloodGroup: formData.bloodGroup,
        genotype: formData.genotype,
        nextOfKin: { ...formData.nextOfKin },
        registrationDate: new Date().toLocaleDateString(),
        sponsorId: formData.sponsorId, // Include sponsor's UUID
        sponsorName: formData.sponsorName, // Include sponsor's name for display
      };
      
      toast({ title: "Success", description: `Dependent registered successfully! Patient ID: ${data.patient_id}` });
      
      // Pass the new dependent data to the onSave callback
      onSave(newDependent);
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to register dependent.", variant: "destructive" });
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        sponsorId: sponsorId || "",
        sponsorName: preFilledSponsor?.name || "",
        dependentType: sponsorType === "Employee" ? "Employee Dependent" : "Retiree Dependent",
        title: "",
        surname: "",
        firstName: "",
        lastName: "",
        relationship: "",
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
        nextOfKin: { ...EMPTY_NOK },
        id: "",
        searchNumber: preFilledSponsor?.personalNumber || "",
      });
      setPhoto(null);
      setPhotoPreview(null);
      setErrors({});
      setSearchResult(null);
      setSearchError("");
    }
  }, [isOpen, sponsorId, sponsorType, preFilledSponsor]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? "" : "hidden"}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Add Dependent</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sponsor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sponsor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Sponsor Name</Label>
                    <Input value={formData.sponsorName} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Sponsor Type</Label>
                    <Input value={formData.dependentType.includes("Employee") ? "Employee" : "Retiree"} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Dependent Type</Label>
                    <Input value={formData.dependentType} disabled className="bg-gray-50" />
                  </div>
                </div>
                
                {/* Show sponsor's personal number if found */}
                {searchResult && (
                  <div className="mt-4">
                    <Label>Sponsor Personal Number</Label>
                    <Input value={searchResult.personalNumber} disabled className="bg-gray-50" />
                  </div>
                )}
                
                {/* Search section - only show if no pre-filled sponsor */}
                {!preFilledSponsor && (
                  <div className="mt-4">
                    <Label>Search Sponsor by Personal Number</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={formData.searchNumber || ""}
                        onChange={(e) => updateField("searchNumber", e.target.value)}
                        placeholder="Enter sponsor personal number"
                      />
                      <Button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-gray-900 hover:bg-gray-900 text-white"
                      >
                        {isSearching ? <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> Searching...</span> : <span className="flex items-center"><Search className="mr-2 h-4 w-4" /> Search</span>}
                      </Button>
                    </div>
                    {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dependent Form */}
            <div className="space-y-6">
              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:row-span-2 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-2">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Dependent preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <div className="flex gap-2">
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
                        {photo && (
                          <Button variant="outline" size="sm" onClick={removePhoto}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Title</Label>
                      <Select
                        value={formData.title}
                        onValueChange={(v) => updateField("title", v)}
                      >
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
                      <Label>First Name *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        placeholder="First name"
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Last name"
                      />
                    </div>

                    <div>
                      <Label>Marital Status</Label>
                      <Select
                        value={formData.maritalStatus}
                        onValueChange={(v) => updateField("maritalStatus", v)}
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
                    </div>

                    <div>
                      <Label>Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(v) => updateField("gender", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genders.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                    </div>

                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <Label>Age</Label>
                      <Input value={formData.age} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label>State of Residence</Label>
                      <Select
                        value={formData.stateOfResidence}
                        onValueChange={(v) => updateField("stateOfResidence", v)}
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
                    </div>
                  </div>

                  <div>
                    <Label>Residential Address</Label>
                    <Input
                      value={formData.residentialAddress}
                      onChange={(e) => updateField("residentialAddress", e.target.value)}
                      placeholder="Current residential address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>State of Origin</Label>
                      <Select
                        value={formData.stateOfOrigin}
                        onValueChange={(v) => updateField("stateOfOrigin", v)}
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
                    </div>
                    <div>
                      <Label>Local Government Area</Label>
                      <Input
                        value={formData.localGovernmentArea}
                        onChange={(e) => updateField("localGovernmentArea", e.target.value)}
                        placeholder="Local Government Area"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Permanent Address</Label>
                    <Input
                      value={formData.permanentAddress}
                      onChange={(e) => updateField("permanentAddress", e.target.value)}
                      placeholder="Permanent home address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Blood Group</Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(v) => updateField("bloodGroup", v)}
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
                    </div>
                    <div>
                      <Label>Genotype</Label>
                      <Select
                        value={formData.genotype}
                        onValueChange={(v) => updateField("genotype", v)}
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next of Kin */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next of Kin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={formData.nextOfKin.firstName}
                        onChange={(e) => updateNok("firstName", e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.nextOfKin.lastName}
                        onChange={(e) => updateNok("lastName", e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Select
                        value={formData.nextOfKin.relationship}
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
                        value={formData.nextOfKin.address}
                        onChange={(e) => updateNok("address", e.target.value)}
                        placeholder="Address"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.nextOfKin.phone}
                        onChange={(e) => updateNok("phone", e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !formData.sponsorId}
                className="bg-gray-900 hover:bg-gray-900 text-white"
              >
                {isSubmitting ? "Registering..." : "Add Dependent"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}