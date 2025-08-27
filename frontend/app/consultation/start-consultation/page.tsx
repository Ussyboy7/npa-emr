'use client';
 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User, FileText, TestTube, Pill, Stethoscope,
  Send, Download, History, Building, Syringe,
  Activity, Save, AlertTriangle, Clock, MapPin, Loader2,
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import MedicalNotes from '@/components/consultation/medicalnotes';
import VitalsSection from '@/components/consultation/vitalssection';
import LabOrders from '@/components/consultation/laborders';
import Prescriptions from '@/components/consultation/prescriptions';
import NursingOrders from '@/components/consultation/nursingorders';
import Referrals from '@/components/consultation/referrals';
import PatientHistory from '@/components/consultation/patienthistory';

// Toast functionality - replace with your actual toast implementation
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.log('Info:', message),
};

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
  lab: boolean;
  prescriptions: boolean;
  nursing: boolean;
  referrals: boolean;
  history: boolean;
}

interface ConsultationRoom {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  lastPatient?: string;
  currentPatient?: string;
  startTime?: string;
  note?: string;
}

// Mock data - replace with API calls in production
const mockRooms: ConsultationRoom[] = [
  { id: "room-1", name: "Consultation Room 1", status: "available", lastPatient: "2 hours ago" },
  { id: "room-2", name: "Consultation Room 2", status: "occupied", currentPatient: "Sarah Johnson", startTime: "30 min ago" },
  { id: "room-3", name: "Consultation Room 3", status: "available", lastPatient: "1 hour ago" },
  { id: "room-4", name: "Consultation Room 4", status: "maintenance", note: "Equipment servicing" },
  { id: "room-5", name: "Consultation Room 5", status: "available", lastPatient: "45 min ago" },
];

const mockPatient: Patient = {
  id: 'P001',
  name: 'John Doe',
  age: 35,
  gender: 'Male',
  mrn: 'MRN12345',
  allergies: ['Penicillin', 'Shellfish'],
  chiefComplaint: 'Chest pain and shortness of breath',
  riskFactors: ['Hypertension', 'Family history of heart disease'],
  emergencyContact: '+1-555-0123',
};

