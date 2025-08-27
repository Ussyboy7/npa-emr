import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Syringe, Send, Plus, Clock } from 'lucide-react';

interface NursingOrdersProps {
  visitId: string;
}

interface NursingOrder {
  id: string;
  type: string;
  description: string;
  priority: string;
  frequency?: string;
  duration?: string;
  specialInstructions: string;
}

const NursingOrders: React.FC<NursingOrdersProps> = ({ visitId }) => {
  const [orders, setOrders] = useState<NursingOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState({
    type: '',
    description: '',
    priority: 'routine',
    frequency: '',
    duration: '',
    specialInstructions: ''
  });

  const orderTypes = [
    'Injection/IV Medication',
    'Wound Care/Dressing Change',
    'Vital Signs Monitoring',
    'Blood Collection',
    'IV Line Insertion',
    'Catheter Care',
    'Patient Positioning',
    'Physiotherapy',
    'Dietary Instructions',
    'Patient Education',
    'Observation',
    'Other'
  ];

  const priorityOptions = [
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'stat', label: 'STAT (Immediate)' }
  ];

  const frequencyOptions = [
    'Once',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Twice daily',
    'Three times daily',
    'As needed (PRN)',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  const [commonInjections] = useState([
    'Normal Saline IV',
    'Dextrose 5% IV',
    'Insulin (subcutaneous)',
    'Heparin (subcutaneous)',
    'Antibiotics IV',
    'Pain medication IM',
    'Vitamin B12 IM',
    'Tetanus shot IM'
  ]);

  const handleAddOrder = () => {
    if (!currentOrder.type || !currentOrder.description) {
      return;
    }

    const newOrder: NursingOrder = {
      id: Date.now().toString(),
      ...currentOrder
    };

    setOrders([...orders, newOrder]);
    setCurrentOrder({
      type: '',
      description: '',
      priority: 'routine',
      frequency: '',
      duration: '',
      specialInstructions: ''
    });
  };

  const handleRemoveOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const handleSendToNursing = () => {
    if (orders.length === 0) return;

    console.log('Sending nursing orders for patient:', visitId, orders);

    // Reset form
    setOrders([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [activeOrders] = useState([
    {
      id: 'nursing-1',
      type: 'Injection/IV Medication',
      description: 'Administer IV antibiotics',
      priority: 'urgent',
      orderedAt: '2024-01-15 10:30 AM',
      status: 'pending',
      assignedNurse: 'Not assigned'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* New Nursing Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Create Nursing Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add Nursing Order</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order-type">Order Type</Label>
                <Select
                  value={currentOrder.type}
                  onValueChange={(value) => setCurrentOrder({...currentOrder, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={currentOrder.priority}
                  onValueChange={(value) => setCurrentOrder({...currentOrder, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description/Instructions</Label>
              <Textarea
                id="description"
                placeholder="Detailed instructions for the nursing staff..."
                value={currentOrder.description}
                onChange={(e) => setCurrentOrder({...currentOrder, description: e.target.value})}
              />
              {currentOrder.type === 'Injection/IV Medication' && (
                <div className="mt-2">
                  <Label className="text-sm text-gray-600">Common injections:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {commonInjections.map((injection) => (
                      <Badge
                        key={injection}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setCurrentOrder({...currentOrder, description: injection})}
                      >
                        {injection}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency (if applicable)</Label>
                <Select
                  value={currentOrder.frequency}
                  onValueChange={(value) => setCurrentOrder({...currentOrder, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (if applicable)</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 days, Until discharge"
                  value={currentOrder.duration}
                  onChange={(e) => setCurrentOrder({...currentOrder, duration: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <Textarea
                id="special-instructions"
                placeholder="Any special precautions, allergies to consider, etc."
                value={currentOrder.specialInstructions}
                onChange={(e) => setCurrentOrder({...currentOrder, specialInstructions: e.target.value})}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddOrder}>
                <Plus className="mr-2 h-4 w-4" />
                Add Order
              </Button>
            </div>
          </div>

          {/* Added Orders */}
          {orders.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Nursing Orders ({orders.length})</h4>
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{order.type}</span>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-700 mb-1">{order.description}</div>
                        {(order.frequency || order.duration) && (
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            {order.frequency && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {order.frequency}
                              </span>
                            )}
                            {order.duration && <span>Duration: {order.duration}</span>}
                          </div>
                        )}
                        {order.specialInstructions && (
                          <div className="text-sm text-blue-600 mt-1">
                            Special: {order.specialInstructions}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOrder(order.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleSendToNursing}
              disabled={orders.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to Nursing Station
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Nursing Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Order #{order.id}</span>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Ordered: {order.orderedAt}
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{order.type}</div>
                  <div className="text-sm text-gray-700">{order.description}</div>
                  <div className="text-sm text-gray-600">
                    Assigned Nurse: {order.assignedNurse}
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

export default NursingOrders;