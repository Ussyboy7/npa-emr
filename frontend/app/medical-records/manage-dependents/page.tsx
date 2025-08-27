"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, CheckCircle, AlertCircle, Search, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Constants
const nameTitles = ["Mr", "Mrs", "Miss", "Master", "Engr", "Dr"];
const dependentRelationships = ["Spouse", "Child", "Parent", "Sibling", "Other"];
const genders = ["Male", "Female"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genotypes = ["AA", "AS", "SS", "AC", "SC"];
const nokRelationships = ["Spouse", "Child", "Parent", "Sibling", "Other"];
const dependentTypes = ["Employee Dependent", "Retiree Dependent"];

const dummyData = [
  {
    id: "EMP001",
    name: "John Doe",
    type: "Employee",
    dependents: [
      {
        id: "DEP001",
        title: "Miss",
        surname: "Doe",
        firstName: "Sarah",
        lastName: "Jane",
        name: "Sarah Jane Doe",
        relationship: "Child",
        age: 14,
        gender: "Female",
        registrationDate: "15/01/2024",
        type: "Employee Dependent",
        dob: "2010-02-14",
        maritalStatus: "Single",
        email: "sarah.doe@example.com",
        phone: "08012345678",
        address: "123 Main Street, Lagos",
        bloodGroup: "O+",
        genotype: "AA",
        nextOfKin: {
          firstName: "John",
          lastName: "Doe",
          relationship: "Parent",
          address: "123 Main Street, Lagos",
          phone: "08087654321",
        },
      },
      {
        id: "DEP002",
        title: "Master",
        surname: "Doe",
        firstName: "Michael",
        lastName: "James",
        name: "Michael James Doe",
        relationship: "Child",
        age: 12,
        gender: "Male",
        registrationDate: "15/01/2024",
        type: "Employee Dependent",
        dob: "2012-06-20",
        maritalStatus: "Single",
        email: "",
        phone: "",
        address: "123 Main Street, Lagos",
        bloodGroup: "O+",
        genotype: "AA",
        nextOfKin: {
          firstName: "John",
          lastName: "Doe",
          relationship: "Parent",
          address: "123 Main Street, Lagos",
          phone: "08087654321",
        },
      },
    ],
  },
  {
    id: "PEN001",
    name: "Mary Johnson",
    type: "Retiree",
    dependents: [],
  },
];

// Import PatientOverviewModalContent and adapt for dependent
import PatientOverviewModalContent from "@/components/medical-records/patientoverviewmodal"; // Assume this can be reused or adapted for dependent

// Reusable form fields component
const DependentFormFields = ({ formData, updateField, updateNok }) => (
  <div className="space-y-6">
    {/* Sponsor Information */}
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Sponsor Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <Label>Sponsor ID</Label>
          <Input value={formData.sponsorId} disabled className="bg-gray-50" />
        </div>
        <div>
          <Label>Dependent Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => updateField("type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {dependentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </fieldset>

    {/* Personal Details */}
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Personal Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Surname *</Label>
          <Input
            value={formData.surname}
            onChange={(e) => updateField("surname", e.target.value)}
            placeholder="Enter surname"
          />
        </div>
        <div>
          <Label>First Name *</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>
    </fieldset>

    {/* Work & Personal Information */}
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Work & Personal Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <Label>Relationship *</Label>
          <Select
            value={formData.relationship}
            onValueChange={(v) => updateField("relationship", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {dependentRelationships.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
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
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date of Birth *</Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <Label>Age</Label>
          <Input value={formData.age} disabled className="bg-gray-50" />
        </div>
      </div>
    </fieldset>

    {/* Contact Information */}
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Contact Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Phone number"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Residential address"
          />
        </div>
      </div>
    </fieldset>

    {/* Medical Details */}
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Medical Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
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
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </fieldset>

    {/* Next of Kin */}
    <fieldset className="p-4 border rounded">
      <legend className="font-semibold">Next of Kin</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.nextOfKin.phone}
            onChange={(e) => updateNok("phone", e.target.value)}
            placeholder="Phone number"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input
            value={formData.nextOfKin.address}
            onChange={(e) => updateNok("address", e.target.value)}
            placeholder="Address"
          />
        </div>
      </div>
    </fieldset>
  </div>
);

// Custom confirmation dialog component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>
          {message}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>
          Confirm
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default function DependentList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dependentsData, setDependentsData] = useState(dummyData);

  // Modal states
  const [addModalSponsorId, setAddModalSponsorId] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [viewModalData, setViewModalData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [updateConfirm, setUpdateConfirm] = useState(null);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Form state for add/edit (shared)
  const [formData, setFormData] = useState({
    sponsorId: "",
    type: "",
    title: "",
    surname: "",
    firstName: "",
    lastName: "",
    relationship: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    maritalStatus: "",
    email: "",
    phone: "",
    address: "",
    bloodGroup: "",
    genotype: "",
    nextOfKin: {
      firstName: "",
      lastName: "",
      relationship: "",
      address: "",
      phone: "",
    },
    id: "",
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate age from DOB with better handling
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (birthDate > today) return "0"; // Future date
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age).toString();
  };

  const updateField = (field, value) => {
    if (field === "dateOfBirth") {
      setFormData((f) => ({
        ...f,
        dateOfBirth: value,
        age: calculateAge(value),
      }));
    } else {
      setFormData((f) => ({ ...f, [field]: value }));
    }
  };

  const updateNok = (field, value) => {
    setFormData((f) => ({
      ...f,
      nextOfKin: { ...f.nextOfKin, [field]: value },
    }));
  };

  // Get dependent limit based on sponsor type
  const getDependentLimit = (sponsorType) => {
    return sponsorType === "Employee" ? 5 : 1;
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      sponsorId: "",
      type: "",
      title: "",
      surname: "",
      firstName: "",
      lastName: "",
      relationship: "",
      gender: "",
      dateOfBirth: "",
      age: "",
      maritalStatus: "",
      email: "",
      phone: "",
      address: "",
      bloodGroup: "",
      genotype: "",
      nextOfKin: {
        firstName: "",
        lastName: "",
        relationship: "",
        address: "",
        phone: "",
      },
      id: "",
    });
  };

  // Open Add Modal
  const openAddModal = (sponsorId) => {
    resetFormData();
    setFormData((f) => ({ ...f, sponsorId }));
    setAddModalSponsorId(sponsorId);
  };

  // Open Edit Modal
  const openEditModal = (sponsorId, dependent) => {
    setFormData({
      sponsorId,
      type: dependent.type,
      title: dependent.title,
      surname: dependent.surname,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship,
      gender: dependent.gender,
      dateOfBirth: dependent.dob,
      age: dependent.age.toString(),
      maritalStatus: dependent.maritalStatus,
      email: dependent.email,
      phone: dependent.phone,
      address: dependent.address,
      bloodGroup: dependent.bloodGroup,
      genotype: dependent.genotype,
      nextOfKin: { ...dependent.nextOfKin },
      id: dependent.id,
    });
    setEditModalData(dependent);
  };

  // Open View Modal
  const openViewModal = (dependent) => {
    setViewModalData(dependent);
  };

  // Close modals
  const closeAddModal = () => {
    setAddModalSponsorId(null);
    resetFormData();
  };

  const closeEditModal = () => {
    setEditModalData(null);
    resetFormData();
  };

  const closeViewModal = () => {
    setViewModalData(null);
  };

  // Save for Add and Edit
  const handleSaveClick = () => {
    const {
      sponsorId,
      type,
      surname,
      firstName,
      relationship,
      gender,
      dateOfBirth,
      age,
      email,
      id,
    } = formData;

    // Basic validation
    if (!sponsorId || !type || !surname || !firstName || !relationship || !gender || !dateOfBirth) {
      showNotification("Please fill all required fields (Surname, First Name, Relationship, Gender, Date of Birth).", "error");
      return;
    }

    // Email validation (if provided)
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    if (id) {
      setUpdateConfirm(true);
    } else {
      performSave();
    }
  };

  const performSave = () => {
    const {
      sponsorId,
      type,
      surname,
      firstName,
      relationship,
      gender,
      dateOfBirth,
      age,
      email,
      id,
    } = formData;

    const dependentData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      age: parseInt(age),
      dob: dateOfBirth,
    };

    if (id) {
      // Edit existing dependent
      setDependentsData((prev) =>
        prev.map((sponsor) => {
          if (sponsor.id === sponsorId) {
            return {
              ...sponsor,
              dependents: sponsor.dependents.map((dep) =>
                dep.id === id ? { ...dep, ...dependentData } : dep
              ),
            };
          }
          return sponsor;
        })
      );
      showNotification("Dependent updated successfully.");
      closeEditModal();
    } else {
      // Add new dependent
      const newDependent = {
        ...dependentData,
        id: `DEP${Date.now()}`,
        registrationDate: new Date().toLocaleDateString("en-GB"),
      };

      setDependentsData((prev) =>
        prev.map((sponsor) =>
          sponsor.id === sponsorId
            ? {
                ...sponsor,
                dependents: [...sponsor.dependents, newDependent],
              }
            : sponsor
        )
      );
      showNotification("Dependent added successfully.");
      closeAddModal();
    }
  };

  // Delete dependent handler
  const handleDeleteClick = (sponsorId, dependentId, dependentName) => {
    setDeleteConfirm({
      sponsorId,
      dependentId,
      dependentName,
    });
  };

  const confirmDelete = () => {
    const { sponsorId, dependentId } = deleteConfirm;
    setDependentsData((prev) =>
      prev.map((sponsor) =>
        sponsor.id === sponsorId
          ? {
              ...sponsor,
              dependents: sponsor.dependents.filter((dep) => dep.id !== dependentId),
            }
          : sponsor
      )
    );
    showNotification("Dependent deleted successfully.");
    setDeleteConfirm(null);
  };

  // Memoized filtered sponsors for performance
  const filteredSponsors = useMemo(() => {
    return dependentsData.filter((sponsor) => {
      const matchesSearch =
        sponsor.name.toLowerCase().includes(search.toLowerCase()) ||
        sponsor.dependents.some((dep) =>
          dep.name.toLowerCase().includes(search.toLowerCase())
        );

      const matchesType =
        typeFilter === "all" ||
        sponsor.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [dependentsData, search, typeFilter]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <Alert className={`${notification.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          {notification.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={notification.type === "error" ? "text-red-800" : "text-green-800"}>
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      <h1 className="text-3xl font-bold">Manage Dependents</h1>

      {/* Search and Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Search by sponsor or dependent name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Name or Personal Number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Filter by type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="retiree">Retiree</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sponsors and Dependents List */}
      <div className="space-y-6">
        {filteredSponsors.map((sponsor) => (
          <div key={sponsor.id} className="border rounded p-6 space-y-4">
            {/* Sponsor Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{sponsor.name}</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Patient ID:</span> {sponsor.id}</p>
                  <p><span className="font-medium">Type:</span> {sponsor.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Dependents: </span>
                  {sponsor.dependents.length}/{getDependentLimit(sponsor.type)}
                </div>
                {sponsor.dependents.length < getDependentLimit(sponsor.type) ? (
                  <div className="text-green-600 text-sm font-medium">Can add more</div>
                ) : (
                  <div className="text-red-600 text-sm font-medium">Limit reached</div>
                )}
              </div>
            </div>

            {/* Dependents Table */}
            {sponsor.dependents.length > 0 ? (
              <div className="border rounded overflow-hidden bg-card text-card-foreground">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        {["Patient ID", "Title", "Name", "Relationship", "DOB", "Age", "Gender", "Phone", "Actions"].map((col) => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {sponsor.dependents.map((dep) => (
                        <tr key={dep.id} className="hover:bg-muted/40">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{dep.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{dep.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{dep.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{dep.relationship}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{dep.dob}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{dep.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{dep.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{dep.phone || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openViewModal(dep)}
                                      className="hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Dependent Profile</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditModal(sponsor.id, dep)}
                                      className="hover:bg-green-50 hover:border-green-300"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Dependent</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteClick(sponsor.id, dep.id, dep.name)}
                                      className="text-red-500 hover:bg-red-50 hover:border-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Dependent</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border rounded overflow-hidden bg-card text-card-foreground">
                <div className="px-6 py-12 text-center">
                  <div className="text-muted-foreground">
                    <Search className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-medium mb-1">No dependents registered</p>
                    <p className="text-sm">
                      No dependents found for this sponsor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Dependent Button */}
            {sponsor.dependents.length < getDependentLimit(sponsor.type) && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => openAddModal(sponsor.id)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Dependent
                </Button>
              </div>
            )}
          </div>
        ))}

        {filteredSponsors.length === 0 && (
          <div className="border rounded overflow-hidden bg-card text-card-foreground">
            <div className="px-6 py-12 text-center">
              <div className="text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-1">No sponsors found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Dependent Modal */}
      <Dialog open={!!addModalSponsorId} onOpenChange={closeAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Dependent</DialogTitle>
          </DialogHeader>

          <DependentFormFields
            formData={formData}
            updateField={updateField}
            updateNok={updateNok}
          />

          <DialogFooter>
            <Button variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick}>Save Dependent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dependent Modal */}
      <Dialog open={!!editModalData} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Dependent</DialogTitle>
          </DialogHeader>

          <DependentFormFields
            formData={formData}
            updateField={updateField}
            updateNok={updateNok}
          />

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick}>Update Dependent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <AlertDialog open={updateConfirm} onOpenChange={setUpdateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Dependent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this dependent? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performSave}>
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Dependent Modal */}
      <Dialog open={!!viewModalData} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Dependent Profile Overview</DialogTitle>
          </DialogHeader>
          {viewModalData && (
            <PatientOverviewModalContent patientId={viewModalData.id} /> // Adapt as needed for dependent data
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}