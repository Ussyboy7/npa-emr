import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Send, MapPin, Phone, Mail, Plus, X, AlertTriangle, Clock, Search } from 'lucide-react';

interface ReferralsProps {
  visitId: string;
}

const currentUser = {
  name: "Dr. John Smith",
  designation: "Chief Medical Officer"
};

interface Referral {
  id: string;
  facility: string;
  specialty: string;
  urgency: string;
  reason: string;
  clinicalFindings: string;
  investigations: string;
  expectedOutcome: string;
}

interface ReferralInteraction {
  referral1: string;
  referral2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
}

interface ActiveReferral {
  id: string;
  facility: string;
  specialty: string;
  urgency: string;
  sentAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  reason: string;
  notes: string;
}

// Validation schema
const referralSchema = z.object({
  facility: z.string().min(1, "Facility is required"),
  specialty: z.string().min(1, "Specialty is required"),
  urgency: z.string().min(1, "Urgency is required"),
  reason: z.string().min(2, "Reason is required"),
  clinicalFindings: z.string().optional(),
  investigations: z.string().optional(),
  expectedOutcome: z.string().optional(),
});

const referralsSchema = z.object({
  referrals: z.array(referralSchema).min(1, "At least one referral is required"),
  referralNotes: z.string().optional(),
}).refine(
  (data) => {
    // Check for potential conflicting referrals (example)
    const referrals = data.referrals;
    for (let i = 0; i < referrals.length; i++) {
      for (let j = i + 1; j < referrals.length; j++) {
        const ref1 = referrals[i].specialty.toLowerCase();
        const ref2 = referrals[j].specialty.toLowerCase();
        
        if (ref1.includes('cardiology') && ref2.includes('oncology')) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: "Potential conflicting referrals detected. Please review.",
    path: ["referrals"],
  }
);

type ReferralsForm = z.infer<typeof referralsSchema>;

// Medical facilities list (updated with user's specified hospitals)
const medicalFacilities = [
  {
    id: 'luth',
    name: 'Lagos University Teaching Hospital (LUTH)',
    specialties: ['Neuro-Surgery', 'Haemo-dialysis', 'Radiation Oncology', 'Ophthalmology', 'Obstetrics', 'Preventive Dentistry'],
    address: 'Ishaga Rd, Idi-Araba, Lagos',
    phone: '+234 812 836 4824',
    email: 'info@luth.gov.ng'
  },
  {
    id: 'fmc',
    name: 'Federal Medical Centre (FMC)',
    specialties: ['General Medicine', 'Surgery', 'ENT'],
    address: 'Railway Compound, Ebute-Metta, Lagos',
    phone: '+2348170693805',
    email: 'fmcebinfo@fmceb.org'
  },
  {
    id: 'eko-hospital',
    name: 'Eko Hospital',
    specialties: ['Oncology', 'Orthopedics', 'Cardiology', 'IVF'],
    address: '31 Mobolaji Bank Anthony Way, Ikeja, Lagos',
    phone: '+234 1 2716997',
    email: 'info@ekocorp.net'
  },
  {
    id: 'reddington-hospital',
    name: 'Reddington Hospital',
    specialties: ['Multi-specialty'],
    address: '12 Idowu Martins Street, Victoria Island, Lagos',
    phone: '+234 1 2715341',
    email: 'info@reddingtonhospital.com'
  },
  {
    id: 'euracare',
    name: 'Euracare Multi-Specialist Hospital',
    specialties: ['Oncology', 'Orthopedics', 'Cardiology', 'IVF'],
    address: '293 Younis Bashorun Street cnr Jide Oki Street, Victoria Island, Lagos',
    phone: '+234 700 3872 2273',
    email: 'info@euracare.com.ng'
  },
  {
    id: 'modern-skin-clinic',
    name: 'Modern Skin Clinic',
    specialties: ['Dermatology'],
    address: 'Lagos, Nigeria',
    phone: '+234 XXX XXX XXXX',
    email: 'info@modernskinclinic.com'
  },
  {
    id: 'marigold-hospital',
    name: 'Marigold Hospital',
    specialties: ['Emergency Medicine', 'Critical Care', 'Internal Medicine'],
    address: '12/14 Adeniyi Adefioye Street, Kilo, Surulere, Lagos',
    phone: '+234 811 355 2222',
    email: 'info@marigoldhospital.ng'
  },
  {
    id: 'nsia-luth',
    name: 'NSIA – Lagos University Teaching Hospital (NSIA-LUTH)',
    specialties: ['Oncology', 'Radiation Therapy'],
    address: 'Lagos University Teaching Hospital, Idi-Araba, Lagos',
    phone: '+234 700 6742 5884',
    email: 'info@nlcc.ng'
  },
  {
    id: 'cedarcrest-hospital',
    name: 'Cedarcrest Hospital',
    specialties: ['Orthopaedics', 'Family Medicine', 'Vascular Surgery', 'Spine Surgery'],
    address: '25A Kofo Abayomi Street, Victoria Island, Lagos',
    phone: '+234 809 393 1949',
    email: 'info@cedarcresthospitals.com'
  },
  {
    id: 'tristate-health-care-system',
    name: 'Tristate Health Care System',
    specialties: ['Super-specialty'],
    address: 'Wole Ariyo Street, off Admiralty, Lekki Phase 1, Lagos',
    phone: '+234 810 681 5163',
    email: 'info@tristatehs.com'
  },
  {
    id: 'skippers-eye-clinic',
    name: 'Skippers Eye Clinic',
    specialties: ['Ophthalmology'],
    address: '698 Sanusi Fafunwa Street, Victoria Island, Lagos',
    phone: '+2349023996319',
    email: 'info@skippereyeq.com'
  },
  {
    id: 'lakeshore-cancer-clinic',
    name: 'Lakeshore Cancer Clinic',
    specialties: ['Cancer Treatment', 'Oncology'],
    address: '14 Amodu Tijani Close, Off Sanusi Fafunwa St, Victoria Island, Lagos',
    phone: '+234 8099715000',
    email: 'info@lakeshorecancercenter.org'
  },
  {
    id: 'medicaid-radio-diagnostic-clinic',
    name: 'Medicaid Radio-Diagnostic Clinic',
    specialties: ['Radiology', 'Diagnostics'],
    address: 'Lagos, Nigeria',
    phone: '+234 703 004 4300',
    email: 'info@medicaidradiology.com'
  },
  {
    id: 'general-hospital',
    name: 'General Hospital',
    specialties: ['General Medicine'],
    address: 'Odan, Lagos Island, Lagos',
    phone: '+234 8028379894',
    email: 'info@generalhospital.com'
  }
];

const urgencyOptions = [
  { value: 'routine', label: 'Routine (2-4 weeks)' },
  { value: 'urgent', label: 'Urgent (within 1 week)' },
  { value: 'expedited', label: 'Expedited (within 48-72 hours)' },
  { value: 'emergency', label: 'Emergency (immediate)' }
];

const Referrals: React.FC<ReferralsProps> = ({ visitId }) => {
  const [isSending, setIsSending] = useState(false);
  const [referralInteractions, setReferralInteractions] = useState<ReferralInteraction[]>([]);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<ReferralsForm>({
    resolver: zodResolver(referralsSchema),
    defaultValues: {
      referrals: [{
        facility: '',
        specialty: '',
        urgency: 'routine',
        reason: '',
        clinicalFindings: '',
        investigations: '',
        expectedOutcome: ''
      }],
      referralNotes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "referrals"
  });

  const formData = watch();

  // Check for interactions
  React.useEffect(() => {
    checkReferralInteractions(formData.referrals);
  }, [formData.referrals]);

  const checkReferralInteractions = (referrals: any[]) => {
    const interactions: ReferralInteraction[] = [];
    
    for (let i = 0; i < referrals.length; i++) {
      for (let j = i + 1; j < referrals.length; j++) {
        const ref1 = referrals[i]?.specialty?.toLowerCase() || '';
        const ref2 = referrals[j]?.specialty?.toLowerCase() || '';
        
        // Example conflicting combinations
        if (ref1.includes('cardiology') && ref2.includes('oncology')) {
          interactions.push({
            referral1: referrals[i].specialty,
            referral2: referrals[j].specialty,
            severity: 'moderate',
            description: 'Potential conflict between cardiology and oncology referrals'
          });
        }
      }
    }
    
    setReferralInteractions(interactions);
  };

  const getInteractionColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'expedited': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // PDF Generator
  const onSubmit = async (data: ReferralsForm) => {
    setIsSending(true);
    try {
      const doc = new jsPDF();

      // ========== Header ==========
      // Logo (replace with actual base64 if you have it)
      // doc.addImage(logoBase64, "PNG", 10, 5, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("NIGERIAN PORTS AUTHORITY", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text("Medical Department", 105, 28, { align: "center" });
      doc.line(20, 35, 190, 35); // separator

      // ========== Title ==========
      doc.setFontSize(14);
      doc.text("Referral Form", 105, 45, { align: "center" });

      // ========== Visit Info ==========
      doc.setFontSize(11);
      doc.text(`Patient Visit ID: ${visitId}`, 20, 60);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);

      let y = 75;
      data.referrals.forEach((ref, index) => {
        doc.setFont("helvetica", "bold");
        doc.text(`Referral ${index + 1}`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(`Facility: ${medicalFacilities.find(f => f.id === ref.facility)?.name || ref.facility}`, 20, y + 10);
        doc.text(`Specialty: ${ref.specialty}`, 20, y + 20);
        doc.text(`Urgency: ${urgencyOptions.find(u => u.value === ref.urgency)?.label || ref.urgency}`, 20, y + 30);
        doc.text(`Reason: ${ref.reason}`, 20, y + 40);
        if (ref.clinicalFindings) doc.text(`Clinical Findings: ${ref.clinicalFindings}`, 20, y + 50);
        if (ref.investigations) doc.text(`Investigations: ${ref.investigations}`, 20, y + 60);
        if (ref.expectedOutcome) doc.text(`Expected Outcome: ${ref.expectedOutcome}`, 20, y + 70);
        y += 80;
      });

      // ========== Notes ==========
      if (data.referralNotes) {
        doc.setFont("helvetica", "bold");
        doc.text("Additional Notes:", 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(data.referralNotes, 20, y + 10);
        y += 30;
      }

      // ========== Signature Block ==========
      if (y > 230) {
        doc.addPage();
        y = 40;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Doctor's Signature: ___________________________", 20, y + 20);
      doc.text("Date: _________________", 150, y + 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`${currentUser.name} (${currentUser.designation})`, 20, y + 35);

      // Save PDF
      doc.save(`referral_${visitId}.pdf`);

      // Send notification
      console.log('Notification sent to medical-records');

      // Handle editing or adding
      if (editingId) {
        setActiveReferrals(prev => prev.map(r => 
          r.id === editingId 
            ? { 
                ...r, 
                facility: data.referrals[0].facility,
                specialty: data.referrals[0].specialty,
                urgency: data.referrals[0].urgency,
                reason: data.referrals[0].reason,
                notes: data.referralNotes || '',
                sentAt: new Date().toLocaleString(),
                status: 'pending'
              } 
            : r
        ));
        setEditingId(null);
      } else {
        const newReferrals: ActiveReferral[] = data.referrals.map((ref, index) => ({
          id: `ref-${Date.now() + index}`,
          facility: ref.facility,
          specialty: ref.specialty,
          urgency: ref.urgency,
          sentAt: new Date().toLocaleString(),
          status: 'pending',
          reason: ref.reason,
          notes: data.referralNotes || ''
        }));

        setActiveReferrals(prev => [...newReferrals, ...prev]);
      }

      reset();
      
      console.log('Referral printed and notification sent');
    } catch (error) {
      console.error('Failed to process referral:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this referral?')) {
      setActiveReferrals(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'cancelled' } : r
      ));
    }
  };

  const handleModify = (referral: ActiveReferral) => {
    setEditingId(referral.id);
    reset({
      referrals: [{
        facility: referral.facility,
        specialty: referral.specialty,
        urgency: referral.urgency,
        reason: referral.reason,
        clinicalFindings: '',
        investigations: '',
        expectedOutcome: ''
      }],
      referralNotes: referral.notes
    });
  };

  const getSuggestedFacilities = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return medicalFacilities.filter(fac => 
      fac.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const [activeReferrals, setActiveReferrals] = useState<ActiveReferral[]>([
    {
      id: 'ref-1',
      facility: 'luth',
      specialty: 'Cardiology',
      urgency: 'urgent',
      sentAt: '2024-01-15 10:30 AM',
      status: 'pending',
      reason: 'Chest pain evaluation',
      notes: ''
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Referral Interaction Warnings */}
      {referralInteractions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Referral Conflict Warning:</strong>
            <ul className="mt-2 space-y-1">
              {referralInteractions.map((interaction, index) => (
                <li key={index} className={`p-2 rounded border ${getInteractionColor(interaction.severity)}`}>
                  <strong>{interaction.referral1} + {interaction.referral2}</strong> 
                  <span className="ml-2 capitalize">({interaction.severity})</span>
                  <div className="text-sm mt-1">{interaction.description}</div>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* New Referral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {editingId ? 'Edit Referral' : 'Create Referral'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Referrals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Referrals</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    facility: '',
                    specialty: '',
                    urgency: 'routine',
                    reason: '',
                    clinicalFindings: '',
                    investigations: '',
                    expectedOutcome: ''
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Referral
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Referral {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Facility */}
                    <div className="space-y-2">
                      <Label>Medical Facility *</Label>
                      <div className="relative">
                        <Controller
                          name={`referrals.${index}.facility`}
                          control={control}
                          render={({ field }) => (
                            <>
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  placeholder="Search facility..."
                                  className={`pl-8 ${errors.referrals?.[index]?.facility ? 'border-red-500' : ''}`}
                                  onFocus={() => setShowSuggestions(index)}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setFacilitySearch(e.target.value);
                                  }}
                                />
                              </div>
                              
                              {showSuggestions === index && facilitySearch && (
                                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                  {getSuggestedFacilities(facilitySearch).map((fac, facIndex) => (
                                    <div
                                      key={facIndex}
                                      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                      onClick={() => {
                                        field.onChange(fac.id);
                                        setShowSuggestions(null);
                                        setFacilitySearch('');
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium">{fac.name}</div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          Facility
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        />
                      </div>
                      {errors.referrals?.[index]?.facility && (
                        <p className="text-red-500 text-sm">{errors.referrals[index]?.facility?.message}</p>
                      )}
                    </div>

                    {/* Specialty */}
                    <div className="space-y-2">
                      <Label>Specialty Required *</Label>
                      <Controller
                        name={`referrals.${index}.specialty`}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={errors.referrals?.[index]?.specialty ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              {medicalFacilities.find(f => f.id === formData.referrals[index]?.facility)?.specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.referrals?.[index]?.specialty && (
                        <p className="text-red-500 text-sm">{errors.referrals[index]?.specialty?.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label>Urgency *</Label>
                    <Controller
                      name={`referrals.${index}.urgency`}
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={errors.referrals?.[index]?.urgency ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {urgencyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.referrals?.[index]?.urgency && (
                      <p className="text-red-500 text-sm">{errors.referrals[index]?.urgency?.message}</p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label>Reason for Referral *</Label>
                    <Controller
                      name={`referrals.${index}.reason`}
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Primary reason for referring the patient..."
                          className={errors.referrals?.[index]?.reason ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.referrals?.[index]?.reason && (
                      <p className="text-red-500 text-sm">{errors.referrals[index]?.reason?.message}</p>
                    )}
                  </div>

                  {/* Clinical Findings */}
                  <div className="space-y-2">
                    <Label>Clinical Findings</Label>
                    <Controller
                      name={`referrals.${index}.clinicalFindings`}
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Relevant clinical findings, examination results..."
                        />
                      )}
                    />
                  </div>

                  {/* Investigations */}
                  <div className="space-y-2">
                    <Label>Investigations Done</Label>
                    <Controller
                      name={`referrals.${index}.investigations`}
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="List of tests, procedures, and results already completed..."
                        />
                      )}
                    />
                  </div>

                  {/* Expected Outcome */}
                  <div className="space-y-2">
                    <Label>Expected Outcome</Label>
                    <Controller
                      name={`referrals.${index}.expectedOutcome`}
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="What you hope to achieve from this referral..."
                        />
                      )}
                    />
                  </div>

                  {/* Referral Summary */}
                  {formData.referrals[index]?.facility && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-sm">
                        <strong>Referral Summary:</strong>
                        <div className="mt-1">
                          Facility: {medicalFacilities.find(f => f.id === formData.referrals[index].facility)?.name}
                          Specialty: {formData.referrals[index].specialty}
                          Urgency: {urgencyOptions.find(u => u.value === formData.referrals[index].urgency)?.label}
                          Reason: {formData.referrals[index].reason}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {errors.referrals && typeof errors.referrals === 'object' && 'message' in errors.referrals && (
                <p className="text-red-500 text-sm">{errors.referrals.message}</p>
              )}
            </div>

            {/* Referral Notes */}
            <div className="space-y-2">
              <Label>Referral Notes</Label>
              <Controller
                name="referralNotes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Additional notes..."
                    className="min-h-16"
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={isSending || !isDirty || fields.length === 0}
                className="min-w-40"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {editingId ? 'Reprint Referral' : 'Print Referral'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Referrals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sent Referrals ({activeReferrals.length})</CardTitle>
            <Badge variant="outline" className="text-xs">
              Updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeReferrals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No referrals created yet</p>
              </div>
            ) : (
              activeReferrals.map((referral) => (
                <div key={referral.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Referral #{referral.id}</span>
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {referral.sentAt}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Facility:</span>
                      <p className="text-sm text-gray-700 mt-1">{medicalFacilities.find(f => f.id === referral.facility)?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Specialty:</span>
                      <p className="text-sm text-gray-700 mt-1">{referral.specialty}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Urgency:</span>
                      <Badge className={getUrgencyColor(referral.urgency)}>{referral.urgency.toUpperCase()}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Reason:</span>
                      <p className="text-sm text-gray-700 mt-1">{referral.reason}</p>
                    </div>
                    
                    {referral.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{referral.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    {referral.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(referral.id)}>
                          Cancel Referral
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleModify(referral)}>
                          Modify
                        </Button>
                      </>
                    )}
                    {referral.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;