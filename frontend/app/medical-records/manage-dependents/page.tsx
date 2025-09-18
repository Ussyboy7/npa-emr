"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Search, Eye, Calendar, User } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/toast";
import PatientOverviewModalContent from "@/components/medical-records/patientoverviewmodal";
import Link from "next/link";
import {
  nameTitles,
  dependentRelationships,
  genders,
  maritalStatuses,
  bloodGroups,
  genotypes,
  nokRelationships,
  dependentTypes,
  nigerianStates,
} from "@/lib/constants";

interface Dependent {
  id: string;
  sponsor_id: string;
  type: "Employee Dependent" | "Retiree Dependent";
  title: string;
  surname: string;
  first_name: string;
  last_name: string;
  name: string;
  relationship: string;
  gender: string;
  date_of_birth: string;
  age: string;
  marital_status: string;
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
  created_at: string;
  next_of_kin: {
    first_name: string;
    last_name: string;
    relationship: string;
    address: string;
    phone: string;
  };
}

interface Sponsor {
  id: string;
  name: string;
  type: "Employee" | "Retiree";
  dependents: Dependent[];
}

interface APIError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

const Loader = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />;

const DependentFormFields = ({
  formData,
  updateField,
  updateNok,
  handlePhotoChange,
  photoPreview,
  apiErrors,
}: {
  formData: any;
  updateField: (field: string, value: string) => void;
  updateNok: (field: string, value: string) => void;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoPreview: string | null;
  apiErrors: Record<string, string>;
}) => (
  <div className="space-y-6">
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Sponsor Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <Label>Sponsor Personal Number</Label>
          <Input value={formData.sponsor_id} disabled className="bg-gray-50" />
          {apiErrors.sponsor_id && <p className="text-red-500 text-sm">{apiErrors.sponsor_id}</p>}
        </div>
        <div>
          <Label>Dependent Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(v: string) => v && updateField("type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {dependentTypes.map((t: string) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.type && <p className="text-red-500 text-sm">{apiErrors.type}</p>}
        </div>
      </div>
    </fieldset>
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Personal Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="md:row-span-2 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-2">
            {photoPreview ? (
              <img src={photoPreview} alt="Dependent preview" className="w-full h-full object-cover" />
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
          <Select
            value={formData.title}
            onValueChange={(v: string) => v && updateField("title", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              {nameTitles.map((t: string) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.title && <p className="text-red-500 text-sm">{apiErrors.title}</p>}
        </div>
        <div>
          <Label>Surname *</Label>
          <Input
            value={formData.surname}
            onChange={(e) => updateField("surname", e.target.value)}
            placeholder="Enter surname"
          />
          {apiErrors.surname && <p className="text-red-500 text-sm">{apiErrors.surname}</p>}
        </div>
        <div>
          <Label>First Name *</Label>
          <Input
            value={formData.first_name}
            onChange={(e) => updateField("first_name", e.target.value)}
            placeholder="Enter first name"
          />
          {apiErrors.first_name && <p className="text-red-500 text-sm">{apiErrors.first_name}</p>}
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={formData.last_name}
            onChange={(e) => updateField("last_name", e.target.value)}
            placeholder="Enter last name"
          />
          {apiErrors.last_name && <p className="text-red-500 text-sm">{apiErrors.last_name}</p>}
        </div>
      </div>
    </fieldset>
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Work & Personal Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <Label>Relationship *</Label>
          <Select
            value={formData.relationship}
            onValueChange={(v: string) => v && updateField("relationship", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {dependentRelationships.map((r: string) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.relationship && <p className="text-red-500 text-sm">{apiErrors.relationship}</p>}
        </div>
        <div>
          <Label>Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(v: string) => v && updateField("gender", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g: string) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.gender && <p className="text-red-500 text-sm">{apiErrors.gender}</p>}
        </div>
        <div>
          <Label>Marital Status</Label>
          <Select
            value={formData.marital_status}
            onValueChange={(v: string) => v && updateField("marital_status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              {maritalStatuses.map((m: string) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.marital_status && <p className="text-red-500 text-sm">{apiErrors.marital_status}</p>}
        </div>
        <div>
          <Label>Date of Birth *</Label>
          <Input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => updateField("date_of_birth", e.target.value)}
          />
          {apiErrors.date_of_birth && <p className="text-red-500 text-sm">{apiErrors.date_of_birth}</p>}
        </div>
        <div>
          <Label>Age</Label>
          <Input value={formData.age} disabled className="bg-gray-50" />
        </div>
      </div>
    </fieldset>
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Contact Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="email@example.com"
          />
          {apiErrors.email && <p className="text-red-500 text-sm">{apiErrors.email}</p>}
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Phone number"
          />
          {apiErrors.phone && <p className="text-red-500 text-sm">{apiErrors.phone}</p>}
        </div>
        <div>
          <Label>State of Residence</Label>
          <Select
            value={formData.state_of_residence}
            onValueChange={(v: string) => v && updateField("state_of_residence", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {nigerianStates.map((s: string) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.state_of_residence && <p className="text-red-500 text-sm">{apiErrors.state_of_residence}</p>}
        </div>
      </div>
      <div className="mt-4">
        <Label>Residential Address</Label>
        <Input
          value={formData.residential_address}
          onChange={(e) => updateField("residential_address", e.target.value)}
          placeholder="Current residential address"
        />
        {apiErrors.residential_address && <p className="text-red-500 text-sm">{apiErrors.residential_address}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label>State of Origin</Label>
          <Select
            value={formData.state_of_origin}
            onValueChange={(v: string) => v && updateField("state_of_origin", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {nigerianStates.map((s: string) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.state_of_origin && <p className="text-red-500 text-sm">{apiErrors.state_of_origin}</p>}
        </div>
        <div>
          <Label>Local Government Area</Label>
          <Input
            value={formData.local_government_area}
            onChange={(e) => updateField("local_government_area", e.target.value)}
            placeholder="Local Government Area"
          />
          {apiErrors.local_government_area && <p className="text-red-500 text-sm">{apiErrors.local_government_area}</p>}
        </div>
      </div>
      <div className="mt-4">
        <Label>Permanent Address</Label>
        <Input
          value={formData.permanent_address}
          onChange={(e) => updateField("permanent_address", e.target.value)}
          placeholder="Permanent home address"
        />
        {apiErrors.permanent_address && <p className="text-red-500 text-sm">{apiErrors.permanent_address}</p>}
      </div>
    </fieldset>
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Medical Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <Label>Blood Group</Label>
          <Select
            value={formData.blood_group}
            onValueChange={(v: string) => v && updateField("blood_group", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {bloodGroups.map((b: string) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.blood_group && <p className="text-red-500 text-sm">{apiErrors.blood_group}</p>}
        </div>
        <div>
          <Label>Genotype</Label>
          <Select
            value={formData.genotype}
            onValueChange={(v: string) => v && updateField("genotype", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select genotype" />
            </SelectTrigger>
            <SelectContent>
              {genotypes.map((g: string) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors.genotype && <p className="text-red-500 text-sm">{apiErrors.genotype}</p>}
        </div>
      </div>
    </fieldset>
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Next of Kin</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <Label>First Name</Label>
          <Input
            value={formData.next_of_kin.first_name}
            onChange={(e) => updateNok("first_name", e.target.value)}
            placeholder="First name"
          />
          {apiErrors["next_of_kin.first_name"] && <p className="text-red-500 text-sm">{apiErrors["next_of_kin.first_name"]}</p>}
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={formData.next_of_kin.last_name}
            onChange={(e) => updateNok("last_name", e.target.value)}
            placeholder="Last name"
          />
          {apiErrors["next_of_kin.last_name"] && <p className="text-red-500 text-sm">{apiErrors["next_of_kin.last_name"]}</p>}
        </div>
        <div>
          <Label>Relationship</Label>
          <Select
            value={formData.next_of_kin.relationship}
            onValueChange={(v: string) => v && updateNok("relationship", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {nokRelationships.map((r: string) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {apiErrors["next_of_kin.relationship"] && <p className="text-red-500 text-sm">{apiErrors["next_of_kin.relationship"]}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label>Address</Label>
          <Input
            value={formData.next_of_kin.address}
            onChange={(e) => updateNok("address", e.target.value)}
            placeholder="Address"
          />
          {apiErrors["next_of_kin.address"] && <p className="text-red-500 text-sm">{apiErrors["next_of_kin.address"]}</p>}
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.next_of_kin.phone}
            onChange={(e) => updateNok("phone", e.target.value)}
            placeholder="Phone number"
          />
          {apiErrors["next_of_kin.phone"] && <p className="text-red-500 text-sm">{apiErrors["next_of_kin.phone"]}</p>}
        </div>
      </div>
    </fieldset>
  </div>
);

export default function DependentList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dependentsData, setDependentsData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<Dependent | null>(null);
  const [viewModalData, setViewModalData] = useState<Dependent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ sponsorId: string; dependentId: string; dependentName: string } | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNumber, setSearchNumber] = useState("");
  const [formData, setFormData] = useState({
    sponsor_id: "",
    type: "",
    title: "",
    surname: "",
    first_name: "",
    last_name: "",
    relationship: "",
    gender: "",
    date_of_birth: "",
    age: "",
    marital_status: "",
    email: "",
    phone: "",
    address: "",
    residential_address: "",
    state_of_residence: "",
    permanent_address: "",
    state_of_origin: "",
    local_government_area: "",
    blood_group: "",
    genotype: "",
    next_of_kin: {
      first_name: "",
      last_name: "",
      relationship: "",
      address: "",
      phone: "",
    },
    id: "",
  });
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchDependents = async () => {
      setIsLoading(true);
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const params = new URLSearchParams({
          page: String(currentPage),
          page_size: String(rowsPerPage),
          ...(search && { search }),
          ...(typeFilter !== "All" && { type: typeFilter.toLowerCase() }),
        });
        const res = await fetch(`${baseURL}/api/dependents/?${params}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!res.ok) {
          const err: APIError = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to fetch dependents");
        }
        const data = await res.json();
        const mappedData = (data.results || data).map((s: any) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          dependents: s.dependents.map((d: any) => ({
            id: d.id,
            sponsor_id: s.id,
            type: d.type,
            title: d.title || "",
            surname: d.surname || "",
            first_name: d.first_name || "",
            last_name: d.last_name || "",
            name: `${d.first_name || ""} ${d.last_name || ""}`.trim(),
            relationship: d.relationship || "",
            gender: d.gender || "",
            date_of_birth: d.date_of_birth || "",
            age: d.age || "",
            marital_status: d.marital_status || "",
            email: d.email || "",
            phone: d.phone || "",
            address: d.address || "",
            residential_address: d.residential_address || "",
            state_of_residence: d.state_of_residence || "",
            permanent_address: d.permanent_address || "",
            state_of_origin: d.state_of_origin || "",
            local_government_area: d.local_government_area || "",
            blood_group: d.blood_group || "",
            genotype: d.genotype || "",
            created_at: d.created_at || "",
            next_of_kin: {
              first_name: d.next_of_kin?.first_name || "",
              last_name: d.next_of_kin?.last_name || "",
              relationship: d.next_of_kin?.relationship || "",
              address: d.next_of_kin?.address || "",
              phone: d.next_of_kin?.phone || "",
            },
          })),
        }));
        setDependentsData(mappedData);
        setTotalCount(data.count || mappedData.length);
        setTotalPages(Math.ceil((data.count || mappedData.length) / rowsPerPage));
      } catch (err: any) {
        setDialogMessage(err.message || "Failed to load dependents. Please try again.");
        setShowErrorDialog(true);
        console.error(err);
        toast({ title: "Error", description: String(err), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDependents();
  }, [currentPage, search, typeFilter, toast]);

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    if (birthDate > today) return "";
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return String(Math.max(0, age));
  };

  const updateField = (field: string, value: string) => {
    setFormData((f) => ({
      ...f,
      [field]: value,
      ...(field === "date_of_birth" && { age: calculateAge(value) }),
    }));
  };

  const updateNok = (field: string, value: string) => {
    setFormData((f) => ({
      ...f,
      next_of_kin: { ...f.next_of_kin, [field]: value },
    }));
  };

  const getDependentLimit = (sponsorType: string) => {
    return sponsorType === "Employee" ? 5 : 1;
  };

  const resetFormData = () => {
    setFormData({
      sponsor_id: "",
      type: "",
      title: "",
      surname: "",
      first_name: "",
      last_name: "",
      relationship: "",
      gender: "",
      date_of_birth: "",
      age: "",
      marital_status: "",
      email: "",
      phone: "",
      address: "",
      residential_address: "",
      state_of_residence: "",
      permanent_address: "",
      state_of_origin: "",
      local_government_area: "",
      blood_group: "",
      genotype: "",
      next_of_kin: {
        first_name: "",
        last_name: "",
        relationship: "",
        address: "",
        phone: "",
      },
      id: "",
    });
    setPhoto(null);
    setPhotoPreview(null);
    setApiErrors({});
  };

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

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      setDialogMessage("Enter a personal number to search.");
      setShowErrorDialog(true);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/patients/search/?q=${searchNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Search failed" }));
        const errorMsg =
          err.detail ||
          Object.entries(err)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join(", ") ||
          "Search failed - check console.";
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        sponsor_id: data.personal_number || data.id,
      }));
      toast({ title: "Success", description: "Sponsor found.", variant: "success" });
    } catch (err: any) {
      console.error("Search error:", err, err.stack);
      setDialogMessage(err.message || "Sponsor not found or network error.");
      setShowErrorDialog(true);
    } finally {
      setIsSearching(false);
    }
  };

  const openAddModal = () => {
    resetFormData();
    setSearchNumber("");
    setAddModalOpen(true);
  };

  const openEditModal = (sponsorId: string, dependent: Dependent) => {
    setFormData({
      sponsor_id: sponsorId,
      type: dependent.type,
      title: dependent.title,
      surname: dependent.surname,
      first_name: dependent.first_name,
      last_name: dependent.last_name,
      relationship: dependent.relationship,
      gender: dependent.gender,
      date_of_birth: dependent.date_of_birth,
      age: dependent.age,
      marital_status: dependent.marital_status,
      email: dependent.email,
      phone: dependent.phone,
      address: dependent.address,
      residential_address: dependent.residential_address,
      state_of_residence: dependent.state_of_residence,
      permanent_address: dependent.permanent_address,
      state_of_origin: dependent.state_of_origin,
      local_government_area: dependent.local_government_area,
      blood_group: dependent.blood_group,
      genotype: dependent.genotype,
      next_of_kin: { ...dependent.next_of_kin },
      id: dependent.id,
    });
    setEditModalData(dependent);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const openViewModal = (dependent: Dependent) => {
    setViewModalData(dependent);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    resetFormData();
  };

  const closeEditModal = () => {
    setEditModalData(null);
    resetFormData();
  };

  const closeViewModal = () => {
    setViewModalData(null);
  };

  const handleSaveClick = async () => {
    const { sponsor_id, type, surname, first_name, relationship, gender, date_of_birth, email } = formData;
    if (!sponsor_id || !type || !surname || !first_name || !relationship || !gender || !date_of_birth) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Sponsor Personal Number, Type, Surname, First Name, Relationship, Gender, Date of Birth).",
        variant: "destructive",
      });
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("sponsor_id", sponsor_id);
    formDataToSend.append("type", type);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("surname", surname);
    formDataToSend.append("first_name", first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("relationship", relationship);
    formDataToSend.append("gender", gender);
    formDataToSend.append("date_of_birth", date_of_birth);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("marital_status", formData.marital_status);
    formDataToSend.append("email", email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("residential_address", formData.residential_address);
    formDataToSend.append("state_of_residence", formData.state_of_residence);
    formDataToSend.append("permanent_address", formData.permanent_address);
    formDataToSend.append("state_of_origin", formData.state_of_origin);
    formDataToSend.append("local_government_area", formData.local_government_area);
    formDataToSend.append("blood_group", formData.blood_group);
    formDataToSend.append("genotype", formData.genotype);
    formDataToSend.append("next_of_kin.first_name", formData.next_of_kin.first_name);
    formDataToSend.append("next_of_kin.last_name", formData.next_of_kin.last_name);
    formDataToSend.append("next_of_kin.relationship", formData.next_of_kin.relationship);
    formDataToSend.append("next_of_kin.address", formData.next_of_kin.address);
    formDataToSend.append("next_of_kin.phone", formData.next_of_kin.phone);
    if (photo) formDataToSend.append("photo", photo);
    let endpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/dependents/`;
    const method = formData.id ? "PUT" : "POST";
    if (formData.id) endpoint += `${formData.id}/`;
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formDataToSend,
      });
      if (!res.ok) {
        const err: APIError = await res.json().catch(() => ({}));
        const fieldErrors: Record<string, string> = {};
        Object.entries(err).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setApiErrors(fieldErrors);
        setDialogMessage(err.detail || Object.values(fieldErrors).join(", ") || "Save failed");
        setShowErrorDialog(true);
        throw new Error(err.detail || "Save failed");
      }
      await res.json();
      toast({
        title: "Success",
        description: formData.id ? "Dependent updated successfully." : "Dependent added successfully.",
        variant: "success",
      });
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/dependents/?page=${currentPage}&page_size=${rowsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const newData = await refreshRes.json();
      const mappedData = (newData.results || newData).map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        dependents: s.dependents.map((d: any) => ({
          id: d.id,
          sponsor_id: s.id,
          type: d.type,
          title: d.title || "",
          surname: d.surname || "",
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          name: `${d.first_name || ""} ${d.last_name || ""}`.trim(),
          relationship: d.relationship || "",
          gender: d.gender || "",
          date_of_birth: d.date_of_birth || "",
          age: d.age || "",
          marital_status: d.marital_status || "",
          email: d.email || "",
          phone: d.phone || "",
          address: d.address || "",
          residential_address: d.residential_address || "",
          state_of_residence: d.state_of_residence || "",
          permanent_address: d.permanent_address || "",
          state_of_origin: d.state_of_origin || "",
          local_government_area: d.local_government_area || "",
          blood_group: d.blood_group || "",
          genotype: d.genotype || "",
          created_at: d.created_at || "",
          next_of_kin: {
            first_name: d.next_of_kin?.first_name || "",
            last_name: d.next_of_kin?.last_name || "",
            relationship: d.next_of_kin?.relationship || "",
            address: d.next_of_kin?.address || "",
            phone: d.next_of_kin?.phone || "",
          },
        })),
      }));
      setDependentsData(mappedData);
      setTotalCount(newData.count || mappedData.length);
      setTotalPages(Math.ceil((newData.count || mappedData.length) / rowsPerPage));
      formData.id ? closeEditModal() : closeAddModal();
    } catch (err: any) {
      setDialogMessage(err.message || "Error saving dependent.");
      setShowErrorDialog(true);
      console.error(err, err.stack);
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleDeleteClick = (sponsorId: string, dependentId: string, dependentName: string) => {
    setDeleteConfirm({ sponsorId, dependentId, dependentName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/dependents/${deleteConfirm.dependentId}/`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) {
        const err: APIError = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Delete failed");
      }
      toast({ title: "Success", description: "Dependent deleted successfully.", variant: "success" });
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/dependents/?page=${currentPage}&page_size=${rowsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const newData = await refreshRes.json();
      const mappedData = (newData.results || newData).map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        dependents: s.dependents.map((d: any) => ({
          id: d.id,
          sponsor_id: s.id,
          type: d.type,
          title: d.title || "",
          surname: d.surname || "",
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          name: `${d.first_name || ""} ${d.last_name || ""}`.trim(),
          relationship: d.relationship || "",
          gender: d.gender || "",
          date_of_birth: d.date_of_birth || "",
          age: d.age || "",
          marital_status: d.marital_status || "",
          email: d.email || "",
          phone: d.phone || "",
          address: d.address || "",
          residential_address: d.residential_address || "",
          state_of_residence: d.state_of_residence || "",
          permanent_address: d.permanent_address || "",
          state_of_origin: d.state_of_origin || "",
          local_government_area: d.local_government_area || "",
          blood_group: d.blood_group || "",
          genotype: d.genotype || "",
          created_at: d.created_at || "",
          next_of_kin: {
            first_name: d.next_of_kin?.first_name || "",
            last_name: d.next_of_kin?.last_name || "",
            relationship: d.next_of_kin?.relationship || "",
            address: d.next_of_kin?.address || "",
            phone: d.next_of_kin?.phone || "",
          },
        })),
      }));
      setDependentsData(mappedData);
      setTotalCount(newData.count || mappedData.length);
      setTotalPages(Math.ceil((newData.count || mappedData.length) / rowsPerPage));
    } catch (err: any) {
      setDialogMessage(err.message || "Error deleting dependent.");
      setShowErrorDialog(true);
      console.error(err);
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredSponsors = useMemo(() => {
    return dependentsData.filter((sponsor) => {
      const matchesSearch =
        sponsor.name.toLowerCase().includes(search.toLowerCase()) ||
        sponsor.dependents.some((dep: Dependent) =>
          dep.name.toLowerCase().includes(search.toLowerCase())
        );
      const matchesType =
        typeFilter === "All" ||
        sponsor.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [dependentsData, search, typeFilter]);

  const paginatedSponsors = filteredSponsors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto shadow-xl">
        <CardContent className="flex justify-center items-center h-screen">
          <Loader />
          <span className="ml-2">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Manage Dependents
          </CardTitle>
          <div className="flex gap-2">
            <Link href="/medical-records/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/medical-records/register-patient">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Register Patient
              </Button>
            </Link>
            <Button
              onClick={openAddModal}
              className="bg-gray-900 hover:bg-gray-900 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Dependent
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Search by Sponsor or Dependent Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name"
                  />
                </div>
              </div>
              <div>
                <Label>Filter by Sponsor Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Retiree">Retiree</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Dependents</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSponsors.length === 0 ? (
              <p className="text-center text-gray-500">No dependents found.</p>
            ) : (
              <div className="space-y-4">
                {paginatedSponsors.map((sponsor) => (
                  <div key={sponsor.id} className="border rounded-lg">
                    <div className="flex justify-between items-center p-4 bg-gray-50">
                      <div>
                        <h3 className="font-semibold">{sponsor.name} ({sponsor.type})</h3>
                        <p className="text-sm text-gray-500">
                          Dependents: {sponsor.dependents.length}/{getDependentLimit(sponsor.type)}
                        </p>
                      </div>
                      {sponsor.dependents.length < getDependentLimit(sponsor.type) && (
                        <Button
                          onClick={() => openAddModal()}
                          className="bg-gray-900 hover:bg-gray-900 text-white flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Dependent
                        </Button>
                      )}
                    </div>
                    {sponsor.dependents.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Relationship</th>
                            <th className="p-2 text-left">Gender</th>
                            <th className="p-2 text-left">Age</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sponsor.dependents.map((dep) => (
                            <tr key={dep.id} className="border-t">
                              <td className="p-2">{dep.name}</td>
                              <td className="p-2">{dep.type}</td>
                              <td className="p-2">{dep.relationship}</td>
                              <td className="p-2">{dep.gender}</td>
                              <td className="p-2">{dep.age}</td>
                              <td className="p-2 flex gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openViewModal(dep)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModal(sponsor.id, dep)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteClick(sponsor.id, dep.id, dep.name)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="p-4 text-center text-gray-500">No dependents for this sponsor.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} dependents
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Dialog open={addModalOpen} onOpenChange={closeAddModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Dependent</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <Label>Search Sponsor by Personal Number</Label>
              <div className="flex gap-2">
                <Input
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
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
            </div>
            {formData.sponsor_id && (
              <>
                <DependentFormFields
                  formData={formData}
                  updateField={updateField}
                  updateNok={updateNok}
                  handlePhotoChange={handlePhotoChange}
                  photoPreview={photoPreview}
                  apiErrors={apiErrors}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={closeAddModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveClick}
                    className="bg-gray-900 hover:bg-gray-900 text-white"
                  >
                    Save Dependent
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={!!editModalData} onOpenChange={closeEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Dependent</DialogTitle>
            </DialogHeader>
            <DependentFormFields
              formData={formData}
              updateField={updateField}
              updateNok={updateNok}
              handlePhotoChange={handlePhotoChange}
              photoPreview={photoPreview}
              apiErrors={apiErrors}
            />
            <DialogFooter>
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                className="bg-gray-900 hover:bg-gray-900 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={!!viewModalData} onOpenChange={closeViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Dependent Details</DialogTitle>
            </DialogHeader>
            {viewModalData && (
              <PatientOverviewModalContent patientId={viewModalData.id} />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeViewModal}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Dependent</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteConfirm?.dependentName}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
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
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}