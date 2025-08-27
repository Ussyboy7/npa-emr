"use client";

import React, { useState, useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Thermometer, 
  Heart, 
  Activity, 
  Wind, 
  Ruler, 
  Weight, 
  Droplets, 
  Save, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  Calendar,
  Eye,
  Plus,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// Types
interface VitalsData {
  id?: string;
  height: string;
  weight: string;
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  oxygenSaturation: string;
  fbs: string;
  rbs: string;
  painScale: string;
  comment?: string;
  recordedAt?: string;
  recordedBy?: string;
}

interface VitalRecord extends VitalsData {
  id: string;
  recordedAt: string;
  recordedBy: string;
  patientName: string;
  personalNumber: string;
}

// Normal ranges and validation
const normalRanges = {
  temperature: { min: 36.1, max: 37.2, unit: '°C', critical: { min: 35, max: 39 } },
  bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg', critical: { min: 70, max: 180 } },
  bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg', critical: { min: 40, max: 120 } },
  pulse: { min: 60, max: 100, unit: 'bpm', critical: { min: 50, max: 120 } },
  respiratoryRate: { min: 12, max: 20, unit: '/min', critical: { min: 8, max: 30 } },
  oxygenSaturation: { min: 95, max: 100, unit: '%', critical: { min: 90, max: 100 } },
  fbs: { min: 70, max: 99, unit: 'mg/dL', critical: { min: 40, max: 400 } },
  rbs: { min: 70, max: 140, unit: 'mg/dL', critical: { min: 40, max: 400 } },
  painScale: { min: 0, max: 3, unit: '/10', critical: { min: 0, max: 10 } }
};

// Mock data for demonstration - Extended with more records for pagination
const mockVitalsHistory: VitalRecord[] = [
  {
    id: '1',
    height: '170',
    weight: '70',
    temperature: '38.5',
    pulse: '85',
    respiratoryRate: '16',
    bloodPressureSystolic: '120',
    bloodPressureDiastolic: '80',
    oxygenSaturation: '98',
    fbs: '90',
    rbs: '120',
    painScale: '2',
    comment: 'Patient feeling well',
    recordedAt: '2024-08-16T10:30:00Z',
    recordedBy: 'Dr. Smith',
    patientName: 'John Doe',
    personalNumber: 'P001'
  },
  {
    id: '2',
    height: '170',
    weight: '70',
    temperature: '36.8',
    pulse: '78',
    respiratoryRate: '14',
    bloodPressureSystolic: '130',
    bloodPressureDiastolic: '85',
    oxygenSaturation: '97',
    fbs: '85',
    rbs: '110',
    painScale: '1',
    recordedAt: '2024-08-15T14:20:00Z',
    recordedBy: 'Nurse Johnson',
    patientName: 'John Doe',
    personalNumber: 'P001'
  },
  {
    id: '3',
    height: '170',
    weight: '69',
    temperature: '37.1',
    pulse: '82',
    respiratoryRate: '15',
    bloodPressureSystolic: '125',
    bloodPressureDiastolic: '82',
    oxygenSaturation: '99',
    fbs: '88',
    rbs: '105',
    painScale: '0',
    comment: 'Normal checkup',
    recordedAt: '2024-08-14T09:15:00Z',
    recordedBy: 'Dr. Williams',
    patientName: 'John Doe',
    personalNumber: 'P001'
  },
  {
    id: '4',
    height: '170',
    weight: '71',
    temperature: '36.9',
    pulse: '75',
    respiratoryRate: '13',
    bloodPressureSystolic: '118',
    bloodPressureDiastolic: '78',
    oxygenSaturation: '98',
    fbs: '92',
    rbs: '115',
    painScale: '1',
    recordedAt: '2024-08-13T16:45:00Z',
    recordedBy: 'Nurse Alice',
    patientName: 'John Doe',
    personalNumber: 'P001'
  },
  {
    id: '5',
    height: '170',
    weight: '70',
    temperature: '37.0',
    pulse: '80',
    respiratoryRate: '16',
    bloodPressureSystolic: '122',
    bloodPressureDiastolic: '81',
    oxygenSaturation: '97',
    fbs: '89',
    rbs: '108',
    painScale: '2',
    recordedAt: '2024-08-12T11:30:00Z',
    recordedBy: 'Dr. Brown',
    patientName: 'John Doe',
    personalNumber: 'P001'
  },
  {
    id: '6',
    height: '170',
    weight: '70',
    temperature: '36.7',
    pulse: '73',
    respiratoryRate: '14',
    bloodPressureSystolic: '115',
    bloodPressureDiastolic: '75',
    oxygenSaturation: '98',
    fbs: '86',
    rbs: '102',
    painScale: '0',
    recordedAt: '2024-08-11T08:20:00Z',
    recordedBy: 'Nurse Davis',
    patientName: 'John Doe',
    personalNumber: 'P001'
  }
];

const VitalsManagement: React.FC = () => {
  const [formData, setFormData] = useState<VitalsData>({
    height: '',
    weight: '',
    temperature: '',
    pulse: '',
    respiratoryRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    oxygenSaturation: '',
    fbs: '',
    rbs: '',
    painScale: '',
    comment: ''
  });

  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>(mockVitalsHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VitalRecord | null>(null);
  const [viewRecordOpen, setViewRecordOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTimes, setExpandedTimes] = useState<{ [key: string]: boolean }>({});
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(3);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recordedByFilter, setRecordedByFilter] = useState('all');

  // Status checking functions
  const getVitalStatus = (field: keyof typeof normalRanges, value: string): 'normal' | 'high' | 'low' | 'critical' => {
    if (!value || value === '') return 'normal';
    
    const numValue = parseFloat(value);
    const range = normalRanges[field];
    
    if (!range) return 'normal';
    
    // Check critical ranges first
    if (numValue <= range.critical.min || numValue >= range.critical.max) return 'critical';
    
    // Check normal ranges
    if (numValue >= range.min && numValue <= range.max) return 'normal';
    if (numValue > range.max) return 'high';
    if (numValue < range.min) return 'low';
    
    return 'normal';
  };

  const getRecordOverallStatus = (record: VitalRecord): 'normal' | 'alert' => {
    const vitalsToCheck = [
      { field: 'temperature', value: record.temperature },
      { field: 'bloodPressureSystolic', value: record.bloodPressureSystolic },
      { field: 'pulse', value: record.pulse },
      { field: 'oxygenSaturation', value: record.oxygenSaturation }
    ];

    for (const vital of vitalsToCheck) {
      const status = getVitalStatus(vital.field as keyof typeof normalRanges, vital.value);
      if (status === 'critical' || status === 'high' || status === 'low') {
        return 'alert';
      }
    }
    return 'normal';
  };

  // Filtering logic
  const filteredHistory = useMemo(() => {
    return vitalsHistory.filter(record => {
      // Date filter
      if (dateFilter && dateFilter !== 'all') {
        const recordDate = new Date(record.recordedAt).toISOString().split('T')[0];
        if (recordDate !== dateFilter) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const recordStatus = getRecordOverallStatus(record);
        if (recordStatus !== statusFilter) return false;
      }
      
      // Recorded by filter
      if (recordedByFilter && recordedByFilter !== 'all') {
        if (record.recordedBy !== recordedByFilter) return false;
      }
      
      return true;
    });
  }, [vitalsHistory, dateFilter, statusFilter, recordedByFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, statusFilter, recordedByFilter]);

  // Get unique dates and recorded by options for filters
  const uniqueDates = useMemo(() => {
    const dates = vitalsHistory.map(record => 
      new Date(record.recordedAt).toISOString().split('T')[0]
    );
    return [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  }, [vitalsHistory]);

  const uniqueRecordedBy = useMemo(() => {
    const recordedBy = vitalsHistory.map(record => record.recordedBy);
    return [...new Set(recordedBy)].sort();
  }, [vitalsHistory]);

  const clearFilters = () => {
    setDateFilter('all');
    setStatusFilter('all');
    setRecordedByFilter('all');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'normal': return 'bg-green-50 text-green-700 border-green-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <TrendingUp className="h-3 w-3" />;
      case 'low': return <TrendingDown className="h-3 w-3" />;
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  // Critical alerts
  const criticalAlerts = useMemo(() => {
    const alerts: string[] = [];
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key in normalRanges && value) {
        const status = getVitalStatus(key as keyof typeof normalRanges, value);
        if (status === 'critical') {
          const range = normalRanges[key as keyof typeof normalRanges];
          alerts.push(`Critical ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}${range.unit}`);
        }
      }
    });
    
    return alerts;
  }, [formData]);

  // BMI calculation
  const calculateBMI = (): number | null => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    
    if (weight && height) {
      const heightInM = height / 100;
      return Math.round((weight / (heightInM * heightInM)) * 10) / 10;
    }
    return null;
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // Vital signs configuration
  const vitalSigns = [
    {
      id: 'temperature',
      label: 'Temperature',
      unit: '°C',
      icon: <Thermometer className="h-4 w-4" />,
      required: true,
      placeholder: '36.5'
    },
    {
      id: 'bloodPressureSystolic',
      label: 'Systolic BP',
      unit: 'mmHg',
      icon: <Heart className="h-4 w-4" />,
      required: true,
      placeholder: '120'
    },
    {
      id: 'bloodPressureDiastolic',
      label: 'Diastolic BP',
      unit: 'mmHg',
      icon: <Heart className="h-4 w-4" />,
      required: true,
      placeholder: '80'
    },
    {
      id: 'pulse',
      label: 'Pulse',
      unit: 'bpm',
      icon: <Activity className="h-4 w-4" />,
      required: true,
      placeholder: '72'
    },
    {
      id: 'respiratoryRate',
      label: 'Respiratory Rate',
      unit: '/min',
      icon: <Wind className="h-4 w-4" />,
      required: true,
      placeholder: '16'
    },
    {
      id: 'oxygenSaturation',
      label: 'Oxygen Saturation',
      unit: '%',
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: '98'
    },
    {
      id: 'height',
      label: 'Height',
      unit: 'cm',
      icon: <Ruler className="h-4 w-4" />,
      required: false,
      placeholder: '170'
    },
    {
      id: 'weight',
      label: 'Weight',
      unit: 'kg',
      icon: <Weight className="h-4 w-4" />,
      required: false,
      placeholder: '70'
    },
    {
      id: 'fbs',
      label: 'FBS',
      unit: 'mg/dL',
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: '90'
    },
    {
      id: 'rbs',
      label: 'RBS',
      unit: 'mg/dL',
      icon: <Droplets className="h-4 w-4" />,
      required: false,
      placeholder: '120'
    },
    {
      id: 'painScale',
      label: 'Pain Scale',
      unit: '/10',
      icon: <AlertTriangle className="h-4 w-4" />,
      required: false,
      placeholder: '0'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecord: VitalRecord = {
        ...formData,
        id: Date.now().toString(),
        recordedAt: new Date().toISOString(),
        recordedBy: 'Current User',
        patientName: 'John Doe',
        personalNumber: 'P001'
      };

      setVitalsHistory(prev => [newRecord, ...prev]);
      
      // Reset form
      setFormData({
        height: '',
        weight: '',
        temperature: '',
        pulse: '',
        respiratoryRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        oxygenSaturation: '',
        fbs: '',
        rbs: '',
        painScale: '',
        comment: ''
      });

      alert('Vitals saved successfully!');
    } catch (error) {
      alert('Error saving vitals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const viewRecord = (record: VitalRecord) => {
    setSelectedRecord(record);
    setViewRecordOpen(true);
  };

  const bmi = calculateBMI();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong className="text-red-800">Critical Values Alert:</strong>
            <ul className="mt-2 space-y-1">
              {criticalAlerts.map((alert, index) => (
                <li key={index} className="text-red-700">• {alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Recording Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Record New Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vitalSigns.map((vital) => (
                <div key={vital.id} className="space-y-2">
                  <Label htmlFor={vital.id} className="flex items-center gap-2">
                    {vital.icon}
                    {vital.label} ({vital.unit})
                    {vital.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={vital.id}
                      name={vital.id}
                      type="number"
                      step="0.1"
                      value={formData[vital.id as keyof VitalsData] || ''}
                      onChange={handleChange}
                      required={vital.required}
                      placeholder={vital.placeholder}
                    />
                    {formData[vital.id as keyof VitalsData] && vital.id in normalRanges && (
                      <Badge 
                        className={`absolute -top-2 -right-2 px-1 py-0 text-xs ${getStatusColor(getVitalStatus(vital.id as keyof typeof normalRanges, formData[vital.id as keyof VitalsData]))}`}
                      >
                        {getStatusIcon(getVitalStatus(vital.id as keyof typeof normalRanges, formData[vital.id as keyof VitalsData]))}
                        {getVitalStatus(vital.id as keyof typeof normalRanges, formData[vital.id as keyof VitalsData])}
                      </Badge>
                    )}
                  </div>
                  {vital.id in normalRanges && (
                    <div className="text-xs text-gray-500">
                      Normal: {normalRanges[vital.id as keyof typeof normalRanges].min}-{normalRanges[vital.id as keyof typeof normalRanges].max} {vital.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BMI Display */}
            {bmi && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Body Mass Index (BMI)</p>
                    <p className="text-sm text-gray-600">
                      BMI: <span className="font-medium">{bmi}</span> - {getBMICategory(bmi)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {getBMICategory(bmi)} 
                  </Badge>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comment">Additional Comments</Label>
              <Textarea
                id="comment"
                name="comment"
                value={formData.comment || ''}
                onChange={handleChange}
                placeholder="Additional observations or notes..."
                className="min-h-[80px]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isSaving} className="min-w-32">
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Vitals
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Vitals */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Recent Vitals</CardTitle>
            <Button onClick={() => setHistoryOpen(true)} variant="outline" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              View Full History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vitalsHistory.slice(0, 5).map((record) => {
              const time = new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const date = new Date(record.recordedAt).toLocaleDateString();
              const key = record.id;
              const isExpanded = expandedTimes[key];
              
              const vitalsData = {
                temperature: record.temperature,
                blood_pressure: `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`,
                heart_rate: record.pulse,
                respiratory_rate: record.respiratoryRate,
                oxygen_saturation: record.oxygenSaturation,
                weight: record.weight,
                height: record.height,
                fbs: record.fbs,
                rbs: record.rbs,
                pain_scale: record.painScale
              };

              return (
                <div key={key} className="border rounded-md">
                  <div className="flex items-center justify-between p-3">
                    <div className="text-sm">
                      <div className="font-medium">
                        {time} — Recorded by {record.recordedBy}
                      </div>
                      <div className="text-xs text-gray-500">{date}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedTimes(prev => ({ ...prev, [key]: !prev[key] }))}
                    >
                      {isExpanded ? "▼ Hide" : "▶ Show"}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 pt-0 space-y-3">
                      {/* Vital Signs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(vitalsData).map(([k, v]) => {
                          const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          let unit = '';
                          let statusKey = k;
                          
                          switch (k) {
                            case 'temperature': unit = '°C'; break;
                            case 'blood_pressure': unit = 'mmHg'; statusKey = 'bloodPressureSystolic'; break;
                            case 'heart_rate': unit = 'bpm'; statusKey = 'pulse'; break;
                            case 'respiratory_rate': unit = '/min'; statusKey = 'respiratoryRate'; break;
                            case 'oxygen_saturation': unit = '%'; statusKey = 'oxygenSaturation'; break;
                            case 'weight': unit = 'kg'; break;
                            case 'height': unit = 'cm'; break;
                            case 'fbs':
                            case 'rbs': unit = 'mg/dL'; break;
                            case 'pain_scale': unit = '/10'; statusKey = 'painScale'; break;
                          }
                          
                          const status = statusKey in normalRanges ? getVitalStatus(statusKey as keyof typeof normalRanges, v) : 'normal';
                          
                          return (
                            <div key={k} className={`p-3 border rounded-lg ${getStatusColor(status)}`}>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium">
                                  {label}
                                </label>
                                {getStatusIcon(status)}
                              </div>
                              <p className="text-lg font-semibold">
                                {v || "Not recorded"} {unit}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      
                      {record.comment && (
                        <div className="p-3 bg-gray-50 rounded">
                          <h4 className="font-medium mb-1 text-sm">Comments:</h4>
                          <p className="text-sm text-gray-700">{record.comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Vitals History
            </DialogTitle>
          </DialogHeader>

          {/* Filters Section */}
          <div className="space-y-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {(dateFilter !== 'all' || statusFilter !== 'all' || recordedByFilter !== 'all') && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Date Filter */}
              <div>
                <Label className="text-sm">Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All dates</SelectItem>
                    {uniqueDates.map(date => (
                      <SelectItem key={date} value={date}>
                        {new Date(date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alert">Has Alerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recorded By Filter */}
              <div>
                <Label className="text-sm">Recorded By</Label>
                <Select value={recordedByFilter} onValueChange={setRecordedByFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All staff</SelectItem>
                    {uniqueRecordedBy.map(person => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <Badge variant="outline" className="h-10 flex items-center">
                  {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto pr-2" style={{ maxHeight: "50vh" }}>
            <div className="space-y-4">
              {currentRecords.length > 0 ? (
                currentRecords.map((record) => {
                  const time = new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const date = new Date(record.recordedAt).toLocaleDateString();
                  const key = `history_${record.id}`;
                  const isExpanded = expandedTimes[key];
                  const recordStatus = getRecordOverallStatus(record);
                  
                  const vitalsData = {
                    temperature: record.temperature,
                    blood_pressure: `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`,
                    heart_rate: record.pulse,
                    respiratory_rate: record.respiratoryRate,
                    oxygen_saturation: record.oxygenSaturation,
                    weight: record.weight,
                    height: record.height,
                    fbs: record.fbs,
                    rbs: record.rbs,
                    pain_scale: record.painScale
                  };

                  return (
                    <div key={key} className="border rounded-md">
                      <div className="flex items-center justify-between p-3">
                        <div className="text-sm flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {time} — Recorded by {record.recordedBy}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={recordStatus === 'alert' ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'}
                              >
                                {recordStatus === 'alert' ? (
                                  <>
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Alert
                                  </>
                                ) : (
                                  'Normal'
                                )}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{date}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedTimes(prev => ({ ...prev, [key]: !prev[key] }))}
                        >
                          {isExpanded ? "▼ Hide" : "▶ Show"}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="p-3 pt-0 space-y-3">
                          {/* Vital Signs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(vitalsData).map(([k, v]) => {
                              const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                              let unit = '';
                              let statusKey = k;
                              
                              switch (k) {
                                case 'temperature': unit = '°C'; break;
                                case 'blood_pressure': unit = 'mmHg'; statusKey = 'bloodPressureSystolic'; break;
                                case 'heart_rate': unit = 'bpm'; statusKey = 'pulse'; break;
                                case 'respiratory_rate': unit = '/min'; statusKey = 'respiratoryRate'; break;
                                case 'oxygen_saturation': unit = '%'; statusKey = 'oxygenSaturation'; break;
                                case 'weight': unit = 'kg'; break;
                                case 'height': unit = 'cm'; break;
                                case 'fbs':
                                case 'rbs': unit = 'mg/dL'; break;
                                case 'pain_scale': unit = '/10'; statusKey = 'painScale'; break;
                              }
                              
                              const status = statusKey in normalRanges ? getVitalStatus(statusKey as keyof typeof normalRanges, v) : 'normal';
                              
                              return (
                                <div key={k} className={`p-3 border rounded-lg ${getStatusColor(status)}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm font-medium">
                                      {label}
                                    </label>
                                    {getStatusIcon(status)}
                                  </div>
                                  <p className="text-lg font-semibold">
                                    {v || "Not recorded"} {unit}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          
                          {record.comment && (
                            <div className="p-3 bg-gray-50 rounded">
                              <h4 className="font-medium mb-1 text-sm">Comments:</h4>
                              <p className="text-sm text-gray-700">{record.comment}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No records found with current filters</p>
                  <Button variant="ghost" onClick={clearFilters} className="mt-2">
                    Clear filters to see all records
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredHistory.length)} of {filteredHistory.length} records
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Record Modal */}
      <Dialog open={viewRecordOpen} onOpenChange={setViewRecordOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Vital Signs Details - {selectedRecord && new Date(selectedRecord.recordedAt).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{selectedRecord.patientName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedRecord.personalNumber} • {new Date(selectedRecord.recordedAt).toLocaleDateString()} at {new Date(selectedRecord.recordedAt).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-400">Recorded by {selectedRecord.recordedBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vitalSigns.map((vital) => {
                  const value = selectedRecord[vital.id as keyof VitalRecord];
                  const status = vital.id in normalRanges ? getVitalStatus(vital.id as keyof typeof normalRanges, value) : 'normal';
                  
                  return (
                    <div key={vital.id} className={`p-3 rounded-lg border ${getStatusColor(status)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium flex items-center gap-1">
                          {vital.icon}
                          {vital.label}
                        </span>
                        {getStatusIcon(status)}
                      </div>
                      <p className="font-semibold">{value || 'Not recorded'}</p>
                      <p className="text-xs opacity-75">{vital.unit}</p>
                    </div>
                  );
                })}
              </div>

              {selectedRecord.comment && (
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Comments:</h4>
                  <p className="text-sm">{selectedRecord.comment}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRecordOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VitalsManagement;