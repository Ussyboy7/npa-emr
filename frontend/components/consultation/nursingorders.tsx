import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Syringe, Send, Plus, X, AlertTriangle, Clock, Search } from 'lucide-react';

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
  instructions: string;
}

interface NursingInteraction {
  order1: string;
  order2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
}

interface ActiveNursingOrder {
  id: string;
  type: string;
  description: string;
  priority: string;
  orderedAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  assignedNurse: string;
  notes: string;
}

// Validation schema (Added: Similar to Prescriptions, with zod validation for orders)
const nursingOrderSchema = z.object({
  type: z.string().min(1, "Order type is required"),
  description: z.string().min(2, "Description is required"),
  priority: z.string().min(1, "Priority is required"),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

const nursingSchema = z.object({
  orders: z.array(nursingOrderSchema).min(1, "At least one order is required"),
  nursingNotes: z.string().optional(),
}).refine(
  (data) => {
    // Added: Example check for conflicting orders (similar to drug interactions)
    const orders = data.orders;
    for (let i = 0; i < orders.length; i++) {
      for (let j = i + 1; j < orders.length; j++) {
        const order1 = orders[i].type.toLowerCase();
        const order2 = orders[j].type.toLowerCase();
        
        // Example conflicting combinations (e.g., multiple conflicting injections)
        if (order1.includes('injection') && order2.includes('iv medication')) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: "Potential conflicting nursing orders detected. Please review.",
    path: ["orders"],
  }
);

type NursingForm = z.infer<typeof nursingSchema>;

// Common order types with suggestions (Added: Similar to commonMedications)
const commonOrderTypes = [
  { name: 'Injection', category: 'Administration', suggestions: ['Normal Saline IV', 'Insulin (subcutaneous)', 'Heparin (subcutaneous)'] },
  { name: 'Dressing', category: 'Wound Care', suggestions: ['Change wound dressing', 'Apply antiseptic'] },
  { name: 'Vital Signs Monitoring', category: 'Monitoring', suggestions: ['Check BP every 4 hours', 'Monitor temperature'] },
  { name: 'Ward Transfer', category: 'Logistics', suggestions: ['Transfer to ICU', 'Prepare for discharge'] },
  { name: 'Other', category: 'Miscellaneous', suggestions: ['Patient education', 'Diet monitoring'] },
];

const priorityOptions = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT (Immediate)' }
];

const frequencyOptions = [
  { value: 'once', label: 'Once', abbreviation: 'Once' },
  { value: 'every_4_hours', label: 'Every 4 hours', abbreviation: 'Q4H' },
  { value: 'every_6_hours', label: 'Every 6 hours', abbreviation: 'Q6H' },
  { value: 'every_8_hours', label: 'Every 8 hours', abbreviation: 'Q8H' },
  { value: 'every_12_hours', label: 'Every 12 hours', abbreviation: 'Q12H' },
  { value: 'twice_daily', label: 'Twice daily', abbreviation: 'BID' },
  { value: 'three_times_daily', label: 'Three times daily', abbreviation: 'TID' },
  { value: 'as_needed', label: 'As needed', abbreviation: 'PRN' },
  { value: 'before_meals', label: 'Before meals', abbreviation: 'AC' },
  { value: 'after_meals', label: 'After meals', abbreviation: 'PC' },
  { value: 'at_bedtime', label: 'At bedtime', abbreviation: 'HS' },
];

const NursingOrders: React.FC<NursingOrdersProps> = ({ visitId }) => {
  const [isSending, setIsSending] = useState(false);
  const [nursingInteractions, setNursingInteractions] = useState<NursingInteraction[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  // Added: State for editing existing order
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<NursingForm>({
    resolver: zodResolver(nursingSchema),
    defaultValues: {
      orders: [{
        type: '',
        description: '',
        priority: 'routine',
        frequency: '',
        duration: '',
        instructions: ''
      }],
      nursingNotes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orders"
  });

  const formData = watch();

  // Added: Check for interactions similar to Prescriptions
  React.useEffect(() => {
    checkNursingInteractions(formData.orders);
  }, [formData.orders]);

  const checkNursingInteractions = (orders: any[]) => {
    const interactions: NursingInteraction[] = [];
    
    for (let i = 0; i < orders.length; i++) {
      for (let j = i + 1; j < orders.length; j++) {
        const order1 = orders[i]?.type?.toLowerCase() || '';
        const order2 = orders[j]?.type?.toLowerCase() || '';
        
        // Example conflicting combinations
        if (order1.includes('injection') && order2.includes('iv medication')) {
          interactions.push({
            order1: orders[i].type,
            order2: orders[j].type,
            severity: 'major',
            description: 'Potential conflict between injection and IV administration'
          });
        }
        
        // Added: More examples for realism
        if (order1.includes('vital signs monitoring') && order2.includes('ward transfer')) {
          interactions.push({
            order1: orders[i].type,
            order2: orders[j].type,
            severity: 'moderate',
            description: 'Ensure monitoring continues during transfer'
          });
        }
      }
    }
    
    setNursingInteractions(interactions);
  };

  const getInteractionColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const onSubmit = async (data: NursingForm) => {
    setIsSending(true);
    try {
      // Added: Handle editing existing order
      if (editingId) {
        setActiveOrders(prev => prev.map(o => 
          o.id === editingId 
            ? { 
                ...o, 
                type: data.orders[0].type, // Assuming single order edit; adjust if multi
                description: data.orders[0].description,
                priority: data.orders[0].priority,
                frequency: data.orders[0].frequency,
                duration: data.orders[0].duration,
                notes: data.nursingNotes || '',
                orderedAt: new Date().toLocaleString(),
                status: 'pending' // Reset to pending after resend
              } 
            : o
        ));
        setEditingId(null);
      } else {
        const newOrders: ActiveNursingOrder[] = data.orders.map((order, index) => ({
          id: `nursing-${Date.now() + index}`,
          type: order.type,
          description: order.description,
          priority: order.priority,
          orderedAt: new Date().toLocaleString(),
          status: 'pending',
          assignedNurse: 'Not assigned',
          notes: data.nursingNotes || ''
        }));

        setActiveOrders(prev => [...newOrders, ...prev]);
      }

      reset();
      
      console.log('Nursing orders sent successfully');
    } catch (error) {
      console.error('Failed to send nursing orders:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Added: Function to handle canceling an order
  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this nursing order?')) {
      setActiveOrders(prev => prev.map(o => 
        o.id === id ? { ...o, status: 'cancelled' } : o
      ));
    }
  };

  // Added: Function to handle modifying an order
  const handleModify = (order: ActiveNursingOrder) => {
    setEditingId(order.id);
    reset({
      orders: [{
        type: order.type,
        description: order.description,
        priority: order.priority,
        frequency: '',
        duration: '',
        instructions: ''
      }],
      nursingNotes: order.notes
    });
  };

  const getSuggestedOrders = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return commonOrderTypes.filter(order => 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Modified: Mock data updated to match new interface
  const [activeOrders, setActiveOrders] = useState<ActiveNursingOrder[]>([
    {
      id: 'nursing-1',
      type: 'Injection',
      description: 'Administer IV antibiotics',
      priority: 'urgent',
      orderedAt: '2024-01-15 10:30 AM',
      status: 'pending',
      assignedNurse: 'Not assigned',
      notes: 'For respiratory tract infection'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Nursing Interaction Warnings (Added: Similar to drug interactions) */}
      {nursingInteractions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Nursing Order Conflict Warning:</strong>
            <ul className="mt-2 space-y-1">
              {nursingInteractions.map((interaction, index) => (
                <li key={index} className={`p-2 rounded border ${getInteractionColor(interaction.severity)}`}>
                  <strong>{interaction.order1} + {interaction.order2}</strong> 
                  <span className="ml-2 capitalize">({interaction.severity})</span>
                  <div className="text-sm mt-1">{interaction.description}</div>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* New Nursing Order */}
      <Card>
        <CardHeader>
          {/* Modified: Title changes based on editing mode */}
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            {editingId ? 'Edit Nursing Order' : 'Create Nursing Order'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Orders (Added: Field array for multiple orders, similar to medications) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Nursing Orders</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    type: '',
                    description: '',
                    priority: 'routine',
                    frequency: '',
                    duration: '',
                    instructions: ''
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Order {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Order Type */}
                    <div className="space-y-2">
                      <Label>Order Type *</Label>
                      <Controller
                        name={`orders.${index}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={errors.orders?.[index]?.type ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select order type" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonOrderTypes.map((type) => (
                                <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.orders?.[index]?.type && (
                        <p className="text-red-500 text-sm">{errors.orders[index]?.type?.message}</p>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <Controller
                        name={`orders.${index}.priority`}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={errors.orders?.[index]?.priority ? 'border-red-500' : ''}>
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
                        )}
                      />
                      {errors.orders?.[index]?.priority && (
                        <p className="text-red-500 text-sm">{errors.orders[index]?.priority?.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <div className="relative">
                      <Controller
                        name={`orders.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <>
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                placeholder="Search order description..."
                                className={`pl-8 ${errors.orders?.[index]?.description ? 'border-red-500' : ''}`}
                                onFocus={() => setShowSuggestions(index)}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setOrderSearch(e.target.value);
                                }}
                              />
                            </div>
                            
                            {showSuggestions === index && orderSearch && (
                              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                {getSuggestedOrders(orderSearch).map((order, orderIndex) => (
                                  <div
                                    key={orderIndex}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                    onClick={() => {
                                      field.onChange(order.name); // Set description to suggestion name
                                      setShowSuggestions(null);
                                      setOrderSearch('');
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium">{order.name}</div>
                                        <div className="text-sm text-gray-600">{order.category}</div>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {order.category}
                                      </Badge>
                                    </div>
                                    {order.suggestions.length > 0 && (
                                      <div className="text-xs text-blue-600 mt-1">
                                        Suggestions: {order.suggestions.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      />
                    </div>
                    {errors.orders?.[index]?.description && (
                      <p className="text-red-500 text-sm">{errors.orders[index]?.description?.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Frequency */}
                    <div className="space-y-2">
                      <Label>Frequency (if applicable)</Label>
                      <Controller
                        name={`orders.${index}.frequency`}
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((freq) => (
                                <SelectItem key={freq.value} value={freq.value}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{freq.label}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {freq.abbreviation}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label>Duration (if applicable)</Label>
                      <Controller
                        name={`orders.${index}.duration`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g., 3 days, Until discharge"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label>Special Instructions</Label>
                    <Controller
                      name={`orders.${index}.instructions`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Any special precautions, allergies to consider, etc."
                        />
                      )}
                    />
                  </div>

                  {/* Order Summary (Added: Similar to Prescription Summary) */}
                  {formData.orders[index]?.type && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-sm">
                        <strong>Order Summary:</strong>
                        <div className="mt-1">
                          {formData.orders[index].type}: {formData.orders[index].description}
                          {formData.orders[index].frequency && (
                            <span> - {frequencyOptions.find(f => f.value === formData.orders[index].frequency)?.label}</span>
                          )}
                          {formData.orders[index].duration && (
                            <span> for {formData.orders[index].duration}</span>
                          )}
                        </div>
                        {formData.orders[index].instructions && (
                          <div className="mt-1 text-blue-700">
                            <AlertTriangle className="inline h-3 w-3 mr-1" />
                            {formData.orders[index].instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {errors.orders && typeof errors.orders === 'object' && 'message' in errors.orders && (
                <p className="text-red-500 text-sm">{errors.orders.message}</p>
              )}
            </div>

            {/* Nursing Notes (Added: Similar to Prescription Notes) */}
            <div className="space-y-2">
              <Label>Nursing Notes</Label>
              <Controller
                name="nursingNotes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Additional notes for nursing staff..."
                    className="min-h-16"
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={isSending || !isDirty || fields.length === 0}
                className="min-w-40"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {editingId ? 'Resend to Nursing' : 'Send to Nursing'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Orders (Modified: Similar to Existing Prescriptions, with cancel/modify) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Nursing Orders ({activeOrders.length})</CardTitle>
            <Badge variant="outline" className="text-xs">
              Updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Syringe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No nursing orders created yet</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {order.orderedAt}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium">{order.type}</span>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Description:</span>
                      <p className="text-sm text-gray-700 mt-1">{order.description}</p>
                    </div>
                    
                    {order.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Assigned Nurse:</span> {order.assignedNurse}
                    </div>
                  </div>
                  
                  {/* Action buttons (Added: Similar to Prescriptions) */}
                  <div className="flex gap-2 pt-2 border-t">
                    {order.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(order.id)}>
                          Cancel Order
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleModify(order)}>
                          Modify
                        </Button>
                      </>
                    )}
                    {order.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        View Completion Details
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NursingOrders;