import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Calendar, FileText, Pill, TestTube, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PatientHistoryProps {
  visitId: string;
  currentVisit?: {
    id: string;
    date: string;
    chief_complaint: string;
    diagnosis?: string;
    status: string;
    doctor: string;
  };
}

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string;
  diagnosis: string;
  doctor: string;
  status: string;
  relevance_score?: number;
}

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
  start_date: string;
  end_date: string | null;
  status: string;
  prescribed_by: string;
  relevance_score?: number;
}

interface LabResult {
  id: string;
  test_name: string;
  test_date: string;
  results: string;
  status: string;
  relevance_score?: number;
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: string;
  date_identified: string;
  relevance_score?: number;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ visitId, currentVisit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('visits');
  
  // Mock historical data with relevance to current visit
  const previousVisits: Visit[] = [
    {
      id: 'v1',
      visit_date: '2024-01-10',
      chief_complaint: 'Annual checkup',
      diagnosis: 'Hypertension, well controlled',
      doctor: 'Dr. Wilson',
      status: 'completed',
      relevance_score: 0.7
    },
    {
      id: 'v2',
      visit_date: '2023-12-15',
      chief_complaint: 'Flu symptoms',
      diagnosis: 'Viral upper respiratory infection',
      doctor: 'Dr. Johnson',
      status: 'completed',
      relevance_score: 0.5
    },
    {
      id: 'v3',
      visit_date: '2023-11-20',
      chief_complaint: 'Follow-up for hypertension',
      diagnosis: 'Hypertension',
      doctor: 'Dr. Wilson',
      status: 'completed',
      relevance_score: 0.9
    }
  ];
  
  const medicationHistory: Medication[] = [
    {
      id: 'm1',
      drug_name: 'Lisinopril',
      dosage: '10mg',
      start_date: '2023-01-15',
      end_date: null,
      status: 'active',
      prescribed_by: 'Dr. Wilson',
      relevance_score: 0.8
    },
    {
      id: 'm2',
      drug_name: 'Ibuprofen',
      dosage: '400mg',
      start_date: '2023-12-15',
      end_date: '2023-12-20',
      status: 'completed',
      prescribed_by: 'Dr. Johnson',
      relevance_score: 0.3
    },
    {
      id: 'm3',
      drug_name: 'Metformin',
      dosage: '500mg',
      start_date: '2022-05-10',
      end_date: null,
      status: 'active',
      prescribed_by: 'Dr. Wilson',
      relevance_score: 0.7
    }
  ];
  
  const labResults: LabResult[] = [
    {
      id: 'l1',
      test_name: 'Complete Blood Count',
      test_date: '2024-01-10',
      results: 'Normal - WBC: 7.2, RBC: 4.5, Hgb: 14.2',
      status: 'normal',
      relevance_score: 0.6
    },
    {
      id: 'l2',
      test_name: 'Lipid Panel',
      test_date: '2024-01-10',
      results: 'Total Cholesterol: 185, LDL: 110, HDL: 45',
      status: 'borderline',
      relevance_score: 0.7
    },
    {
      id: 'l3',
      test_name: 'Basic Metabolic Panel',
      test_date: '2023-11-20',
      results: 'Glucose: 95, Creatinine: 1.0, eGFR: >60',
      status: 'normal',
      relevance_score: 0.5
    },
    {
      id: 'l4',
      test_name: 'HbA1c',
      test_date: '2023-11-20',
      results: '6.2%',
      status: 'elevated',
      relevance_score: 0.9
    }
  ];
  
  const allergies: Allergy[] = [
    {
      id: 'a1',
      allergen: 'Penicillin',
      reaction: 'Rash',
      severity: 'moderate',
      date_identified: '2020-03-15',
      relevance_score: 0.8
    },
    {
      id: 'a2',
      allergen: 'Shellfish',
      reaction: 'Anaphylaxis',
      severity: 'severe',
      date_identified: '2018-07-22',
      relevance_score: 0.6
    }
  ];
  
  // Relevance calculation function
  const calculateRelevance = (item: any, currentVisit: any) => {
    if (!currentVisit) return 0;
    
    let score = 0;
    
    // Check if item mentions current visit's chief complaint
    if (currentVisit.chief_complaint && 
        (item.chief_complaint?.toLowerCase().includes(currentVisit.chief_complaint.toLowerCase()) ||
         item.diagnosis?.toLowerCase().includes(currentVisit.chief_complaint.toLowerCase()))) {
      score += 0.5;
    }
    
    // Check if item is from the same doctor as current visit
    if (currentVisit.doctor && item.doctor === currentVisit.doctor) {
      score += 0.2;
    }
    
    // Check if item is recent (within last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const itemDate = new Date(item.visit_date || item.test_date || item.date_identified || item.start_date);
    
    if (itemDate >= threeMonthsAgo) {
      score += 0.3;
    }
    
    return Math.min(score, 1); // Cap at 1
  };
  
