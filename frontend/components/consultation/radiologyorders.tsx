// components/consultation/radiologyorders.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScanLine, Send, Plus, X } from 'lucide-react';

interface RadiologyOrder {
  id: string;
  procedure: string;
  bodyPart: string;
  urgency: 'routine' | 'urgent' | 'stat';
  clinicalInfo: string;
  notes: string;
}

interface RadiologyOrdersProps {
  visitId: string;
}

const commonProcedures = [
  'X-ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'Mammogram',
  'Fluoroscopy',
  'Nuclear Medicine'
];

const bodyParts = [
  'Chest',
  'Abdomen',
  'Head',
  'Neck',
  'Spine',
  'Extremity',
  'Pelvis',
  'Other'
];

const RadiologyOrders: React.FC<RadiologyOrdersProps> = ({ visitId }) => {
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addNewOrder = () => {
    setOrders([...orders, {
      id: `order-${Date.now()}`,
      procedure: '',
      bodyPart: '',
      urgency: 'routine',
      clinicalInfo: '',
      notes: ''
    }]);
  };
  
  const removeOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };
  
  const updateOrder = (id: string, field: keyof RadiologyOrder, value: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    ));
  };
  
  const submitOrders = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Radiology orders submitted:', orders);
      setOrders([]);
    } catch (error) {
      console.error('Failed to submit radiology orders:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Radiology Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ScanLine className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No radiology orders added yet</p>
              <Button onClick={addNewOrder} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add First Order
              </Button>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Radiology Order</h4>
                    {orders.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrder(order.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Procedure</Label>
                      <Select
                        value={order.procedure}
                        onValueChange={(value) => updateOrder(order.id, 'procedure', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select procedure" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonProcedures.map((procedure) => (
                            <SelectItem key={procedure} value={procedure}>
                              {procedure}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Body Part</Label>
                      <Select
                        value={order.bodyPart}
                        onValueChange={(value) => updateOrder(order.id, 'bodyPart', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select body part" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyParts.map((part) => (
                            <SelectItem key={part} value={part}>
                              {part}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select
                      value={order.urgency}
                      onValueChange={(value) => updateOrder(order.id, 'urgency', value as any)}
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
                  
                  <div className="space-y-2">
                    <Label>Clinical Information</Label>
                    <Textarea
                      placeholder="Reason for examination, relevant history..."
                      value={order.clinicalInfo}
                      onChange={(e) => updateOrder(order.id, 'clinicalInfo', e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any special instructions..."
                      value={order.notes}
                      onChange={(e) => updateOrder(order.id, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={addNewOrder}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Order
                </Button>
                <Button onClick={submitOrders} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to Radiology
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RadiologyOrders;