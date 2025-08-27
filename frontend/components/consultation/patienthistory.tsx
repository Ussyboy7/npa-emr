import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Calendar, FileText, Pill, TestTube, Search } from 'lucide-react';

interface PatientHistoryProps {
  visitId: string;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ visitId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock historical data
  const previousVisits = [
    {
      id: 1,
      visit_date: '2024-01-10',
      chief_complaint: 'Annual checkup',
      diagnosis: 'Hypertension, well controlled',
      doctor: 'Dr. Wilson',
      status: 'completed'
    },
    {
      id: 2,
      visit_date: '2023-12-15',
      chief_complaint: 'Flu symptoms',
      diagnosis: 'Viral upper respiratory infection',
      doctor: 'Dr. Johnson',
      status: 'completed'
    },
    {
      id: 3,
      visit_date: '2023-11-20',
      chief_complaint: 'Follow-up for hypertension',
      diagnosis: 'Hypertension',
      doctor: 'Dr. Wilson',
      status: 'completed'
    }
  ];

  const medicationHistory = [
    {
      id: 1,
      drug_name: 'Lisinopril',
      dosage: '10mg',
      start_date: '2023-01-15',
      end_date: null,
      status: 'active',
      prescribed_by: 'Dr. Wilson'
    },
    {
      id: 2,
      drug_name: 'Ibuprofen',
      dosage: '400mg',
      start_date: '2023-12-15',
      end_date: '2023-12-20',
      status: 'completed',
      prescribed_by: 'Dr. Johnson'
    }
  ];

  const labResults = [
    {
      id: 1,
      test_name: 'Complete Blood Count',
      test_date: '2024-01-10',
      results: 'Normal - WBC: 7.2, RBC: 4.5, Hgb: 14.2',
      status: 'normal'
    },
    {
      id: 2,
      test_name: 'Lipid Panel',
      test_date: '2024-01-10',
      results: 'Total Cholesterol: 185, LDL: 110, HDL: 45',
      status: 'borderline'
    },
    {
      id: 3,
      test_name: 'Basic Metabolic Panel',
      test_date: '2023-11-20',
      results: 'Glucose: 95, Creatinine: 1.0, eGFR: >60',
      status: 'normal'
    }
  ];

  const allergies = [
    {
      id: 1,
      allergen: 'Penicillin',
      reaction: 'Rash',
      severity: 'moderate',
      date_identified: '2020-03-15'
    },
    {
      id: 2,
      allergen: 'Shellfish',
      reaction: 'Anaphylaxis',
      severity: 'severe',
      date_identified: '2018-07-22'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'borderline': return 'bg-yellow-100 text-yellow-800';
      case 'abnormal': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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
          <Tabs defaultValue="visits" className="space-y-4">
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
              {previousVisits.map((visit) => (
                <Card key={visit.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{visit.chief_complaint}</h4>
                        <p className="text-sm text-gray-600">{visit.diagnosis}</p>
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
              {medicationHistory.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{medication.drug_name}</h4>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
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
              {labResults.map((lab) => (
                <Card key={lab.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{lab.test_name}</h4>
                        <p className="text-sm text-gray-600">{lab.results}</p>
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
              {allergies.map((allergy) => (
                <Card key={allergy.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{allergy.allergen}</h4>
                        <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
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
    </div>
  );
};

export default PatientHistory;