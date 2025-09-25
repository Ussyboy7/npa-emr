"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, Search, Eye, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Constants from your register patient page and Django model
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

interface Dependent {
  id: string;
  patient_id: string;
  personal_number?: string;
  name: string;
  surname: string;
  first_name: string;
  last_name: string;
  title: string;
  relationship: string;
  age: number;
  gender: string;
  created_at: string;
  patient_type: "Dependent";
  dependent_type: "Employee Dependent" | "Retiree Dependent";
  date_of_birth: string;
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
  nok_first_name: string;
  nok_last_name: string;
  nok_relationship: string;
  nok_address: string;
  nok_phone: string;
  sponsor_id: string;
  photo?: string;
  photo_url?: string;
}

interface Sponsor {
  id: string;
  patient_id: string;
  personal_number: string;
  surname: string;
  first_name: string;
  last_name: string;
  patient_type: "Employee" | "Retiree";
  title: string;
  gender: string;
  age: number;
  email: string;
  phone: string;
  created_at: string;
  dependents: Dependent[];
  maxDependents: number;
  photo_url?: string;
}

const EMPTY_NOK: NextOfKin = {
  firstName: "",
  lastName: "",
  relationship: "",
  address: "",
  phone: "",
};

export default function ManageDependents() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sponsorsData, setSponsorsData] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState({
    add: false,
    edit: false,
    delete: false,
    fetch: false
  });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSponsors, setTotalSponsors] = useState(0);
  const pageSize = 20;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [currentDependent, setCurrentDependent] = useState<Dependent | null>(null);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  
  // Form state exactly matching your Django model
  const [formData, setFormData] = useState({
    // Basic sponsor info
    sponsorId: "",
    sponsorName: "",
    sponsorPersonalNumber: "",
    
    // Patient fields
    patient_type: "Dependent" as const,
    dependent_type: "" as "Employee Dependent" | "Retiree Dependent" | "",
    sponsor_id: "",
    title: "",
    surname: "",
    first_name: "",
    last_name: "",
    relationship: "",
    marital_status: "",
    gender: "",
    date_of_birth: "",
    age: "",
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
    
    // Next of Kin - matching Django field names
    nok_first_name: "",
    nok_last_name: "",
    nok_relationship: "",
    nok_address: "",
    nok_phone: "",
    
    // For editing
    id: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  const updateFormField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "date_of_birth") {
        next.age = calculateAge(String(value));
      }
      return next;
    });
  };

  // Handle photo upload with proper validation
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setDialogMessage("Photo size must be less than 2MB.");
        setShowErrorDialog(true);
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setDialogMessage("Photo must be an image file.");
        setShowErrorDialog(true);
        return;
      }
      
      setPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    } else {
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  // Reset form and all states
  const resetForm = () => {
    setFormData({
      sponsorId: "",
      sponsorName: "",
      sponsorPersonalNumber: "",
      patient_type: "Dependent",
      dependent_type: "",
      sponsor_id: "",
      title: "",
      surname: "",
      first_name: "",
      last_name: "",
      relationship: "",
      marital_status: "",
      gender: "",
      date_of_birth: "",
      age: "",
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
      nok_first_name: "",
      nok_last_name: "",
      nok_relationship: "",
      nok_address: "",
      nok_phone: "",
      id: "",
    });
    
    // Clean up photo preview URL to prevent memory leaks
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    
    setPhoto(null);
    setPhotoPreview(null);
    setApiErrors({});
  };

  // Close all modals and reset states
  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    resetForm();
    setCurrentDependent(null);
    setCurrentSponsor(null);
  };

  // Get authorization header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  };

  // Improved error handling for API calls
  const handleApiError = (error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    
    let errorMessage = `Failed to ${operation.toLowerCase()}`;
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setError(errorMessage);
    toast({ 
      title: "Error", 
      description: errorMessage, 
      variant: "destructive" 
    });
  };

  // Fetch sponsors and dependents from your Django API
  const fetchSponsorsAndDependents = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    setOperationLoading(prev => ({ ...prev, fetch: true }));
    setError(null);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // Fetch sponsors (Employees and Retirees) with pagination
      const sponsorParams = new URLSearchParams({
        patient_type: "Employee,Retiree",
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      const sponsorsRes = await fetch(`${baseURL}/api/patients/?${sponsorParams}`, {
        headers: getAuthHeaders(),
      });
      
      if (!sponsorsRes.ok) {
        throw new Error(`Failed to fetch sponsors (${sponsorsRes.status})`);
      }
      
      const sponsorsData = await sponsorsRes.json();
      const sponsors = sponsorsData.results || [];
      setTotalSponsors(sponsorsData.count || sponsors.length);
      
      if (!Array.isArray(sponsors)) {
        throw new Error("Invalid response format from sponsors API");
      }
      
      // Fetch all dependents in one call for better performance
      const dependentsRes = await fetch(`${baseURL}/api/patients/?patient_type=Dependent&page_size=1000`, {
        headers: getAuthHeaders(),
      });
      
      let allDependents: Dependent[] = [];
      if (dependentsRes.ok) {
        const dependentsData = await dependentsRes.json();
        const dependentsList = dependentsData.results || [];
        
        allDependents = dependentsList.map((dep: any): Dependent => ({
          id: dep.id,
          patient_id: dep.patient_id || "",
          personal_number: dep.personal_number || "",
          name: `${dep.surname || ''} ${dep.first_name || ''}`.trim(),
          surname: dep.surname || '',
          first_name: dep.first_name || '',
          last_name: dep.last_name || '',
          title: dep.title || '',
          relationship: dep.relationship || '',
          age: dep.age || 0,
          gender: dep.gender || '',
          created_at: dep.created_at || '',
          patient_type: "Dependent",
          dependent_type: dep.dependent_type as "Employee Dependent" | "Retiree Dependent",
          date_of_birth: dep.date_of_birth || '',
          marital_status: dep.marital_status || '',
          email: dep.email || '',
          phone: dep.phone || '',
          address: dep.address || '',
          residential_address: dep.residential_address || '',
          state_of_residence: dep.state_of_residence || '',
          permanent_address: dep.permanent_address || '',
          state_of_origin: dep.state_of_origin || '',
          local_government_area: dep.local_government_area || '',
          blood_group: dep.blood_group || '',
          genotype: dep.genotype || '',
          nok_first_name: dep.nok_first_name || '',
          nok_last_name: dep.nok_last_name || '',
          nok_relationship: dep.nok_relationship || '',
          nok_address: dep.nok_address || '',
          nok_phone: dep.nok_phone || '',
          sponsor_id: dep.sponsor_id || '',
          photo: dep.photo,
          photo_url: dep.photo_url,
        }));
      }
      
      // Map sponsors with their dependents
      const sponsorsWithDependents: Sponsor[] = sponsors.map((sponsor: any): Sponsor => {
        const sponsorDependents = allDependents.filter(dep => dep.sponsor_id === sponsor.id);
        
        return {
          id: sponsor.id,
          patient_id: sponsor.patient_id || "",
          personal_number: sponsor.personal_number || '',
          surname: sponsor.surname || '',
          first_name: sponsor.first_name || '',
          last_name: sponsor.last_name || '',
          patient_type: sponsor.patient_type,
          title: sponsor.title || '',
          gender: sponsor.gender || '',
          age: sponsor.age || 0,
          email: sponsor.email || '',
          phone: sponsor.phone || '',
          created_at: sponsor.created_at || '',
          dependents: sponsorDependents,
          maxDependents: sponsor.patient_type === "Employee" ? 5 : 1,
          photo_url: sponsor.photo_url,
        };
      });
      
      setSponsorsData(sponsorsWithDependents);
      
    } catch (error: any) {
      handleApiError(error, "fetch sponsors and dependents");
    } finally {
      setLoading(false);
      setOperationLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Fetch data on component mount and page change
  useEffect(() => {
    fetchSponsorsAndDependents();
  }, [currentPage]);

  // Open Add Modal with validation
  const openAddModal = (sponsor: Sponsor) => {
    if (!sponsor.id) {
      setDialogMessage("Invalid sponsor data. Please refresh and try again.");
      setShowErrorDialog(true);
      return;
    }
    
    if (sponsor.dependents.length >= sponsor.maxDependents) {
      setDialogMessage(`This ${sponsor.patient_type.toLowerCase()} has reached the maximum number of dependents (${sponsor.maxDependents}).`);
      setShowErrorDialog(true);
      return;
    }
    
    resetForm();
    // Fixed the error by defining the parameter explicitly
    setFormData(currentFormData => ({
      ...currentFormData,
      sponsorId: sponsor.id,
      sponsorName: `${sponsor.surname} ${sponsor.first_name}`.trim(),
      sponsorPersonalNumber: sponsor.personal_number,
      sponsor_id: sponsor.id,
      dependent_type: sponsor.patient_type === "Employee" ? "Employee Dependent" : "Retiree Dependent",
    }));
    setCurrentSponsor(sponsor);
    setShowAddModal(true);
  };

  // Open Edit Modal with proper field mapping
  const openEditModal = (sponsor: Sponsor, dependent: Dependent) => {
    if (!sponsor.id || !dependent.id) {
      setDialogMessage("Invalid data. Please refresh and try again.");
      setShowErrorDialog(true);
      return;
    }
    
    resetForm();
    
    // Map dependent data to form exactly matching Django model fields
    setFormData({
      sponsorId: sponsor.id,
      sponsorName: `${sponsor.surname} ${sponsor.first_name}`.trim(),
      sponsorPersonalNumber: sponsor.personal_number,
      patient_type: "Dependent",
      dependent_type: dependent.dependent_type,
      sponsor_id: dependent.sponsor_id,
      title: dependent.title,
      surname: dependent.surname,
      first_name: dependent.first_name,
      last_name: dependent.last_name,
      relationship: dependent.relationship,
      marital_status: dependent.marital_status,
      gender: dependent.gender,
      date_of_birth: dependent.date_of_birth,
      age: String(dependent.age),
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
      nok_first_name: dependent.nok_first_name,
      nok_last_name: dependent.nok_last_name,
      nok_relationship: dependent.nok_relationship,
      nok_address: dependent.nok_address,
      nok_phone: dependent.nok_phone,
      id: dependent.id,
    });
    
    // Set photo preview if available
    if (dependent.photo_url) {
      setPhotoPreview(dependent.photo_url);
    }
    
    setCurrentSponsor(sponsor);
    setCurrentDependent(dependent);
    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (dependent: Dependent) => {
    if (!dependent.id) {
      setDialogMessage("Invalid dependent data. Please refresh and try again.");
      setShowErrorDialog(true);
      return;
    }
    
    setCurrentDependent(dependent);
    setShowViewModal(true);
  };

  // Enhanced validation matching Django model requirements
  const validate = (): { ok: boolean; message?: string } => {
    const requiredFields = {
      surname: "Surname",
      first_name: "First Name",
      sponsor_id: "Sponsor",
      dependent_type: "Dependent Type",
      relationship: "Relationship",
      gender: "Gender",
      date_of_birth: "Date of Birth"
    };
    
    // Check required fields
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        return { ok: false, message: `${label} is required.` };
      }
    }
    
    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    
    // Photo validation
    if (photo && !photo.type.startsWith("image/")) {
      return { ok: false, message: "Photo must be an image file." };
    }
    
    // Date validation
    if (formData.date_of_birth && new Date(formData.date_of_birth) > new Date()) {
      return { ok: false, message: "Date of Birth cannot be in the future." };
    }
    
    // Age validation
    const age = parseInt(formData.age);
    if (age < 0 || age > 150) {
      return { ok: false, message: "Please enter a valid age." };
    }
    
    return { ok: true };
  };

  // Save dependent with proper Django model mapping
  const handleSave = async () => {
    const validation = validate();
    if (!validation.ok) {
      setDialogMessage(validation.message || "Please check all required fields.");
      setShowErrorDialog(true);
      return;
    }

    const isEdit = Boolean(formData.id);
    setOperationLoading(prev => ({ ...prev, [isEdit ? 'edit' : 'add']: true }));
    setApiErrors({});
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const formDataToSend = new FormData();
      
      // Map form data to Django model fields exactly
      formDataToSend.append("patient_type", formData.patient_type);
      formDataToSend.append("sponsor_id", formData.sponsor_id);
      formDataToSend.append("dependent_type", formData.dependent_type);
      formDataToSend.append("relationship", formData.relationship);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("surname", formData.surname);
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("marital_status", formData.marital_status);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("date_of_birth", formData.date_of_birth);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("residential_address", formData.residential_address);
      formDataToSend.append("state_of_residence", formData.state_of_residence);
      formDataToSend.append("permanent_address", formData.permanent_address);
      formDataToSend.append("state_of_origin", formData.state_of_origin);
      formDataToSend.append("local_government_area", formData.local_government_area);
      formDataToSend.append("blood_group", formData.blood_group);
      formDataToSend.append("genotype", formData.genotype);
      formDataToSend.append("nok_first_name", formData.nok_first_name);
      formDataToSend.append("nok_last_name", formData.nok_last_name);
      formDataToSend.append("nok_relationship", formData.nok_relationship);
      formDataToSend.append("nok_address", formData.nok_address);
      formDataToSend.append("nok_phone", formData.nok_phone);
      
      if (photo) {
        formDataToSend.append("photo", photo);
      }

      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${baseURL}/api/patients/${formData.id}/` : `${baseURL}/api/patients/`;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("API Error:", err);
        
        // Parse field-specific errors
        const fieldErrors: Record<string, string> = {};
        Object.entries(err).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setApiErrors(fieldErrors);
        
        const errorMsg = err.detail || 
          Object.values(fieldErrors).join(", ") || 
          `${isEdit ? 'Update' : 'Registration'} failed (Status: ${res.status})`;
        
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const successMsg = `Dependent ${isEdit ? 'updated' : 'registered'} successfully! Patient ID: ${data.patient_id}`;
      
      setDialogMessage(successMsg);
      setShowSuccessDialog(true);
      
      toast({
        title: "Success",
        description: successMsg,
      });

      closeAllModals();
      
      // Refresh data without showing loading state
      await fetchSponsorsAndDependents(false);
      
    } catch (error: any) {
      handleApiError(error, isEdit ? "update dependent" : "register dependent");
      setDialogMessage(error.message || `Failed to ${isEdit ? 'update' : 'register'} dependent.`);
      setShowErrorDialog(true);
    } finally {
      setOperationLoading(prev => ({ 
        ...prev, 
        [isEdit ? 'edit' : 'add']: false 
      }));
    }
  };

  // Delete dependent
  const handleDelete = async () => {
    if (!currentSponsor || !currentDependent) {
      setDialogMessage("Invalid selection. Please try again.");
      setShowErrorDialog(true);
      return;
    }

    setOperationLoading(prev => ({ ...prev, delete: true }));
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseURL}/api/patients/${currentDependent.id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Delete failed (Status: ${res.status})`);
      }

      toast({ 
        title: "Success", 
        description: `${currentDependent.name} has been deleted successfully.` 
      });
      
      setShowDeleteDialog(false);
      setCurrentDependent(null);
      setCurrentSponsor(null);
      
      // Refresh data
      await fetchSponsorsAndDependents(false);
      
    } catch (error: any) {
      handleApiError(error, "delete dependent");
      setDialogMessage(error.message || "Failed to delete dependent.");
      setShowErrorDialog(true);
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Filter sponsors with improved search
  const filteredSponsors = sponsorsData.filter(sponsor => {
    const searchLower = search.toLowerCase();
    const sponsorName = `${sponsor.surname} ${sponsor.first_name}`.toLowerCase();
    const personalNumber = sponsor.personal_number.toLowerCase();
    
    return (
      sponsorName.includes(searchLower) ||
      personalNumber.includes(searchLower) ||
      sponsor.dependents.some(dep => 
        dep.name.toLowerCase().includes(searchLower) ||
        dep.patient_id.toLowerCase().includes(searchLower) ||
        dep.relationship.toLowerCase().includes(searchLower)
      )
    );
  });

  const totalPages = Math.ceil(totalSponsors / pageSize);

  return (
    <Card className="max-w-7xl mx-auto shadow-xl overflow-y-auto max-h-screen">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <User className="h-8 w-8 text-blue-600" />
          Manage Dependents
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Manage dependents for employees (max 5) and retirees (max 1)
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  fetchSponsorsAndDependents();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sponsors or dependents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchSponsorsAndDependents()}
              disabled={operationLoading.fetch}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${operationLoading.fetch ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              {totalSponsors} sponsors total
            </Badge>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sponsors and dependents...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {sponsorsData.reduce((acc, sponsor) => acc + sponsor.dependents.length, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Dependents</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {sponsorsData.filter(s => s.dependents.length < s.maxDependents).length}
                    </div>
                    <div className="text-sm text-gray-500">Can Add More</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {sponsorsData.filter(s => s.dependents.length >= s.maxDependents).length}
                    </div>
                    <div className="text-sm text-gray-500">At Limit</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sponsors List */}
            <div className="space-y-6">
              {filteredSponsors.map((sponsor) => (
                <Card key={sponsor.id} className="border-2 hover:border-blue-200 transition-colors">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-white shadow-md">
                          {sponsor.photo_url ? (
                            <img 
                              src={sponsor.photo_url} 
                              alt={`${sponsor.surname} ${sponsor.first_name}`} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-800">
                            {sponsor.title} {sponsor.surname} {sponsor.first_name}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {sponsor.patient_type}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              <strong>ID:</strong> {sponsor.personal_number}
                            </span>
                            <span className="text-sm text-gray-600">
                              <strong>Patient ID:</strong> {sponsor.patient_id}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold mb-1">
                          <span className="text-blue-600">{sponsor.dependents.length}</span>
                          <span className="text-gray-400">/{sponsor.maxDependents}</span>
                        </div>
                        {sponsor.dependents.length < sponsor.maxDependents ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Plus className="h-3 w-3 mr-1" />
                            Can add {sponsor.maxDependents - sponsor.dependents.length} more
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Limit reached
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {sponsor.dependents.length > 0 ? (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b-2 border-gray-100">
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Photo</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Patient ID</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Name</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Relationship</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Age/Gender</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Type</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Registration</th>
                                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sponsor.dependents.map((dependent, index) => (
                                <tr 
                                  key={dependent.id} 
                                  className={`border-b hover:bg-blue-50 transition-colors ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  <td className="p-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                      {dependent.photo_url ? (
                                        <img 
                                          src={dependent.photo_url} 
                                          alt={dependent.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      ) : (
                                        <User className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                      {dependent.patient_id}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-medium text-gray-800">
                                      {dependent.title} {dependent.name}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="secondary" className="text-xs">
                                      {dependent.relationship}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="text-sm">
                                      <div>{dependent.age} years</div>
                                      <div className="text-gray-500">{dependent.gender}</div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline" className="text-xs">
                                      {dependent.dependent_type.replace(' Dependent', '')}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-sm text-gray-600">
                                    {dependent.created_at ? new Date(dependent.created_at).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openViewModal(dependent)}
                                        className="h-8 w-8 p-0"
                                        disabled={operationLoading.fetch}
                                        title="View Details"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditModal(sponsor, dependent)}
                                        className="h-8 w-8 p-0"
                                        disabled={operationLoading.edit}
                                        title="Edit"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setCurrentSponsor(sponsor);
                                          setCurrentDependent(dependent);
                                          setShowDeleteDialog(true);
                                        }}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        disabled={operationLoading.delete}
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No dependents registered</p>
                        <p className="text-gray-400 text-sm mt-2">This sponsor has no dependents yet</p>
                      </div>
                    )}

                    {/* Add Dependent Button */}
                    {sponsor.dependents.length < sponsor.maxDependents && (
                      <div className="mt-6 pt-4 border-t">
                        <Button
                          variant="default"
                          onClick={() => openAddModal(sponsor)}
                          className="w-full bg-gray-900 hover:bg-gray-900 text-white font-bold py-3"
                          disabled={operationLoading.add}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {operationLoading.add ? "Adding..." : `Add Dependent for ${sponsor.first_name}`}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredSponsors.length === 0 && (
              <div className="text-center py-16">
                <Search className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                <p className="text-gray-500 text-xl font-medium">No sponsors found</p>
                <p className="text-gray-400 mt-2">
                  {search ? "Try adjusting your search criteria" : "No sponsors available"}
                </p>
                {search && (
                  <Button
                    variant="outline"
                    onClick={() => setSearch("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={pageNum === currentPage ? "bg-blue-600 text-white" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        <Dialog 
          open={showAddModal || showEditModal} 
          onOpenChange={(open) => {
            if (!open && !operationLoading.add && !operationLoading.edit) {
              closeAllModals();
            }
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                {showAddModal ? "Register New Dependent" : "Edit Dependent"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
              {/* Sponsor Information */}
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                    <User className="h-5 w-5" />
                    Sponsor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Sponsor Name</Label>
                      <Input value={formData.sponsorName} disabled className="bg-white/70" />
                    </div>
                    <div>
                      <Label>Personal Number</Label>
                      <Input value={formData.sponsorPersonalNumber} disabled className="bg-white/70" />
                    </div>
                    <div>
                      <Label>Dependent Type</Label>
                      <Input value={formData.dependent_type} disabled className="bg-white/70" />
                      {apiErrors.dependent_type && (
                        <p className="text-red-500 text-sm mt-1">{apiErrors.dependent_type}</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Relationship to Sponsor *</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(v: string) => updateFormField("relationship", v)}
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
                      <p className="text-red-500 text-sm mt-1">{apiErrors.relationship}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:row-span-2 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-3 border-4 border-gray-100 shadow-md">
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
                          <label htmlFor="photo-upload">
                            <Plus className="h-4 w-4 mr-1" />
                            Upload Photo
                          </label>
                        </Button>
                      </Label>
                    </div>

                    <div>
                      <Label>Title</Label>
                      <Select
                        value={formData.title}
                        onValueChange={(v: string) => updateFormField("title", v)}
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
                      {apiErrors.title && <p className="text-red-500 text-sm mt-1">{apiErrors.title}</p>}
                    </div>

                    <div>
                      <Label>Surname *</Label>
                      <Input
                        value={formData.surname}
                        onChange={(e) => updateFormField("surname", e.target.value)}
                        placeholder="Surname"
                      />
                      {apiErrors.surname && <p className="text-red-500 text-sm mt-1">{apiErrors.surname}</p>}
                    </div>

                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateFormField("first_name", e.target.value)}
                        placeholder="First name"
                      />
                      {apiErrors.first_name && <p className="text-red-500 text-sm mt-1">{apiErrors.first_name}</p>}
                    </div>

                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateFormField("last_name", e.target.value)}
                        placeholder="Last name"
                      />
                      {apiErrors.last_name && <p className="text-red-500 text-sm mt-1">{apiErrors.last_name}</p>}
                    </div>

                    <div>
                      <Label>Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(v: string) => updateFormField("gender", v)}
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
                      {apiErrors.gender && <p className="text-red-500 text-sm mt-1">{apiErrors.gender}</p>}
                    </div>

                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateFormField("date_of_birth", e.target.value)}
                      />
                      {apiErrors.date_of_birth && (
                        <p className="text-red-500 text-sm mt-1">{apiErrors.date_of_birth}</p>
                      )}
                    </div>

                    <div>
                      <Label>Age</Label>
                      <Input value={formData.age} readOnly className="bg-gray-50" />
                    </div>

                    <div>
                      <Label>Marital Status</Label>
                      <Select
                        value={formData.marital_status}
                        onValueChange={(v: string) => updateFormField("marital_status", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {maritalStatuses.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {apiErrors.marital_status && (
                        <p className="text-red-500 text-sm mt-1">{apiErrors.marital_status}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-purple-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormField("email", e.target.value)}
                        placeholder="email@example.com"
                      />
                      {apiErrors.email && <p className="text-red-500 text-sm mt-1">{apiErrors.email}</p>}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateFormField("phone", e.target.value)}
                        placeholder="Phone number"
                      />
                      {apiErrors.phone && <p className="text-red-500 text-sm mt-1">{apiErrors.phone}</p>}
                    </div>
                    <div>
                      <Label>State of Residence</Label>
                      <Select
                        value={formData.state_of_residence}
                        onValueChange={(v: string) => updateFormField("state_of_residence", v)}
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
                      value={formData.residential_address}
                      onChange={(e) => updateFormField("residential_address", e.target.value)}
                      placeholder="Current residential address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>State of Origin</Label>
                      <Select
                        value={formData.state_of_origin}
                        onValueChange={(v: string) => updateFormField("state_of_origin", v)}
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
                        value={formData.local_government_area}
                        onChange={(e) => updateFormField("local_government_area", e.target.value)}
                        placeholder="LGA"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Permanent Address</Label>
                    <Input
                      value={formData.permanent_address}
                      onChange={(e) => updateFormField("permanent_address", e.target.value)}
                      placeholder="Permanent home address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Medical Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Blood Group</Label>
                      <Select
                        value={formData.blood_group}
                        onValueChange={(v: string) => updateFormField("blood_group", v)}
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
                        onValueChange={(v: string) => updateFormField("genotype", v)}
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
                  <CardTitle className="text-lg">Next of Kin Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={formData.nok_first_name}
                        onChange={(e) => updateFormField("nok_first_name", e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.nok_last_name}
                        onChange={(e) => updateFormField("nok_last_name", e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Select
                        value={formData.nok_relationship}
                        onValueChange={(v: string) => updateFormField("nok_relationship", v)}
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
                        value={formData.nok_address}
                        onChange={(e) => updateFormField("nok_address", e.target.value)}
                        placeholder="Address"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.nok_phone}
                        onChange={(e) => updateFormField("nok_phone", e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>

            <DialogFooter className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={closeAllModals}
                disabled={operationLoading.add || operationLoading.edit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={operationLoading.add || operationLoading.edit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {operationLoading.add || operationLoading.edit ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  showAddModal ? "Register Dependent" : "Update Dependent"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dependent Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Dependent Overview
              </DialogTitle>
            </DialogHeader>
            {currentDependent && (
              <div className="space-y-6">
                {/* Header with Photo and Basic Info */}
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                        {currentDependent.photo_url ? (
                          <img 
                            src={currentDependent.photo_url} 
                            alt={currentDependent.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {currentDependent.title} {currentDependent.name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Patient ID</Label>
                            <p className="font-mono text-sm bg-white px-2 py-1 rounded">
                              {currentDependent.patient_id}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Type</Label>
                            <Badge variant="secondary">
                              {currentDependent.dependent_type}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Relationship</Label>
                            <Badge variant="outline">
                              {currentDependent.relationship}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Age/Gender</Label>
                            <p className="font-medium">{currentDependent.age}y / {currentDependent.gender}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                        <p className="font-medium">{currentDependent.date_of_birth || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Marital Status</Label>
                        <p className="font-medium">{currentDependent.marital_status || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                        <p className="font-medium">
                          {currentDependent.created_at ? 
                            new Date(currentDependent.created_at).toLocaleDateString() : 
                            "Not available"
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="font-medium">{currentDependent.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="font-medium">{currentDependent.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">State of Residence</Label>
                        <p className="font-medium">{currentDependent.state_of_residence || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Residential Address</Label>
                      <p className="font-medium">{currentDependent.residential_address || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Permanent Address</Label>
                      <p className="font-medium">{currentDependent.permanent_address || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">State of Origin</Label>
                      <p className="font-medium">{currentDependent.state_of_origin || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">LGA</Label>
                      <p className="font-medium">{currentDependent.local_government_area || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Medical Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Blood Group</Label>
                        <p className="font-medium">{currentDependent.blood_group || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Genotype</Label>
                        <p className="font-medium">{currentDependent.genotype || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next of Kin */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next of Kin</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                        <p className="font-medium">
                          {currentDependent.nok_first_name || currentDependent.nok_last_name
                            ? `${currentDependent.nok_first_name} ${currentDependent.nok_last_name}`.trim()
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Relationship</Label>
                        <p className="font-medium">{currentDependent.nok_relationship || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="font-medium">{currentDependent.nok_phone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <p className="font-medium">{currentDependent.nok_address || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <DialogFooter className="pt-6 border-t">
              <Button onClick={() => setShowViewModal(false)} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete{" "}
                <strong>{currentDependent?.name}</strong>?
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  Patient ID: {currentDependent?.patient_id}
                </span>
                <br />
                This action cannot be undone and will permanently remove this dependent from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={operationLoading.delete}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={operationLoading.delete}
                className="bg-red-600 hover:bg-red-700"
              >
                {operationLoading.delete ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete Dependent"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-green-700">
                <User className="h-5 w-5" />
                Success
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {dialogMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => setShowSuccessDialog(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Error
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {dialogMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => setShowErrorDialog(false)}
                className="bg-red-600 hover:bg-red-700"
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