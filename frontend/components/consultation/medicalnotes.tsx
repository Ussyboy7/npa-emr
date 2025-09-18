// components/consultation/medicalnotes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Save, Plus, Clock, CheckCircle, AlertTriangle, Upload, File, X } from 'lucide-react';
import ICD10Selector from '@/components/consultation/icd10selector';

interface MedicalNotesProps {
  visitId: string;
  canEdit: boolean;
}

// Validation schema
const medicalNotesSchema = z.object({
  presenting_complaints: z.string().min(1, "Presenting complaints are required"),
  history_of_complaints: z.string().optional(),
  past_medical_history: z.string().optional(),
  family_history: z.string().optional(),
  social_history: z.string().optional(),
  systems_review: z.string().optional(),
  physical_examination: z.string().optional(),
  clinical_impression: z.string().min(1, "Clinical impression is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  // Modified: Removed required validation for plan_of_care
  plan_of_care: z.string().optional(),
  allergies: z.string().optional(),
  // Modified: Removed required validation for general_appearance
  general_appearance: z.string().optional(),
});

// Type inference from schema
type MedicalNotesForm = z.infer<typeof medicalNotesSchema>;

// Common templates for auto-completion
const noteTemplates = {
  presenting_complaints: [
    "Chest pain with shortness of breath",
    "Headache and fever",
    "Abdominal pain and nausea",
    "Joint pain and stiffness",
    "Fatigue and weakness"
  ],
  clinical_impression: [
    "Malaria",
    "Thyroid",
    "Hypertension",
    "Diabetes Mellitus",
    "Asthma",
    "Migraine",
    "Gastroenteritis",
    "Anemia",
    "Pneumonia",
    "Urinary Tract Infection",
    "Depression",
    "Anxiety Disorder",
    "Osteoarthritis",
    "Chronic Kidney Disease",
    "Heart Failure",
  ],
  plan_of_care: [
    "ECG and troponin levels, cardiology consultation if abnormal",
    "Supportive care, rest, hydration, symptomatic treatment",
    "Oral rehydration therapy, anti-emetics as needed",
    "Physical therapy referral, pain management with NSAIDs",
    "Iron supplementation, dietary counseling, follow-up in 4 weeks"
  ]
};

const MedicalNotes: React.FC<MedicalNotesProps> = ({ visitId, canEdit }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showTemplates, setShowTemplates] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [procedures, setProcedures] = useState<{name: string, notes: string}[]>([]);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm<MedicalNotesForm>({
    resolver: zodResolver(medicalNotesSchema),
    defaultValues: {
      presenting_complaints: '',
      history_of_complaints: '',
      past_medical_history: '',
      family_history: '',
      social_history: '',
      systems_review: '',
      physical_examination: '',
      clinical_impression: '',
      diagnosis: '',
      plan_of_care: '',
      allergies: '',
      general_appearance: ''
    }
  });

  const formData = watch();
  
  useEffect(() => {
    setLastSaved(new Date());
  }, []);
  
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;
    const autoSaveTimer = setTimeout(async () => {
      await handleSave(formData, true);
    }, 3000);
    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, autoSaveEnabled]);
  
  const handleSave = useCallback(async (data: MedicalNotesForm, isAutoSave = false) => {
    setIsSaving(true);
    try {
      console.log('Saving notes:', data);
      setLastSaved(new Date());
      if (!isAutoSave) {
        console.log('Notes saved successfully');
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  const onSubmit = (data: MedicalNotesForm) => {
    handleSave(data, false);
  };
  
  const insertTemplate = (field: keyof MedicalNotesForm, template: string) => {
    const currentValue = formData[field] || '';
    const newValue = currentValue ? `${currentValue}\n${template}` : template;
    setValue(field, newValue);
    setShowTemplates(null);
  };
  
  const getFieldStatus = (fieldName: keyof MedicalNotesForm) => {
    if (errors[fieldName]) return 'error';
    if (formData[fieldName] && formData[fieldName].trim().length > 0) return 'complete';
    return 'empty';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const addNewProcedure = () => {
    setProcedures([...procedures, { name: '', notes: '' }]);
  };
  
  const removeProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };
  
  const updateProcedure = (index: number, field: 'name' | 'notes', value: string) => {
    const updated = [...procedures];
    updated[index][field] = value;
    setProcedures(updated);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Medical Notes</CardTitle>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {isDirty && (
                <Badge variant="outline" className="text-orange-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* General Appearance - No longer required */}
              <div className="space-y-2">
                <Label htmlFor="general-appearance" className="flex items-center gap-2">
                  General Appearance
                  {getStatusIcon(getFieldStatus('general_appearance'))}
                </Label>
                <Controller
                  name="general_appearance"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="general-appearance"
                      placeholder="Describe patient's general appearance (e.g., alert, oriented, well-nourished, etc.)"
                      className={`min-h-24 ${errors.general_appearance ? 'border-red-500' : ''} ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                      aria-describedby={errors.general_appearance ? 'general-appearance-error' : undefined}
                    />
                  )}
                />
                {errors.general_appearance && (
                  <p id="general-appearance-error" className="text-red-500 text-sm">
                    {errors.general_appearance.message}
                  </p>
                )}
              </div>
              
              {/* Presenting Complaints */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="presenting-complaints" className="flex items-center gap-2">
                    Presenting Complaints *
                    {getStatusIcon(getFieldStatus('presenting_complaints'))}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplates(showTemplates === 'presenting_complaints' ? null : 'presenting_complaints')}
                    disabled={!canEdit}
                  >
                    <Plus className="h-4 w-4" />
                    Templates
                  </Button>
                </div>
                <Controller
                  name="presenting_complaints"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="presenting-complaints"
                      placeholder="Describe the main symptoms and concerns..."
                      className={`min-h-32 ${errors.presenting_complaints ? 'border-red-500' : ''} ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                      aria-describedby={errors.presenting_complaints ? 'presenting-complaints-error' : undefined}
                    />
                  )}
                />
                {errors.presenting_complaints && (
                  <p id="presenting-complaints-error" className="text-red-500 text-sm">
                    {errors.presenting_complaints.message}
                  </p>
                )}
                {showTemplates === 'presenting_complaints' && (
                  <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                    <p className="text-sm font-medium">Common templates:</p>
                    {noteTemplates.presenting_complaints.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        className="block w-full text-left text-sm p-2 hover:bg-white rounded border"
                        onClick={() => insertTemplate('presenting_complaints', template)}
                        disabled={!canEdit}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* History of Present Illness */}
              <div className="space-y-2">
                <Label htmlFor="history-complaints" className="flex items-center gap-2">
                  History of Present Illness
                  {getStatusIcon(getFieldStatus('history_of_complaints'))}
                </Label>
                <Controller
                  name="history_of_complaints"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="history-complaints"
                      placeholder="Timeline, duration, severity, associated symptoms..."
                      className={`min-h-32 ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                    />
                  )}
                />
              </div>
              
              {/* Past Medical History */}
              <div className="space-y-2">
                <Label htmlFor="past-medical" className="flex items-center gap-2">
                  Past Medical History
                  {getStatusIcon(getFieldStatus('past_medical_history'))}
                </Label>
                <Controller
                  name="past_medical_history"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="past-medical"
                      placeholder="Previous illnesses, surgeries, hospitalizations..."
                      className={`min-h-24 ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                    />
                  )}
                />
              </div>
              
              {/* Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies" className="flex items-center gap-2">
                  Allergies & Adverse Reactions
                  {getStatusIcon(getFieldStatus('allergies'))}
                </Label>
                <Controller
                  name="allergies"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="allergies"
                      placeholder="Known allergies, drug reactions, environmental..."
                      className={`min-h-24 ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                    />
                  )}
                />
              </div>
              
              {/* Family History */}
              <div className="space-y-2">
                <Label htmlFor="family-history" className="flex items-center gap-2">
                  Family History
                  {getStatusIcon(getFieldStatus('family_history'))}
                </Label>
                <Controller
                  name="family_history"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="family-history"
                      placeholder="Relevant family medical history..."
                      className={`min-h-24 ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                    />
                  )}
                />
              </div>
              
              {/* Social History */}
              <div className="space-y-2">
                <Label htmlFor="social-history" className="flex items-center gap-2">
                  Social History
                  {getStatusIcon(getFieldStatus('social_history'))}
                </Label>
                <Controller
                  name="social_history"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="social-history"
                      placeholder="Smoking, alcohol, occupation, lifestyle..."
                      className={`min-h-24 ${!canEdit ? 'bg-gray-100' : ''}`}
                      disabled={!canEdit}
                    />
                  )}
                />
              </div>
            </div>
            
            {/* Systems Review */}
            <div className="space-y-2">
              <Label htmlFor="systems-review" className="flex items-center gap-2">
                Review of Systems
                {getStatusIcon(getFieldStatus('systems_review'))}
              </Label>
              <Controller
                name="systems_review"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="systems-review"
                    placeholder="Systematic review of body systems..."
                    className={`min-h-24 ${!canEdit ? 'bg-gray-100' : ''}`}
                    disabled={!canEdit}
                  />
                )}
              />
            </div>
            
            {/* Physical Examination */}
            <div className="space-y-2">
              <Label htmlFor="physical-exam" className="flex items-center gap-2">
                Physical Examination
                {getStatusIcon(getFieldStatus('physical_examination'))}
              </Label>
              <Controller
                name="physical_examination"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="physical-exam"
                    placeholder="General appearance, vital signs, system examinations..."
                    className={`min-h-32 ${!canEdit ? 'bg-gray-100' : ''}`}
                    disabled={!canEdit}
                  />
                )}
              />
            </div>
            
            {/* Clinical Impression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clinical-impression" className="flex items-center gap-2">
                  Clinical Impression *
                  {getStatusIcon(getFieldStatus('clinical_impression'))}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(showTemplates === 'clinical_impression' ? null : 'clinical_impression')}
                  disabled={!canEdit}
                >
                  <Plus className="h-4 w-4" />
                  Templates
                </Button>
              </div>
              <Controller
                name="clinical_impression"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="clinical-impression"
                    placeholder="Differential diagnosis, working diagnosis..."
                    className={`min-h-24 ${errors.clinical_impression ? 'border-red-500' : ''} ${!canEdit ? 'bg-gray-100' : ''}`}
                    disabled={!canEdit}
                    aria-describedby={errors.clinical_impression ? 'clinical-impression-error' : undefined}
                  />
                )}
              />
              {errors.clinical_impression && (
                <p id="clinical-impression-error" className="text-red-500 text-sm">
                  {errors.clinical_impression.message}
                </p>
              )}
              {showTemplates === 'clinical_impression' && (
                <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                  <p className="text-sm font-medium">Common diagnoses:</p>
                  {noteTemplates.clinical_impression.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      className="block w-full text-left text-sm p-2 hover:bg-white rounded border"
                      onClick={() => insertTemplate('clinical_impression', template)}
                      disabled={!canEdit}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Diagnosis with ICD-10 */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="flex items-center gap-2">
                Diagnosis (ICD-10 Code) *
                {getStatusIcon(getFieldStatus('diagnosis'))}
              </Label>
              <Controller
                name="diagnosis"
                control={control}
                render={({ field }) => (
                  <ICD10Selector
                    value={field.value}
                    onChange={(code, description) => {
                      field.onChange(`${code}: ${description}`);
                    }}
                    disabled={!canEdit}
                  />
                )}
              />
              {errors.diagnosis && (
                <p className="text-red-500 text-sm">{errors.diagnosis.message}</p>
              )}
            </div>
            
            {/* Plan of Care - No longer required */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="plan-care" className="flex items-center gap-2">
                  Plan of Care
                  {getStatusIcon(getFieldStatus('plan_of_care'))}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(showTemplates === 'plan_of_care' ? null : 'plan_of_care')}
                  disabled={!canEdit}
                >
                  <Plus className="h-4 w-4" />
                  Templates
                </Button>
              </div>
              <Controller
                name="plan_of_care"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="plan-care"
                    placeholder="Treatment plan, follow-up, patient education..."
                    className={`min-h-24 ${errors.plan_of_care ? 'border-red-500' : ''} ${!canEdit ? 'bg-gray-100' : ''}`}
                    disabled={!canEdit}
                    aria-describedby={errors.plan_of_care ? 'plan-care-error' : undefined}
                  />
                )}
              />
              {errors.plan_of_care && (
                <p id="plan-care-error" className="text-red-500 text-sm">
                  {errors.plan_of_care.message}
                </p>
              )}
              {showTemplates === 'plan_of_care' && (
                <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                  <p className="text-sm font-medium">Common treatment plans:</p>
                  {noteTemplates.plan_of_care.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      className="block w-full text-left text-sm p-2 hover:bg-white rounded border"
                      onClick={() => insertTemplate('plan_of_care', template)}
                      disabled={!canEdit}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Procedures Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Procedures</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewProcedure}
                  disabled={!canEdit}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Procedure
                </Button>
              </div>
              
              {procedures.map((procedure, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Procedure {index + 1}</h4>
                    {procedures.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProcedure(index)}
                        disabled={!canEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Procedure Name</Label>
                    <Input
                      placeholder="e.g., Wound dressing, Blood draw"
                      value={procedure.name}
                      onChange={(e) => updateProcedure(index, 'name', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Procedure Notes</Label>
                    <Textarea
                      placeholder="Details about the procedure..."
                      value={procedure.notes}
                      onChange={(e) => updateProcedure(index, 'notes', e.target.value)}
                      className="min-h-16"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Examination Files</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                <Input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={!canEdit}
                />
                <Label htmlFor="file-upload" className="mt-4 cursor-pointer">
                  <Button variant="outline" size="sm" disabled={!canEdit}>
                    Select Files
                  </Button>
                </Label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={!canEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Auto-save toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-save"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                  disabled={!canEdit}
                />
                <Label htmlFor="auto-save" className="text-sm">
                  Enable auto-save (saves every 3 seconds)
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSaving || !isValid || !canEdit}
                  className="min-w-24"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Validation Explanation Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Field Validation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">How Validation Works</h3>
              <p className="text-sm text-gray-600">
                Field validation is defined in the <code className="bg-gray-100 px-1 rounded">medicalNotesSchema</code> using Zod validation rules.
                Each field has specific validation rules that determine if it's required or optional.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">How to Make a Field Required</h3>
              <p className="text-sm text-gray-600 mb-2">
                To make a field required, change its validation from <code className="bg-gray-100 px-1 rounded">z.string().optional()</code> to:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`fieldName: z.string().min(1, "Custom error message"),`}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Also remember to add the asterisk (*) to the label and update the UI to reflect it's required.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">How to Make a Field Optional</h3>
              <p className="text-sm text-gray-600 mb-2">
                To make a field optional, change its validation from <code className="bg-gray-100 px-1 rounded">z.string().min(1, "message")</code> to:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`fieldName: z.string().optional(),`}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Also remember to remove the asterisk (*) from the label.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Examples of Other Validations</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Minimum length validation
fieldName: z.string().min(10, "Must be at least 10 characters"),

// Maximum length validation
fieldName: z.string().max(200, "Must be less than 200 characters"),

// Email validation
fieldName: z.string().email("Invalid email address"),

// Regex pattern validation
fieldName: z.string().regex(/^[A-Z]+$/, "Must be uppercase letters"),

// Custom validation
fieldName: z.string().refine(val => val.includes('@'), "Must contain @ symbol"),`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default MedicalNotes;