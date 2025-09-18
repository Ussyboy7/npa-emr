"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LabOrder, SampleCollectionForm } from "@/types/lab";

interface SampleCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: LabOrder;
  selectedTests: string[];
  onComplete: (orderId: string) => void;
}

const SampleCollectionModal = ({ isOpen, onClose, order, selectedTests, onComplete }: SampleCollectionModalProps) => {
  const [form, setForm] = useState<SampleCollectionForm>({
    sampleType: '',
    collectionMethod: '',
    containerType: '',
    volume: '',
    collectionTime: '',
    collectionDate: '',
    fastingStatus: '',
    specialInstructions: '',
    collectedBy: '',
    notes: ''
  });

  const handleInputChange = (field: keyof SampleCollectionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (order) {
      // API call to record collection
      onComplete(order.id);
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sample Collection for {order.patientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields from original modal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Sample Type</Label>
              <Select value={form.sampleType} onValueChange={(v) => handleInputChange('sampleType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Options from original */}
                </SelectContent>
              </Select>
            </div>
            {/* ... other fields */}
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Record Collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { SampleCollectionModal };