"use client"
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Send, X, Search, AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';

// Enhanced TypeScript interfaces
interface LabTest {
  id: string;
  name: string;
  category: string;
  code?: string;
  specimenType?: string;
  turnaroundTime?: string;
  specialInstructions?: string;
}

interface OrderDetails {
  priority: 'routine' | 'urgent' | 'stat';
  clinicalNotes: string;
  specialInstructions: string;
  collectionTime?: Date;
  fastingRequired?: boolean;
}

interface PendingOrder {
  id: string;
  tests: LabTest[];
  priority: OrderDetails['priority'];
  orderedAt: Date;
  status: 'pending' | 'collected' | 'in-progress' | 'completed' | 'cancelled';
  clinicalNotes?: string;
}

interface ValidationErrors {
  tests?: string;
  clinicalNotes?: string;
  priority?: string;
}

interface LabOrdersProps {
  visitId: string;
}

const LabOrders: React.FC<LabOrdersProps> = ({ visitId }) => {
  // State management
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    priority: 'routine',
    clinicalNotes: '',
    specialInstructions: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCustomTest, setShowCustomTest] = useState(false);
  const [customTest, setCustomTest] = useState({
    name: '',
    code: '',
    category: '',
    specimenType: '',
    specialInstructions: ''
  });

  // Lab tests data with enhanced information
  const labTests: LabTest[] = [
    { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Hematology', code: 'CBC001', specimenType: 'Blood', turnaroundTime: '2-4 hours' },
    { id: 'bmp', name: 'Basic Metabolic Panel', category: 'Chemistry', code: 'BMP001', specimenType: 'Blood', turnaroundTime: '1-2 hours' },
    { id: 'lipid', name: 'Lipid Panel', category: 'Chemistry', code: 'LIP001', specimenType: 'Blood', turnaroundTime: '2-4 hours' },
    { id: 'hba1c', name: 'HbA1c', category: 'Chemistry', code: 'HBA001', specimenType: 'Blood', turnaroundTime: '1-2 hours' },
    { id: 'tsh', name: 'Thyroid Stimulating Hormone', category: 'Endocrinology', code: 'TSH001', specimenType: 'Blood', turnaroundTime: '4-6 hours' },
    { id: 'urinalysis', name: 'Urinalysis', category: 'Urinalysis', code: 'UA001', specimenType: 'Urine', turnaroundTime: '1-2 hours' },
    { id: 'pt_inr', name: 'PT/INR', category: 'Coagulation', code: 'PT001', specimenType: 'Blood', turnaroundTime: '1-2 hours' },
    { id: 'esr', name: 'Erythrocyte Sedimentation Rate', category: 'Hematology', code: 'ESR001', specimenType: 'Blood', turnaroundTime: '2-4 hours' },
    { id: 'crp', name: 'C-Reactive Protein', category: 'Chemistry', code: 'CRP001', specimenType: 'Blood', turnaroundTime: '2-4 hours' },
    { id: 'troponin', name: 'Troponin I', category: 'Cardiac Markers', code: 'TRP001', specimenType: 'Blood', turnaroundTime: '1 hour' },
    { id: 'bnp', name: 'B-type Natriuretic Peptide', category: 'Cardiac Markers', code: 'BNP001', specimenType: 'Blood', turnaroundTime: '2-4 hours' },
    { id: 'culture', name: 'Blood Culture', category: 'Microbiology', code: 'BC001', specimenType: 'Blood', turnaroundTime: '24-48 hours' }
  ];

  // Sample pending orders with proper Date objects
  const [pendingOrders] = useState<PendingOrder[]>([
    {
      id: 'order-001',
      tests: [
        { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Hematology' },
        { id: 'bmp', name: 'Basic Metabolic Panel', category: 'Chemistry' }
      ],
      priority: 'urgent',
      orderedAt: new Date('2024-01-15T10:30:00'),
      status: 'pending',
      clinicalNotes: 'Pre-operative workup'
    }
  ]);

  // Memoized filtered and grouped tests
  const filteredTests = useMemo(() => {
    return labTests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const testsByCategory = useMemo(() => {
    return filteredTests.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push(test);
      return acc;
    }, {} as Record<string, LabTest[]>);
  }, [filteredTests]);

  const categories = useMemo(() => {
    const cats = [...new Set(labTests.map(test => test.category))];
    return cats.sort();
  }, []);

  // Validation function
  const validateOrder = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (selectedTests.length === 0) {
      newErrors.tests = 'At least one test must be selected';
    }

    if (!orderDetails.clinicalNotes.trim()) {
      newErrors.clinicalNotes = 'Clinical indication is required';
    }

    if (orderDetails.clinicalNotes.length > 500) {
      newErrors.clinicalNotes = 'Clinical notes must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedTests.length, orderDetails.clinicalNotes]);

  // Optimized test selection handler
  const handleTestSelection = useCallback((test: LabTest, checked: boolean) => {
    setSelectedTests(prev => {
      if (checked) {
        return prev.some(t => t.id === test.id) ? prev : [...prev, test];
      } else {
        return prev.filter(t => t.id !== test.id);
      }
    });

    // Clear test selection error when tests are selected
    if (checked && errors.tests) {
      setErrors(prev => ({ ...prev, tests: undefined }));
    }
  }, [errors.tests]);

  // Handle order submission with proper async/await
  const handleSendToLab = useCallback(async () => {
    if (!validateOrder()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock API call
      console.log('Sending lab orders for patient:', visitId, {
        tests: selectedTests,
        details: orderDetails
      });
      
      // Success feedback
      setSuccessMessage(`Successfully ordered ${selectedTests.length} test${selectedTests.length > 1 ? 's' : ''} for patient ${visitId}`);
      
      // Reset form
      setSelectedTests([]);
      setOrderDetails({
        priority: 'routine',
        clinicalNotes: '',
        specialInstructions: ''
      });
      setErrors({});
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('Failed to submit lab orders:', error);
      setSubmitError('Failed to submit lab orders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateOrder, visitId, selectedTests, orderDetails]);

  // Quick selection handlers
  const handleSelectCommonPanels = useCallback((panelType: 'basic' | 'cardiac' | 'metabolic') => {
    const panels = {
      basic: ['cbc', 'bmp', 'urinalysis'],
      cardiac: ['troponin', 'bnp', 'lipid'],
      metabolic: ['bmp', 'hba1c', 'lipid']
    };

    const panelTests = labTests.filter(test => panels[panelType].includes(test.id));
    setSelectedTests(panelTests);
  }, []);

  // Handle custom test addition
  const handleAddCustomTest = useCallback(() => {
    if (!customTest.name.trim()) return;

    const newTest: LabTest = {
      id: `custom-${Date.now()}`,
      name: customTest.name.trim(),
      category: customTest.category || 'Custom',
      code: customTest.code,
      specimenType: customTest.specimenType,
      specialInstructions: customTest.specialInstructions
    };

    // Add to selected tests
    setSelectedTests(prev => [...prev, newTest]);

    // Reset custom test form
    setCustomTest({
      name: '',
      code: '',
      category: '',
      specimenType: '',
      specialInstructions: ''
    });
    setShowCustomTest(false);

    // Clear test selection error if it exists
    if (errors.tests) {
      setErrors(prev => ({ ...prev, tests: undefined }));
    }
  }, [customTest, errors.tests]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedTests([]);
  }, []);

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'stat': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {submitError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* New Lab Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Order Lab Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search Tests</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by test name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectCommonPanels('basic')}
            >
              Basic Panel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectCommonPanels('cardiac')}
            >
              Cardiac Panel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectCommonPanels('metabolic')}
            >
              Metabolic Panel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomTest(true)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Custom Test
            </Button>
            {selectedTests.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Custom Test Modal/Form */}
          {showCustomTest && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Custom Test
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomTest(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="custom-name">
                      Test Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="custom-name"
                      placeholder="e.g., Vitamin D 25-OH"
                      value={customTest.name}
                      onChange={(e) => setCustomTest(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-code">Test Code</Label>
                    <Input
                      id="custom-code"
                      placeholder="e.g., VIT25"
                      value={customTest.code}
                      onChange={(e) => setCustomTest(prev => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="custom-category">Category</Label>
                    <Select
                      value={customTest.category}
                      onValueChange={(value) => setCustomTest(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Custom">Custom</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-specimen">Specimen Type</Label>
                    <Select
                      value={customTest.specimenType}
                      onValueChange={(value) => setCustomTest(prev => ({ ...prev, specimenType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specimen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blood">Blood</SelectItem>
                        <SelectItem value="Urine">Urine</SelectItem>
                        <SelectItem value="Serum">Serum</SelectItem>
                        <SelectItem value="Plasma">Plasma</SelectItem>
                        <SelectItem value="Stool">Stool</SelectItem>
                        <SelectItem value="CSF">CSF</SelectItem>
                        <SelectItem value="Tissue">Tissue</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-instructions">Special Instructions</Label>
                  <Textarea
                    id="custom-instructions"
                    placeholder="Any special handling or processing requirements..."
                    value={customTest.specialInstructions}
                    onChange={(e) => setCustomTest(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomTest(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddCustomTest}
                    disabled={!customTest.name.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Test
                  </Button>
                </div>
                <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
                  <strong>Note:</strong> Custom tests will be reviewed by the laboratory team before processing. 
                  Please provide as much detail as possible to ensure proper handling.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Tests</Label>
              {errors.tests && (
                <span className="text-sm text-red-600">{errors.tests}</span>
              )}
            </div>
            
            {Object.keys(testsByCategory).length === 0 && !searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No tests available in the selected category</p>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowCustomTest(true)}
                  className="mt-2"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add a custom test instead
                </Button>
              </div>
            ) : Object.keys(testsByCategory).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No tests found matching "<strong>{searchTerm}</strong>"</p>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setCustomTest(prev => ({ ...prev, name: searchTerm }));
                    setShowCustomTest(true);
                  }}
                  className="mt-2"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add "{searchTerm}" as a custom test
                </Button>
              </div>
            ) : (
              Object.entries(testsByCategory).map(([category, tests]) => (
                <div key={category} className="space-y-2" role="group" aria-labelledby={`${category}-heading`}>
                  <h4 id={`${category}-heading`} className="font-medium text-sm text-gray-700 uppercase tracking-wide">
                    {category} ({tests.length})
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {tests.map((test) => (
                      <div key={test.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                        <Checkbox
                          id={test.id}
                          checked={selectedTests.some(t => t.id === test.id)}
                          onCheckedChange={(checked) => handleTestSelection(test, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={test.id}
                            className="text-sm font-medium cursor-pointer block"
                          >
                            {test.name}
                          </Label>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            {test.code && <div>Code: {test.code}</div>}
                            {test.specimenType && <div>Specimen: {test.specimenType}</div>}
                            {test.turnaroundTime && <div>TAT: {test.turnaroundTime}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Selected Tests ({selectedTests.length})
              </Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                {selectedTests.map((test) => (
                  <Badge key={test.id} variant="secondary" className="flex items-center gap-1">
                    {test.name}
                    <button
                      type="button"
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                      onClick={() => handleTestSelection(test, false)}
                      aria-label={`Remove ${test.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={orderDetails.priority}
                onValueChange={(value: OrderDetails['priority']) => 
                  setOrderDetails({...orderDetails, priority: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinical-notes">
              Clinical Notes / Indication <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="clinical-notes"
              placeholder="Clinical indication for tests..."
              value={orderDetails.clinicalNotes}
              onChange={(e) => {
                setOrderDetails({...orderDetails, clinicalNotes: e.target.value});
                if (errors.clinicalNotes && e.target.value.trim()) {
                  setErrors(prev => ({ ...prev, clinicalNotes: undefined }));
                }
              }}
              className={errors.clinicalNotes ? 'border-red-500' : ''}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{errors.clinicalNotes && <span className="text-red-600">{errors.clinicalNotes}</span>}</span>
              <span>{orderDetails.clinicalNotes.length}/500</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-instructions">Special Instructions</Label>
            <Textarea
              id="special-instructions"
              placeholder="Any special collection or processing instructions..."
              value={orderDetails.specialInstructions}
              onChange={(e) => setOrderDetails({...orderDetails, specialInstructions: e.target.value})}
              maxLength={300}
            />
            <div className="text-right text-xs text-gray-500">
              {orderDetails.specialInstructions.length}/300
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSendToLab}
              disabled={selectedTests.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Sending...' : 'Send to Laboratory'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Lab Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No pending lab orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Order #{order.id}</span>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Ordered: {formatDate(order.orderedAt)}
                  </div>
                  {order.clinicalNotes && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Clinical Notes:</span> {order.clinicalNotes}
                    </div>
                  )}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">
                      Tests ({order.tests.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {order.tests.map((test, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {test.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabOrders;