// components/consultation/systemicexamination.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, CheckCircle } from 'lucide-react';

interface SystemicExaminationProps {
  visitId: string;
}

const bodySystems = [
  { id: 'cardiovascular', name: 'Cardiovascular', icon: '❤️' },
  { id: 'respiratory', name: 'Respiratory', icon: '🫁' },
  { id: 'gastrointestinal', name: 'Gastrointestinal', icon: '🦠' },
  { id: 'neurological', name: 'Neurological', icon: '🧠' },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: '💪' },
  { id: 'integumentary', name: 'Integumentary', icon: '👁️' },
  { id: 'endocrine', name: 'Endocrine', icon: '🔬' },
  { id: 'lymphatic', name: 'Lymphatic', icon: '🩸' },
];

const SystemicExamination: React.FC<SystemicExaminationProps> = ({ visitId }) => {
  const [findings, setFindings] = useState<Record<string, string>>({});
  const [completedSystems, setCompletedSystems] = useState<string[]>([]);

  const handleFindingChange = (systemId: string, value: string) => {
    setFindings(prev => ({ ...prev, [systemId]: value }));
    
    if (value.trim() && !completedSystems.includes(systemId)) {
      setCompletedSystems(prev => [...prev, systemId]);
    } else if (!value.trim() && completedSystems.includes(systemId)) {
      setCompletedSystems(prev => prev.filter(id => id !== systemId));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Systemic Examination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {bodySystems.map((system) => (
              <div key={system.id} className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <span className="text-xl">{system.icon}</span>
                    {system.name}
                  </Label>
                  {completedSystems.includes(system.id) && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder={`Describe findings for ${system.name} system...`}
                  value={findings[system.id] || ''}
                  onChange={(e) => handleFindingChange(system.id, e.target.value)}
                  className="min-h-24"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Completed: {completedSystems.length}/{bodySystems.length} systems
            </div>
            <Button>
              Save Examination Findings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemicExamination;