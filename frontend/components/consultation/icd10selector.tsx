// components/consultation/icd10selector.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Check } from 'lucide-react';

interface ICD10Code {
  code: string;
  description: string;
}

interface ICD10SelectorProps {
  value: string;
  onChange: (code: string, description: string) => void;
  disabled?: boolean;
}

const ICD10Selector: React.FC<ICD10SelectorProps> = ({ value, onChange, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Mock ICD-10 data (in real app, this would come from CSV)
  const icd10Data: ICD10Code[] = [
    { code: 'I10', description: 'Essential (primary) hypertension' },
    { code: 'E11', description: 'Type 2 diabetes mellitus' },
    { code: 'J45', description: 'Asthma' },
    { code: 'M54', description: 'Dorsalgia' },
    { code: 'K21', description: 'Gastro-esophageal reflux disease' },
    { code: 'I25', description: 'Chronic ischemic heart disease' },
    { code: 'F41', description: 'Anxiety disorders' },
    { code: 'M15', description: 'Osteoarthritis' },
    { code: 'E66', description: 'Obesity' },
    { code: 'J44', description: 'Chronic obstructive pulmonary disease' },
  ];

  const filteredCodes = icd10Data.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCode = (code: string, description: string) => {
    setSelectedCode(code);
    setSelectedDescription(description);
    onChange(code, description);
    setShowDropdown(false);
    setSearchTerm('');
  };

  // Extract current code and description from value
  const currentValueParts = value.split(': ');
  const currentCode = currentValueParts[0] || '';
  const currentDescription = currentValueParts[1] || '';

  return (
    <div className="space-y-2">
      <Label>Diagnosis (ICD-10 Code)</Label>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Search ICD-10 codes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
          />
          {currentCode && (
            <Badge variant="outline" className="flex items-center gap-1">
              {currentCode}: {currentDescription}
              <Check className="h-3 w-3" />
            </Badge>
          )}
        </div>
        
        {showDropdown && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredCodes.length > 0 ? (
              filteredCodes.map((item) => (
                <div
                  key={item.code}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => handleSelectCode(item.code, item.description)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{item.code}</span>
                    <Badge variant="outline">{item.code}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No matching ICD-10 codes found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ICD10Selector;