const StartConsultation = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [consultationRooms, setConsultationRooms] = useState<ConsultationRoom[]>(mockRooms);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  // Simulate loading rooms data
  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConsultationRooms(mockRooms);
      } catch (error) {
        console.error('Failed to load rooms:', error);
        toast.error('Failed to load consultation rooms');
      } finally {
        setLoadingRooms(false);
      }
    };
    
    loadRooms();
  }, []);

  const getStatusColor = (status: ConsultationRoom['status']): string => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: ConsultationRoom['status']): string => {
    switch (status) {
      case "available": return "✓";
      case "occupied": return "⚫";
      case "maintenance": return "🔧";
      default: return "";
    }
  };

  const handleStartConsultation = () => {
    if (selectedRoom) {
      setShowConfirmDialog(true);
    }
  };

  const confirmStartConsultation = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to start consultation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update room status to occupied
      setConsultationRooms(prev => 
        prev.map(room => 
          room.id === selectedRoom 
            ? { ...room, status: 'occupied', currentPatient: mockPatient.name, startTime: 'Just now' }
            : room
        )
      );
      
      setIsStarted(true);
      toast.success('Consultation started successfully');
    } catch (error) {
      console.error('Failed to start consultation:', error);
      toast.error('Failed to start consultation');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleRoomSelect = (roomId: string, status: ConsultationRoom['status']) => {
    if (status === "available") {
      setSelectedRoom(roomId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, roomId: string, status: ConsultationRoom['status']) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRoomSelect(roomId, status);
    }
  };

  if (isStarted) {
    return <ConsultationSession roomId={selectedRoom} />;
  }

  const selectedRoomData = consultationRooms.find(room => room.id === selectedRoom);
  const availableRooms = consultationRooms.filter(room => room.status === 'available');

  // Loading skeleton for room cards
  if (loadingRooms) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Start Consultation</h1>
          <p className="text-gray-600">Loading consultation rooms...</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="w-32 h-5 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Start Consultation</h1>
        <p className="text-gray-600">Select a consultation room to begin your session</p>
        
        {availableRooms.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                No rooms are currently available. Please wait for a room to become free or check back later.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {consultationRooms.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              selectedRoom === room.id ? "ring-2 ring-blue-500 border-blue-500 shadow-md" : "border-gray-200"
            } ${room.status !== "available" ? "opacity-60 cursor-not-allowed" : "hover:border-gray-300"}`}
            onClick={() => handleRoomSelect(room.id, room.status)}
            onKeyDown={(e) => handleKeyDown(e, room.id, room.status)}
            tabIndex={room.status === "available" ? 0 : -1}
            role="button"
            aria-pressed={selectedRoom === room.id}
            aria-disabled={room.status !== "available"}
            aria-describedby={`room-${room.id}-description`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
                </div>
                <Badge 
                  className={`${getStatusColor(room.status)} font-medium capitalize`}
                  aria-label={`Status: ${room.status}`}
                >
                  <span aria-hidden="true">{getStatusIcon(room.status)}</span>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div id={`room-${room.id}-description`}>
                {room.status === "available" && room.lastPatient && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>Last patient: {room.lastPatient}</span>
                  </div>
                )}

                {room.status === "occupied" && (
                  <div className="space-y-2">
                    {room.currentPatient && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>Current: {room.currentPatient}</span>
                      </div>
                    )}
                    {room.startTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>Started: {room.startTime}</span>
                      </div>
                    )}
                  </div>
                )}

                {room.status === "maintenance" && room.note && (
                  <div className="text-sm text-yellow-700 font-medium" role="alert">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2" aria-hidden="true"></span>
                    {room.note}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={handleStartConsultation}
          disabled={!selectedRoom || isLoading || availableRooms.length === 0}
          size="lg"
          className="min-w-48 font-medium"
          aria-describedby="start-consultation-help"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Stethoscope className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Starting..." : "Start Consultation"}
        </Button>
        
        {availableRooms.length > 0 && (
          <Button variant="outline" size="lg" className="font-medium">
            <History className="mr-2 h-5 w-5" />
            View Recent Sessions
          </Button>
        )}
      </div>

      {selectedRoom && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600" id="start-consultation-help">
            Selected: <span className="font-medium text-blue-600">
              {selectedRoomData?.name}
            </span>
          </p>
        </div>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Consultation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start a consultation in {selectedRoomData?.name}? 
              This will mark the room as occupied and begin the session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartConsultation} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Consultation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ConsultationSession: React.FC<{ roomId: string }> = ({ roomId }) => {
  const router = useRouter();

  const [currentPatient] = useState<Patient>(mockPatient);
  const [activeTab, setActiveTab] = useState<string>('notes');
  const [showEndDialog, setShowEndDialog] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [consultationProgress, setConsultationProgress] = useState<ConsultationProgress>({
    notes: false,
    vitals: false,
    assessment: false,
    plan: false,
    lab: false,
    prescriptions: false,
    nursing: false,
    referrals: false,
    history: false,
  });

  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(30 * 60); // 30 minutes
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  // Initialize last saved time after mount (to avoid SSR mismatch)
  useEffect(() => {
    setLastSaved(new Date());
  }, []);

  // Define callback functions first
  // Define all callback functions first to avoid hoisting issues
  const handleSaveAll = useCallback(async () => {
    try {
      // Simulate API call to save consultation data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Consultation saved successfully!');
    } catch (error) {
      console.error('Error saving consultation data:', error);
      toast.error('Failed to save consultation. Please try again.');
    }
  }, []);

  const handleSessionTimeout = useCallback(async () => {
    try {
      await handleSaveAll();
      toast.info('Session expired. Redirecting to login...');
      router.push('/login?reason=timeout');
    } catch (error) {
      console.error('Error during session timeout:', error);
    }
  }, [handleSaveAll, router]);

  // Remove auto-save effect to prevent infinite loops - manual save only
  // Auto-save removed due to potential infinite loop issues
  // Users can manually save using Ctrl+S or the Save button

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

  // Session timeout management with proper cleanup
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Show warning at 5 minutes
        if (newTime === 300 && !showTimeoutWarning) {
          setShowTimeoutWarning(true);
        }
        
        // Handle timeout
        if (newTime <= 0 && !hasTimedOut) {
          setHasTimedOut(true);
          handleSessionTimeout();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasTimedOut, showTimeoutWarning, handleSessionTimeout]);

  const extendSession = () => {
    setSessionTimeLeft(30 * 60);
    setShowTimeoutWarning(false);
    toast.success('Session extended for 30 minutes');
  };

  const handleEndConsultation = () => {
    setShowEndDialog(true);
  };

  const confirmEndConsultation = async () => {
    setIsEnding(true);
    try {
      await handleSaveAll();
      await generateConsultationSummary();
      toast.success('Consultation completed successfully');
      router.push('/consultation/start-consultation');
    } catch (error) {
      console.error('Error ending consultation:', error);
      toast.error('Error ending consultation. Please try again.');
    } finally {
      setIsEnding(false);
      setShowEndDialog(false);
    }
  };

  const generateConsultationSummary = async () => {
    try {
      // Simulate API call to generate summary
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Consultation summary generated');
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  };

  const handleExportSummary = async () => {
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Summary exported successfully');
    } catch (error) {
      console.error('Error exporting summary:', error);
      toast.error('Failed to export summary');
    }
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setConsultationProgress(prev => ({
      ...prev,
      [newTab]: true,
    }));
    setHasUnsavedChanges(true);
  };

  const progressPercentage = useMemo(() => {
    const completed = Object.values(consultationProgress).filter(Boolean).length;
    return (completed / Object.keys(consultationProgress).length) * 100;
  }, [consultationProgress]);

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Consultation Session</h1>
            <p className="text-gray-600">Room: {roomId} • Dr. Sarah Wilson</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Session: {formatTimeRemaining(sessionTimeLeft)}</span>
              </div>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <span>{Math.round(progressPercentage)}% completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Consultation progress"
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
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
            <div className="space-y-2 lg:text-right">
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

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
          <TabsTrigger value="notes" className="flex items-center gap-1 text-xs sm:text-sm">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-1 text-xs sm:text-sm">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center gap-1 text-xs sm:text-sm">
            <TestTube className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Lab Orders</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-1 text-xs sm:text-sm">
            <Pill className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Prescriptions</span>
          </TabsTrigger>
          <TabsTrigger value="nursing" className="flex items-center gap-1 text-xs sm:text-sm">
            <Syringe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Nursing</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-1 text-xs sm:text-sm">
            <Building className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Referrals</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm">
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes"><MedicalNotes visitId={roomId} /></TabsContent>
        <TabsContent value="vitals"><VitalsSection visitId={roomId} /></TabsContent>
        <TabsContent value="lab"><LabOrders visitId={roomId} /></TabsContent>
        <TabsContent value="prescriptions"><Prescriptions visitId={roomId} /></TabsContent>
        <TabsContent value="nursing"><NursingOrders visitId={roomId} /></TabsContent>
        <TabsContent value="referrals"><Referrals visitId={roomId} /></TabsContent>
        <TabsContent value="history"><PatientHistory visitId={roomId} /></TabsContent>
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
              {isEnding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                "End Consultation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Timeout Warning Dialog */}
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

export default StartConsultation;