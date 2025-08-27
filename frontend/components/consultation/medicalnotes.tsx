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
import { Save, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMedicalNotes } from '@/lib/useconsultationdata';

interface MedicalNotesProps {
  visitId: string;
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
  plan_of_care: z.string().min(1, "Plan of care is required"),
  allergies: z.string().optional(),
});

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
    "Acute coronary syndrome - rule out myocardial infarction",
    "Viral upper respiratory tract infection",
    "Gastroenteritis, likely viral",
    "Osteoarthritis with acute exacerbation",
    "Iron deficiency anemia"
  ],
  plan_of_care: [
    "ECG and troponin levels, cardiology consultation if abnormal",
    "Supportive care, rest, hydration, symptomatic treatment",
    "Oral rehydration therapy, anti-emetics as needed",
    "Physical therapy referral, pain management with NSAIDs",
    "Iron supplementation, dietary counseling, follow-up in 4 weeks"
  ]
};

const MedicalNotes: React.FC<MedicalNotesProps> = ({ visitId }) => {
  const { notes: savedNotes, loading, saveNotes } = useMedicalNotes(visitId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showTemplates, setShowTemplates] = useState<string | null>(null);

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
      plan_of_care: '',
      allergies: ''
    }
  });

  const formData = watch();

  // Load saved notes on mount
  useEffect(() => {
    if (savedNotes.length > 0) {
      const latestNote = savedNotes[0];
      Object.keys(latestNote).forEach(key => {
        if (key !== 'id' && key !== 'visit_id' && key !== 'created_at' && key !== 'updated_at') {
          setValue(key as keyof MedicalNotesForm, latestNote[key] || '');
        }
      });
    }
  }, [savedNotes, setValue]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleSave(formData, true);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, autoSaveEnabled]);

  const handleSave = useCallback(async (data: MedicalNotesForm, isAutoSave = false) => {
    setIsSaving(true);
    try {
      await saveNotes(data);
      setLastSaved(new Date());
      if (!isAutoSave) {
        // Show success notification for manual saves
        console.log('Notes saved successfully');
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      // Show error notification
    } finally {
      setIsSaving(false);
    }
  }, [saveNotes]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                      className={`min-h-32 ${errors.presenting_complaints ? 'border-red-500' : ''}`}
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
                      className="min-h-32"
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
                      className="min-h-24"
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
                      className="min-h-24"
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
                      className="min-h-24"
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
                      className="min-h-24"
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
                    className="min-h-24"
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
                    className="min-h-32"
                  />
                )}
              />
            </div>

            {/* Clinical Impression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clinical-impression" className="flex items-center gap-2">
                  Clinical Impression & Diagnosis *
                  {getStatusIcon(getFieldStatus('clinical_impression'))}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(showTemplates === 'clinical_impression' ? null : 'clinical_impression')}
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
                    className={`min-h-24 ${errors.clinical_impression ? 'border-red-500' : ''}`}
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
                    >
                      {template}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plan of Care */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="plan-care" className="flex items-center gap-2">
                  Plan of Care *
                  {getStatusIcon(getFieldStatus('plan_of_care'))}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(showTemplates === 'plan_of_care' ? null : 'plan_of_care')}
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
                    className={`min-h-24 ${errors.plan_of_care ? 'border-red-500' : ''}`}
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
                    >
                      {template}
                    </button>
                  ))}
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
                />
                <Label htmlFor="auto-save" className="text-sm">
                  Enable auto-save (saves every 3 seconds)
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSaving || !isValid}
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
    </div>
  );
};

export default MedicalNotes;