"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pill, Send, Plus, X, AlertTriangle, Clock, Search, CheckCircle, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PrescriptionsProps {
  visitId: string;
}

interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  strength: string;
  dosage_form: string;
  category: string;
  current_stock: number;
  prescription_required: boolean;
  is_generic: boolean;
}

interface PrescriptionItem {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  quantity: number;
  instructions: string;
}

interface Prescription {
  id: string;
  items: PrescriptionItem[];
  status: string;
  created_at: string;
  prescribed_by_name: string;
  notes: string;
  total_items: number;
  available_items: number;
  out_of_stock_items: number;
  dispensed_items: number;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'Minor' | 'Moderate' | 'Major';
  description: string;
  recommendation: string;
}

// Validation schema
const medicationSchema = z.object({
  medication: z.string().min(1, "Medication is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  route: z.enum(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'rectal', 'sublingual']),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  items: z.array(medicationSchema).min(1, "At least one medication is required"),
  notes: z.string().optional(),
});

type PrescriptionForm = z.infer<typeof prescriptionSchema>;

const frequencyOptions = [
  { value: 'once_daily', label: 'Once daily', abbreviation: 'OD' },
  { value: 'twice_daily', label: 'Twice daily', abbreviation: 'BD' },
  { value: 'three_times_daily', label: 'Three times daily', abbreviation: 'TDS' },
  { value: 'four_times_daily', label: 'Four times daily', abbreviation: 'QDS' },
  { value: 'every_4_hours', label: 'Every 4 hours', abbreviation: '4hrly' },
  { value: 'every_6_hours', label: 'Every 6 hours', abbreviation: '6hrly' },
  { value: 'every_8_hours', label: 'Every 8 hours', abbreviation: '8hrly' },
  { value: 'as_needed', label: 'As needed', abbreviation: 'PRN' },
  { value: 'before_meals', label: 'Before meals', abbreviation: 'AC' },
  { value: 'after_meals', label: 'After meals', abbreviation: 'PC' },
  { value: 'at_bedtime', label: 'At bedtime', abbreviation: 'HS' },
];

const routeOptions = [
  { value: 'oral', label: 'Oral (by mouth)', abbreviation: 'PO' },
  { value: 'intravenous', label: 'Intravenous', abbreviation: 'IV' },
  { value: 'intramuscular', label: 'Intramuscular', abbreviation: 'IM' },
  { value: 'subcutaneous', label: 'Subcutaneous', abbreviation: 'SC' },
  { value: 'topical', label: 'Topical', abbreviation: 'TOP' },
  { value: 'inhalation', label: 'Inhalation', abbreviation: 'INH' },
  { value: 'rectal', label: 'Rectal', abbreviation: 'PR' },
  { value: 'sublingual', label: 'Sublingual', abbreviation: 'SL' },
];

const Prescriptions: React.FC<PrescriptionsProps> = ({ visitId }) => {
  const [existingPrescriptions, setExistingPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<PrescriptionForm>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      items: [{
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        route: 'oral',
        quantity: 1,
        instructions: ''
      }],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const formData = watch();

  // Fetch existing prescriptions for this visit
  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/prescriptions/?visit=${visitId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ensure each prescription has an items array
        const prescriptionsWithItems = (data.results || data).map((prescription: any) => ({
          ...prescription,
          items: prescription.items || []
        }));
        setExistingPrescriptions(prescriptionsWithItems);
      } else {
        console.error('Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  // Fetch available medications
  const fetchMedications = async (search = '') => {
    try {
      const url = search 
        ? `${API_URL}/api/medications/?search=${encodeURIComponent(search)}`
        : `${API_URL}/api/medications/`;
      
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedications(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  // Check for drug interactions
  const checkDrugInteractions = async (medicationIds: string[]) => {
    if (medicationIds.length < 2) {
      setDrugInteractions([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/medications/check-interactions/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ medication_ids: medicationIds })
      });

      if (response.ok) {
        const data = await response.json();
        setDrugInteractions(data.interactions || []);
      }
    } catch (error) {
      console.error('Error checking drug interactions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPrescriptions(),
        fetchMedications()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [visitId]);

  // Check interactions when medications change
  useEffect(() => {
    const selectedMedications = formData.items
      .filter(item => item.medication)
      .map(item => item.medication);
    
    checkDrugInteractions(selectedMedications);
  }, [formData.items]);

  const onSubmit = async (data: PrescriptionForm) => {
    setIsSending(true);
    
    try {
      const prescriptionData = {
        visit: visitId,
        items: data.items,
        notes: data.notes || '',
        priority: 'Medium' // Could be dynamic based on consultation
      };

      const response = await fetch(`${API_URL}/api/prescriptions/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prescriptionData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh prescriptions list
        await fetchPrescriptions();
        
        // Reset form
        reset();
        setEditingId(null);
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Redirect to pharmacy queue after a short delay
        setTimeout(() => {
          window.location.href = '/pharmacy-queue';
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Failed to create prescription:', errorData);
        alert('Failed to send prescription to pharmacy. Please try again.');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to send prescription to pharmacy. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = async (prescriptionId: string) => {
    if (confirm('Are you sure you want to cancel this prescription?')) {
      try {
        const response = await fetch(`${API_URL}/api/prescriptions/${prescriptionId}/`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: 'Cancelled' })
        });

        if (response.ok) {
          await fetchPrescriptions();
          alert('Prescription cancelled successfully');
        }
      } catch (error) {
        console.error('Error cancelling prescription:', error);
        alert('Failed to cancel prescription');
      }
    }
  };

  const getSuggestedMedications = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return medications.filter(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading prescriptions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p>Prescription sent to pharmacy successfully! Redirecting to queue...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drug Interaction Warnings */}
      {drugInteractions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Drug Interaction Warning:</strong>
            <ul className="mt-2 space-y-1">
              {drugInteractions.map((interaction, index) => (
                <li key={index} className={`p-2 rounded border ${
                  interaction.severity === 'Major' ? 'bg-red-100 border-red-200' : 
                  interaction.severity === 'Moderate' ? 'bg-yellow-100 border-yellow-200' : 
                  'bg-blue-100 border-blue-200'
                }`}>
                  <strong>{interaction.drug1} + {interaction.drug2}</strong> 
                  <span className="ml-2 capitalize">({interaction.severity})</span>
                  <div className="text-sm mt-1">{interaction.description}</div>
                  <div className="text-sm mt-1 font-medium">Recommendation: {interaction.recommendation}</div>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* New Prescription Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {editingId ? 'Edit Prescription' : 'Create Prescription'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Medications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    medication: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    route: 'oral',
                    quantity: 1,
                    instructions: ''
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medication {index + 1}</h4>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`items.${index}.medication`}>Medication *</Label>
                      <Controller
                        name={`items.${index}.medication`}
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              className="pl-10"
                              placeholder="Search medications..."
                              onChange={(e) => {
                                field.onChange(e);
                                setMedicationSearch(e.target.value);
                                setShowSuggestions(index);
                              }}
                              onFocus={() => setShowSuggestions(index)}
                            />
                            {showSuggestions === index && medicationSearch && (
                              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {getSuggestedMedications(medicationSearch).map((med) => (
                                  <div
                                    key={med.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setValue(`items.${index}.medication`, med.id);
                                      setShowSuggestions(null);
                                      setMedicationSearch('');
                                    }}
                                  >
                                    {med.name} {med.strength} - {med.dosage_form}
                                  </div>
                                ))}
                                {getSuggestedMedications(medicationSearch).length === 0 && (
                                  <div className="p-2 text-gray-500">No medications found</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      />
                      {errors.items?.[index]?.medication && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.medication?.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`items.${index}.dosage`}>Dosage *</Label>
                      <Input
                        {...control.register(`items.${index}.dosage`)}
                        placeholder="e.g., 500mg"
                      />
                      {errors.items?.[index]?.dosage && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.dosage?.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`items.${index}.frequency`}>Frequency *</Label>
                      <Controller
                        name={`items.${index}.frequency`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label} ({option.abbreviation})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.items?.[index]?.frequency && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.frequency?.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`items.${index}.duration`}>Duration *</Label>
                      <Input
                        {...control.register(`items.${index}.duration`)}
                        placeholder="e.g., 7 days"
                      />
                      {errors.items?.[index]?.duration && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.duration?.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`items.${index}.route`}>Route *</Label>
                      <Controller
                        name={`items.${index}.route`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select route" />
                            </SelectTrigger>
                            <SelectContent>
                              {routeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label} ({option.abbreviation})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.items?.[index]?.route && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.route?.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                      <Input
                        type="number"
                        {...control.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        min="1"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.instructions`}>Instructions</Label>
                    <Textarea
                      {...control.register(`items.${index}.instructions`)}
                      placeholder="Additional instructions"
                    />
                  </div>
                </div>
              ))}

              {errors.items && (
                <p className="text-red-500 text-xs mt-1">{errors.items.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Prescription Notes</Label>
              <Textarea
                {...control.register("notes")}
                placeholder="Any additional notes for the pharmacy"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isSending || !isDirty}>
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send to Pharmacy'}
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Prescriptions */}
      {existingPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Existing Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {existingPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Prescription #{prescription.id.slice(-6)}</h4>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(prescription.created_at).toLocaleString()} by {prescription.prescribed_by_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{prescription.status}</Badge>
                      {prescription.status === 'Pending' && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleCancel(prescription.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(prescription.items || []).map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                        <div className="font-medium">{item.medication} {item.dosage}</div>
                        <div className="text-gray-600">
                          {item.frequency} for {item.duration} • Quantity: {item.quantity}
                        </div>
                        <div className="text-gray-600">{item.instructions}</div>
                      </div>
                    ))}
                  </div>

                  {prescription.notes && (
                    <div className="text-sm text-gray-600">
                      <strong>Notes:</strong> {prescription.notes}
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <strong>Status:</strong> {prescription.available_items} available, {prescription.out_of_stock_items} out of stock, {prescription.dispensed_items} dispensed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Prescriptions;