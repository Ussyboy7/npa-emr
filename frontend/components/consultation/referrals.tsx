import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Send, MapPin, Phone, Mail } from 'lucide-react';

interface ReferralsProps {
  visitId: string;
}

const Referrals: React.FC<ReferralsProps> = ({ visitId }) => {
  const [referralData, setReferralData] = useState({
    facility: '',
    specialty: '',
    urgency: 'routine',
    reason: '',
    clinicalFindings: '',
    investigations: '',
    expectedOutcome: ''
  });

  const medicalFacilities = [
    {
      id: 'cardio-center',
      name: 'Metro Cardiology Center',
      specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
      address: '123 Heart Street, Medical District',
      phone: '+1-555-0123',
      email: 'referrals@metrocardio.com'
    },
    {
      id: 'neuro-institute',
      name: 'Advanced Neurology Institute',
      specialties: ['Neurology', 'Neurosurgery', 'Neuropsychology'],
      address: '456 Brain Avenue, Healthcare Plaza',
      phone: '+1-555-0456',
      email: 'intake@neuroinstitute.com'
    },
    {
      id: 'orthopedic-clinic',
      name: 'Orthopedic Excellence Clinic',
      specialties: ['Orthopedics', 'Sports Medicine', 'Joint Replacement'],
      address: '789 Bone Road, Sports Complex',
      phone: '+1-555-0789',
      email: 'referrals@orthoexcellence.com'
    },
    {
      id: 'cancer-center',
      name: 'Regional Cancer Treatment Center',
      specialties: ['Oncology', 'Radiation Therapy', 'Hematology'],
      address: '321 Hope Boulevard, Cancer Campus',
      phone: '+1-555-0321',
      email: 'patient.intake@cancercenter.org'
    },
    {
      id: 'womens-health',
      name: 'Women\'s Health Specialists',
      specialties: ['Gynecology', 'Obstetrics', 'Reproductive Endocrinology'],
      address: '654 Wellness Drive, Medical Park',
      phone: '+1-555-0654',
      email: 'appointments@womenshealth.com'
    },
    {
      id: 'eye-center',
      name: 'Vision Care Institute',
      specialties: ['Ophthalmology', 'Retinal Surgery', 'Glaucoma Treatment'],
      address: '987 Sight Street, Vision Plaza',
      phone: '+1-555-0987',
      email: 'referrals@visioncare.com'
    }
  ];

  const urgencyOptions = [
    { value: 'routine', label: 'Routine (2-4 weeks)' },
    { value: 'urgent', label: 'Urgent (within 1 week)' },
    { value: 'expedited', label: 'Expedited (within 48-72 hours)' },
    { value: 'emergency', label: 'Emergency (immediate)' }
  ];

  const [selectedFacility, setSelectedFacility] = useState<typeof medicalFacilities[0] | null>(null);

  const handleFacilityChange = (facilityId: string) => {
    const facility = medicalFacilities.find(f => f.id === facilityId);
    setSelectedFacility(facility || null);
    setReferralData({...referralData, facility: facilityId, specialty: ''});
  };

  const handleSendReferral = () => {
    if (!referralData.facility || !referralData.specialty || !referralData.reason) {
      return;
    }

    console.log('Sending referral for patient:', visitId, {
      ...referralData,
      facilityDetails: selectedFacility
    });

    // Reset form
    setReferralData({
      facility: '',
      specialty: '',
      urgency: 'routine',
      reason: '',
      clinicalFindings: '',
      investigations: '',
      expectedOutcome: ''
    });
    setSelectedFacility(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'expedited': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [activeReferrals] = useState([
    {
      id: 'ref-1',
      facility: 'Metro Cardiology Center',
      specialty: 'Cardiology',
      urgency: 'urgent',
      sentAt: '2024-01-15 10:30 AM',
      status: 'pending',
      reason: 'Chest pain evaluation'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* New Referral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Create Referral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Facility Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facility">Medical Facility</Label>
              <Select
                value={referralData.facility}
                onValueChange={handleFacilityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select medical facility" />
                </SelectTrigger>
                <SelectContent>
                  {medicalFacilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facility Details */}
            {selectedFacility && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{selectedFacility.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedFacility.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedFacility.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedFacility.email}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Available Specialties:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedFacility.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialty and Urgency */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty Required</Label>
                <Select
                  value={referralData.specialty}
                  onValueChange={(value) => setReferralData({...referralData, specialty: value})}
                  disabled={!selectedFacility}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFacility?.specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={referralData.urgency}
                  onValueChange={(value) => setReferralData({...referralData, urgency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Referral Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Referral</Label>
                <Textarea
                  id="reason"
                  placeholder="Primary reason for referring the patient..."
                  value={referralData.reason}
                  onChange={(e) => setReferralData({...referralData, reason: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinical-findings">Clinical Findings</Label>
                <Textarea
                  id="clinical-findings"
                  placeholder="Relevant clinical findings, examination results..."
                  value={referralData.clinicalFindings}
                  onChange={(e) => setReferralData({...referralData, clinicalFindings: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investigations">Investigations Done</Label>
                <Textarea
                  id="investigations"
                  placeholder="List of tests, procedures, and results already completed..."
                  value={referralData.investigations}
                  onChange={(e) => setReferralData({...referralData, investigations: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-outcome">Expected Outcome</Label>
                <Textarea
                  id="expected-outcome"
                  placeholder="What you hope to achieve from this referral..."
                  value={referralData.expectedOutcome}
                  onChange={(e) => setReferralData({...referralData, expectedOutcome: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSendReferral}
                disabled={!referralData.facility || !referralData.specialty || !referralData.reason}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Referral
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeReferrals.map((referral) => (
              <div key={referral.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Referral #{referral.id}</span>
                  <div className="flex gap-2">
                    <Badge className={getUrgencyColor(referral.urgency)}>
                      {referral.urgency.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{referral.status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Sent: {referral.sentAt}
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{referral.facility}</div>
                  <div className="text-sm text-gray-700">
                    Specialty: {referral.specialty}
                  </div>
                  <div className="text-sm text-gray-700">
                    Reason: {referral.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;