  // Calculate relevance scores for all items
  useEffect(() => {
    if (currentVisit) {
      previousVisits.forEach(visit => {
        visit.relevance_score = calculateRelevance(visit, currentVisit);
      });
      
      medicationHistory.forEach(med => {
        med.relevance_score = calculateRelevance(med, currentVisit);
      });
      
      labResults.forEach(lab => {
        lab.relevance_score = calculateRelevance(lab, currentVisit);
      });
      
      allergies.forEach(allergy => {
        allergy.relevance_score = calculateRelevance(allergy, currentVisit);
      });
    }
  }, [currentVisit]);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'borderline': return 'bg-yellow-100 text-yellow-800';
      case 'elevated': return 'bg-orange-100 text-orange-800';
      case 'abnormal': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRelevanceIcon = (score?: number) => {
    if (score === undefined) return null;
    
    if (score >= 0.8) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (score >= 0.5) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else if (score > 0) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    
    return null;
  };
  
  const sortItemsByRelevance = (items: any[]) => {
    return [...items].sort((a, b) => {
      // Current visit should always be first
      if (currentVisit && a.id === currentVisit.id) return -1;
      if (currentVisit && b.id === currentVisit.id) return 1;
      
      // Then sort by relevance score
      if (a.relevance_score !== undefined && b.relevance_score !== undefined) {
        return b.relevance_score - a.relevance_score;
      }
      
      return 0;
    });
  };
  
  const filteredVisits = sortItemsByRelevance(
    previousVisits.filter(visit => 
      visit.chief_complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.doctor.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredMedications = sortItemsByRelevance(
    medicationHistory.filter(med => 
      med.drug_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.prescribed_by.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredLabs = sortItemsByRelevance(
    labResults.filter(lab => 
      lab.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.results.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredAllergies = sortItemsByRelevance(
    allergies.filter(allergy => 
      allergy.allergen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allergy.reaction.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Patient History
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visits" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Visits
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medications
              </TabsTrigger>
              <TabsTrigger value="labs" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Lab Results
              </TabsTrigger>
              <TabsTrigger value="allergies" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Allergies
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visits" className="space-y-4">
              {currentVisit && (
                <Card className="border-2 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-700">Current Visit</span>
                        {getRelevanceIcon(1)}
                      </div>
                      <Badge className={getStatusColor(currentVisit.status)}>
                        {currentVisit.status}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <h4 className="font-medium">{currentVisit.chief_complaint}</h4>
                      <p className="text-sm text-gray-600">{currentVisit.diagnosis || 'Diagnosis pending'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div>{new Date(currentVisit.date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Doctor:</span>
                        <div>{currentVisit.doctor}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {filteredVisits.map((visit) => (
                <Card key={visit.id} className={visit.id === currentVisit?.id ? 'border-2 border-blue-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <h4 className="font-medium">{visit.chief_complaint}</h4>
                          <p className="text-sm text-gray-600">{visit.diagnosis}</p>
                        </div>
                        {getRelevanceIcon(visit.relevance_score)}
                      </div>
                      <Badge className={getStatusColor(visit.status)}>
                        {visit.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div>{new Date(visit.visit_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Doctor:</span>
                        <div>{visit.doctor}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="medications" className="space-y-4">
              {filteredMedications.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <h4 className="font-medium">{medication.drug_name}</h4>
                          <p className="text-sm text-gray-600">{medication.dosage}</p>
                        </div>
                        {getRelevanceIcon(medication.relevance_score)}
                      </div>
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Started:</span>
                        <div>{new Date(medication.start_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Ended:</span>
                        <div>{medication.end_date ? new Date(medication.end_date).toLocaleDateString() : 'Ongoing'}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Prescribed by:</span>
                        <div>{medication.prescribed_by}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="labs" className="space-y-4">
              {filteredLabs.map((lab) => (
                <Card key={lab.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <h4 className="font-medium">{lab.test_name}</h4>
                          <p className="text-sm text-gray-600">{lab.results}</p>
                        </div>
                        {getRelevanceIcon(lab.relevance_score)}
                      </div>
                      <Badge className={getStatusColor(lab.status)}>
                        {lab.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Date:</span>
                      <div>{new Date(lab.test_date).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="allergies" className="space-y-4">
              {filteredAllergies.map((allergy) => (
                <Card key={allergy.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <h4 className="font-medium">{allergy.allergen}</h4>
                          <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                        </div>
                        {getRelevanceIcon(allergy.relevance_score)}
                      </div>
                      <Badge className={getSeverityColor(allergy.severity)}>
                        {allergy.severity}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Identified:</span>
                      <div>{new Date(allergy.date_identified).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Relevance Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Relevance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Highly relevant</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Moderately relevant</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Somewhat relevant</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistory;