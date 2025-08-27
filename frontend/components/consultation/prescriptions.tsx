import React, { useState } from 'react';
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
import { Pill, Send, Plus, X, AlertTriangle, Clock, Search } from 'lucide-react';

interface PrescriptionsProps {
  visitId: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
  quantity: number;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
}

interface Prescription {
  id: string;
  medications: Medication[];
  prescribedAt: string;
  status: 'pending' | 'filled' | 'cancelled';
  pharmacist: string;
  notes: string;
}

// Validation schema
const medicationSchema = z.object({
  name: z.string().min(2, "Medication name is required"),
  dosage: z.string().regex(/^\d+(\.\d+)?\s*(mg|ml|g|mcg|units?)$/i, "Invalid dosage format (e.g., 500mg, 10ml)"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  route: z.enum(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'rectal', 'sublingual']),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  medications: z.array(medicationSchema).min(1, "At least one medication is required"),
  prescriptionNotes: z.string().optional(),
}).refine(
  (data) => {
    // Check for dangerous drug combinations
    const medications = data.medications;
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i].name.toLowerCase();
        const drug2 = medications[j].name.toLowerCase();
        
        // Example dangerous combinations
        if ((drug1.includes('warfarin') && drug2.includes('aspirin')) ||
            (drug1.includes('metformin') && drug2.includes('contrast'))) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: "Potential dangerous drug interaction detected. Please review.",
    path: ["medications"],
  }
);

type PrescriptionForm = z.infer<typeof prescriptionSchema>;

// Common medications with details
const commonMedications = [
  { name: 'Paracetamol', category: 'Analgesic', commonDosages: ['500mg', '1000mg'], routes: ['oral'] },
  { name: 'Ibuprofen', category: 'NSAID', commonDosages: ['400mg', '600mg'], routes: ['oral'] },
  { name: 'Amoxicillin', category: 'Antibiotic', commonDosages: ['500mg', '875mg'], routes: ['oral'] },
  { name: 'Metformin', category: 'Antidiabetic', commonDosages: ['500mg', '850mg', '1000mg'], routes: ['oral'] },
  { name: 'Amlodipine', category: 'Antihypertensive', commonDosages: ['5mg', '10mg'], routes: ['oral'] },
  { name: 'Omeprazole', category: 'PPI', commonDosages: ['20mg', '40mg'], routes: ['oral'] },
  { name: 'Atorvastatin', category: 'Statin', commonDosages: ['20mg', '40mg', '80mg'], routes: ['oral'] },
  { name: 'Aspirin', category: 'Antiplatelet', commonDosages: ['75mg', '100mg'], routes: ['oral'] },
  { name: 'Losartan', category: 'ARB', commonDosages: ['50mg', '100mg'], routes: ['oral'] },
  { name: 'Metoprolol', category: 'Beta-blocker', commonDosages: ['25mg', '50mg', '100mg'], routes: ['oral'] },
];

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
  const [existingPrescriptions, setExistingPrescriptions] = useState<Prescription[]>([
    {
      id: 'rx-1',
      medications: [
        {
          id: '1',
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'three_times_daily',
          duration: '7 days',
          route: 'oral',
          quantity: 21,
          instructions: 'Take with food'
        }
      ],
      prescribedAt: '2024-01-15 10:30 AM',
      status: 'pending',
      pharmacist: 'Not assigned',
      notes: 'For respiratory tract infection'
    }
  ]);

  const [isSending, setIsSending] = useState(false);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

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
      medications: [{
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        route: 'oral',
        quantity: 1,
        instructions: ''
      }],
      prescriptionNotes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications"
  });

  const formData = watch();

  // Check for drug interactions whenever medications change
  React.useEffect(() => {
    checkDrugInteractions(formData.medications);
  }, [formData.medications]);

  const checkDrugInteractions = (medications: any[]) => {
    const interactions: DrugInteraction[] = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i]?.name?.toLowerCase() || '';
        const drug2 = medications[j]?.name?.toLowerCase() || '';
        
        // Check for known interactions (simplified example)
        if (drug1.includes('warfarin') && drug2.includes('aspirin')) {
          interactions.push({
            drug1: medications[i].name,
            drug2: medications[j].name,
            severity: 'major',
            description: 'Increased risk of bleeding when combining warfarin with aspirin'
          });
        }
        
        if (drug1.includes('metformin') && drug2.includes('contrast')) {
          interactions.push({
            drug1: medications[i].name,
            drug2: medications[j].name,
            severity: 'major',
            description: 'Risk of lactic acidosis when combining metformin with contrast media'
          });
        }
        
        if ((drug1.includes('ibuprofen') || drug1.includes('nsaid')) && 
            (drug2.includes('ace inhibitor') || drug2.includes('losartan'))) {
          interactions.push({
            drug1: medications[i].name,
            drug2: medications[j].name,
            severity: 'moderate',
            description: 'NSAIDs may reduce the effectiveness of ACE inhibitors/ARBs'
          });
        }
      }
    }
    
    setDrugInteractions(interactions);
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
      case 'filled': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateQuantity = (frequency: string, duration: string): number => {
    // Simple calculation based on frequency and duration
    const durationMatch = duration.match(/(\d+)\s*(day|week|month)/i);
    if (!durationMatch) return 1;
    
    const durationNum = parseInt(durationMatch[1]);
    const durationUnit = durationMatch[2].toLowerCase();
    
    let daysTotal = durationNum;
    if (durationUnit === 'week') daysTotal *= 7;
    if (durationUnit === 'month') daysTotal *= 30;
    
    const frequencyMap: Record<string, number> = {
      'once_daily': 1,
      'twice_daily': 2,
      'three_times_daily': 3,
      'four_times_daily': 4,
      'every_4_hours': 6,
      'every_6_hours': 4,
      'every_8_hours': 3,
    };
    
    const dailyDoses = frequencyMap[frequency] || 1;
    return Math.ceil(daysTotal * dailyDoses * 1.1); // 10% extra
  };

  const onSubmit = async (data: PrescriptionForm) => {
    setIsSending(true);
    try {
      const newPrescription: Prescription = {
        id: `rx-${Date.now()}`,
        medications: data.medications.map((med, index) => ({
          ...med,
          id: index.toString()
        })),
        prescribedAt: new Date().toLocaleString(),
        status: 'pending',
        pharmacist: 'Not assigned',
        notes: data.prescriptionNotes || ''
      };

      setExistingPrescriptions(prev => [newPrescription, ...prev]);
      reset();
      
      console.log('Prescription sent to pharmacy successfully');
    } catch (error) {
      console.error('Failed to send prescription:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getSuggestedMedications = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return commonMedications.filter(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Drug Interaction Warnings */}
      {drugInteractions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Drug Interaction Warning:</strong>
            <ul className="mt-2 space-y-1">
              {drugInteractions.map((interaction, index) => (
                <li key={index} className={`p-2 rounded border ${getInteractionColor(interaction.severity)}`}>
                  <strong>{interaction.drug1} + {interaction.drug2}</strong> 
                  <span className="ml-2 capitalize">({interaction.severity})</span>
                  <div className="text-sm mt-1">{interaction.description}</div>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* New Prescription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Create Prescription
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
                    name: '',
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

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Medication Name */}
                    <div className="space-y-2">
                      <Label>Medication Name *</Label>
                      <div className="relative">
                        <Controller
                          name={`medications.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <>
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  placeholder="Search medication..."
                                  className={`pl-8 ${errors.medications?.[index]?.name ? 'border-red-500' : ''}`}
                                  onFocus={() => setShowSuggestions(index)}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setMedicationSearch(e.target.value);
                                  }}
                                />
                              </div>
                              
                              {showSuggestions === index && medicationSearch && (
                                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                  {getSuggestedMedications(medicationSearch).map((med, medIndex) => (
                                    <div
                                      key={medIndex}
                                      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                      onClick={() => {
                                        field.onChange(med.name);
                                        setShowSuggestions(null);
                                        setMedicationSearch('');
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium">{med.name}</div>
                                          <div className="text-sm text-gray-600">{med.category}</div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {med.category}
                                        </Badge>
                                      </div>
                                      {med.commonDosages.length > 0 && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          Common dosages: {med.commonDosages.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        />
                      </div>
                      {errors.medications?.[index]?.name && (
                        <p className="text-red-500 text-sm">{errors.medications[index]?.name?.message}</p>
                      )}
                    </div>

                    {/* Dosage */}
                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Controller
                        name={`medications.${index}.dosage`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g., 500mg, 10ml"
                            className={errors.medications?.[index]?.dosage ? 'border-red-500' : ''}
                          />
                        )}
                      />
                      {errors.medications?.[index]?.dosage && (
                        <p className="text-red-500 text-sm">{errors.medications[index]?.dosage?.message}</p>
                      )}
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <Controller
                        name={`medications.${index}.frequency`}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={errors.medications?.[index]?.frequency ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((freq) => (
                                <SelectItem key={freq.value} value={freq.value}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{freq.label}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {freq.abbreviation}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.medications?.[index]?.frequency && (
                        <p className="text-red-500 text-sm">{errors.medications[index]?.frequency?.message}</p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label>Duration *</Label>
                      <Controller
                        name={`medications.${index}.duration`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g., 7 days, 2 weeks"
                            className={errors.medications?.[index]?.duration ? 'border-red-500' : ''}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-calculate quantity
                              const frequency = formData.medications[index]?.frequency;
                              if (frequency && e.target.value) {
                                const calculatedQty = calculateQuantity(frequency, e.target.value);
                                setValue(`medications.${index}.quantity`, calculatedQty);
                              }
                            }}
                          />
                        )}
                      />
                      {errors.medications?.[index]?.duration && (
                        <p className="text-red-500 text-sm">{errors.medications[index]?.duration?.message}</p>
                      )}
                    </div>

                    {/* Route */}
                    <div className="space-y-2">
                      <Label>Route *</Label>
                      <Controller
                        name={`medications.${index}.route`}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {routeOptions.map((route) => (
                                <SelectItem key={route.value} value={route.value}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{route.label}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {route.abbreviation}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Controller
                        name={`medications.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="30"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            className={errors.medications?.[index]?.quantity ? 'border-red-500' : ''}
                          />
                        )}
                      />
                      {errors.medications?.[index]?.quantity && (
                        <p className="text-red-500 text-sm">{errors.medications[index]?.quantity?.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label>Special Instructions</Label>
                    <Controller
                      name={`medications.${index}.instructions`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., Take with food, Avoid alcohol"
                        />
                      )}
                    />
                  </div>

                  {/* Medication Summary */}
                  {formData.medications[index]?.name && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-sm">
                        <strong>Prescription Summary:</strong>
                        <div className="mt-1">
                          {formData.medications[index].name} {formData.medications[index].dosage}
                          {formData.medications[index].frequency && (
                            <span> - {frequencyOptions.find(f => f.value === formData.medications[index].frequency)?.label}</span>
                          )}
                          {formData.medications[index].duration && (
                            <span> for {formData.medications[index].duration}</span>
                          )}
                          {formData.medications[index].quantity && (
                            <span> (Qty: {formData.medications[index].quantity})</span>
                          )}
                        </div>
                        {formData.medications[index].instructions && (
                          <div className="mt-1 text-blue-700">
                            <AlertTriangle className="inline h-3 w-3 mr-1" />
                            {formData.medications[index].instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {errors.medications && typeof errors.medications === 'object' && 'message' in errors.medications && (
                <p className="text-red-500 text-sm">{errors.medications.message}</p>
              )}
            </div>

            {/* Prescription Notes */}
            <div className="space-y-2">
              <Label>Prescription Notes</Label>
              <Controller
                name="prescriptionNotes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Additional notes for pharmacist..."
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to Pharmacy
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Prescriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Prescriptions ({existingPrescriptions.length})</CardTitle>
            <Badge variant="outline" className="text-xs">
              Updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {existingPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No prescriptions created yet</p>
              </div>
            ) : (
              existingPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Prescription #{prescription.id}</span>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {prescription.prescribedAt}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Medications:</span>
                      <div className="space-y-2 mt-1">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded border">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium">{med.name} {med.dosage}</div>
                                <div className="text-sm text-gray-600">
                                  {frequencyOptions.find(f => f.value === med.frequency)?.label || med.frequency} 
                                  {med.duration && ` for ${med.duration}`}
                                  {med.route !== 'oral' && ` (${routeOptions.find(r => r.value === med.route)?.abbreviation})`}
                                </div>
                                <div className="text-sm text-gray-600">Quantity: {med.quantity}</div>
                                {med.instructions && (
                                  <div className="text-sm text-blue-600 mt-1">
                                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                                    {med.instructions}
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {prescription.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{prescription.notes}</p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Pharmacist:</span> {prescription.pharmacist}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    {prescription.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm">
                          Cancel Prescription
                        </Button>
                        <Button variant="outline" size="sm">
                          Modify
                        </Button>
                      </>
                    )}
                    {prescription.status === 'filled' && (
                      <Button variant="outline" size="sm">
                        View Dispensing Details
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Print Prescription
                    </Button>
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

export default Prescriptions;