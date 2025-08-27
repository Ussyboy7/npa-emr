import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, FileText, TestTube, Pill, Stethoscope, Send, Download, History, Building, Syringe, Activity, Save, AlertTriangle, Clock } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import MedicalNotes from '@/components/consultation/medicalnotes';
import VitalsSection from '@/components/consultation/vitalssection';
import LabOrders from '@/components/consultation/laborders';
import Prescriptions from '@/components/consultation/prescriptions';
import NursingOrders from '@/components/consultation/nursingorders';
import Referrals from '@/components/consultation/referrals';
import PatientHistory from '@/components/consultation/patienthistory';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  allergies: string[];
  chiefComplaint: string;
  riskFactors?: string[];
  emergencyContact?: string;
}

interface ConsultationProgress {
  notes: boolean;
  vitals: boolean;
  assessment: boolean;
  plan: boolean;
}

const ConsultationSession: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = (params?.roomId as string) || 'default';

  const [currentPatient] = useState<Patient>({
    id: 'P001',
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    mrn: 'MRN12345',
    allergies: ['Penicillin', 'Shellfish'],
    chiefComplaint: 'Chest pain and shortness of breath',
    riskFactors: ['Hypertension', 'Family history of heart disease'],
    emergencyContact: '+1-555-0123'
  });

  const [activeTab, setActiveTab] = useState<string>('notes');
  const [showEndDialog, setShowEndDialog] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [consultationProgress, setConsultationProgress] = useState<ConsultationProgress>({
    notes: false,
    vitals: false,
    assessment: false,
    plan: false
  });

  // Session timeout warning
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(30 * 60); // 30 minutes

  // Keyboard shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    handleSaveAll();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+1', () => setActiveTab('notes'));
  useHotkeys('ctrl+2', () => setActiveTab('vitals'));
  useHotkeys('ctrl+3', () => setActiveTab('lab'));
  useHotkeys('ctrl+4', () => setActiveTab('prescriptions'));
  useHotkeys('ctrl+5', () => setActiveTab('nursing'));
  useHotkeys('ctrl+6', () => setActiveTab('referrals'));
  useHotkeys('ctrl+7', () => setActiveTab('history'));

  // Session timeout management
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 300 && prev > 0) { // 5 minutes warning
          setShowTimeoutWarning(true);
        }
        if (prev <= 0) {
          handleSessionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSessionTimeout = () => {
    // Auto-save and redirect
    handleSaveAll();
    router.push('/login?reason=timeout');
  };

  const extendSession = () => {
    setSessionTimeLeft(30 * 60);
    setShowTimeoutWarning(false);
  };

  const handleSaveAll = useCallback(async () => {
    try {
      // Save all form data
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      // Show success toast
    } catch (error) {
      console.error('Error saving consultation data:', error);
      // Show error toast
    }
  }, []);

  const handleEndConsultation = () => {
    if (hasUnsavedChanges) {
      // Ask to save first
      setShowEndDialog(true);
    } else {
      setShowEndDialog(true);
    }
  };

  const confirmEndConsultation = async () => {
    setIsEnding(true);
    try {
      // Save final data and generate summary
      await handleSaveAll();
      await generateConsultationSummary();
      
      // Navigate back to start page
      router.push('/consultation/start');
    } catch (error) {
      console.error('Error ending consultation:', error);
    } finally {
      setIsEnding(false);
      setShowEndDialog(false);
    }
  };

  const generateConsultationSummary = async () => {
    // Generate PDF summary
    console.log('Generating consultation summary...');
  };

  const handleExportSummary = () => {
    console.log('Exporting consultation summary...');
    // Generate and download PDF
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Track progress
    if (newTab === 'vitals') {
      setConsultationProgress(prev => ({ ...prev, vitals: true }));
    }
  };

  const getProgressPercentage = () => {
    const completed = Object.values(consultationProgress).filter(Boolean).length;
    return (completed / Object.keys(consultationProgress).length) * 100;
  };

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Session</h1>
            <p className="text-gray-600">Room: {roomId} • Dr. Sarah Wilson</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Session: {formatTimeRemaining(sessionTimeLeft)}</span>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveAll}>
              <Save className="mr-2 h-4 w-4" />
              Save All
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSummary}>
              <Download className="mr-2 h-4 w-4" />
              Export Summary
            </Button>
            <Button onClick={handleEndConsultation} variant="destructive" size="sm">
              End Consultation
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Consultation Progress</span>
            <span>{Math.round(getProgressPercentage())}% completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Keyboard shortcuts help */}
        <div className="mt-2 text-xs text-gray-500">
          Shortcuts: Ctrl+S (Save), Ctrl+1-7 (Switch tabs)
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentPatient.name}</CardTitle>
                <CardDescription>
                  MRN: {currentPatient.mrn} • Age: {currentPatient.age} • Gender: {currentPatient.gender}
                </CardDescription>
                {currentPatient.emergencyContact && (
                  <div className="text-sm text-gray-600 mt-1">
                    Emergency Contact: {currentPatient.emergencyContact}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <Badge variant="destructive" className="mb-1">Allergies</Badge>
                <div className="text-sm text-gray-600">
                  {currentPatient.allergies.join(', ')}
                </div>
              </div>
              {currentPatient.riskFactors && (
                <div>
                  <Badge variant="outline" className="mb-1">Risk Factors</Badge>
                  <div className="text-sm text-gray-600">
                    {currentPatient.riskFactors.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <strong>Chief Complaint:</strong> {currentPatient.chiefComplaint}
          </div>
        </CardHeader>
      </Card>

      {/* Main Consultation Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes
            {consultationProgress.notes && (
              <span className="w-2 h-2 bg-green-500 rounded-full" aria-label="Completed" />
            )}
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vitals
            {consultationProgress.vitals && (
              <span className="w-2 h-2 bg-green-500 rounded-full" aria-label="Completed" />
            )}
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Lab Orders
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="nursing" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Nursing
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <MedicalNotes visitId={roomId} />
        </TabsContent>

        <TabsContent value="vitals">
          <VitalsSection visitId={roomId} />
        </TabsContent>

        <TabsContent value="lab">
          <LabOrders visitId={roomId} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <Prescriptions visitId={roomId} />
        </TabsContent>

        <TabsContent value="nursing">
          <NursingOrders visitId={roomId} />
        </TabsContent>

        <TabsContent value="referrals">
          <Referrals visitId={roomId} />
        </TabsContent>

        <TabsContent value="history">
          <PatientHistory visitId={roomId} />
        </TabsContent>
      </Tabs>

      {/* End Consultation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Consultation?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasUnsavedChanges 
                ? "You have unsaved changes. Ending the consultation will save all data and generate a summary report."
                : "Are you sure you want to end this consultation? This will generate a summary report and close the session."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEnding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndConsultation} disabled={isEnding}>
              {isEnding ? "Ending..." : "End Consultation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Timeout Warning */}
      <AlertDialog open={showTimeoutWarning} onOpenChange={setShowTimeoutWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Session Timeout Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your session will expire in {formatTimeRemaining(sessionTimeLeft)}. 
              Would you like to extend your session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTimeoutWarning(false)}>
              Continue Working
            </AlertDialogCancel>
            <AlertDialogAction onClick={extendSession}>
              Extend Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConsultationSession;