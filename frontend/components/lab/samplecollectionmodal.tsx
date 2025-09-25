"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { LabOrder, SampleCollectionForm } from "@/types/lab";
import { toast } from 'react-toastify'; // Assuming toast library

interface SampleCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LabOrder | null;
  selectedTests: string[];
  onComplete: (orderId: string, formData: SampleCollectionForm) => void;
}

const SampleCollectionModal = ({ isOpen, onClose, order, selectedTests, onComplete }: SampleCollectionModalProps) => {
  const [form, setForm] = useState<SampleCollectionForm>({
    sampleType: '',
    collectionMethod: '',
    containerType: '',
    volume: '',
    collectionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    collectionDate: new Date().toISOString().split('T')[0],
    fastingStatus: '',
    specialInstructions: '',
    collectedBy: '',
    notes: ''
  });

  const handleInputChange = (field: keyof SampleCollectionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      form.collectionDate &&
      form.collectionTime &&
      form.collectionMethod &&
      form.fastingStatus &&
      form.collectedBy
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !isFormValid()) {
      toast.error('Please fill all required fields.');
      return;
    }
    onComplete(order.id, form);
    toast.success(`Sample collection recorded for ${order.patientName}`);
    onClose();
  };

  const handleClose = () => {
    setForm({
      sampleType: '',
      collectionMethod: '',
      containerType: '',
      volume: '',
      collectionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      collectionDate: new Date().toISOString().split('T')[0],
      fastingStatus: '',
      specialInstructions: '',
      collectedBy: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen || !order) return null;

  const testsToCollect = order.tests.filter(test => selectedTests.includes(test.id));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Sample Collection for {order.patientName}</DialogTitle>
          <p className="text-gray-600">Order: {order.orderId}</p>
          <p className="text-sm text-gray-500">
            Collecting {testsToCollect.length} test(s): {testsToCollect.map(t => t.name).join(', ')}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Tests to Collect</h3>
            <div className="space-y-2">
              {testsToCollect.map(test => (
                <div key={test.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{test.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({test.code})</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {test.specimenType} • {test.turnaroundTime}
                    {test.specialInstructions && <span> • {test.specialInstructions}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Collection Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={form.collectionDate}
                onChange={(e) => handleInputChange('collectionDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Collection Time <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={form.collectionTime}
                onChange={(e) => handleInputChange('collectionTime', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Collection Method <span className="text-red-500">*</span></Label>
              <Select value={form.collectionMethod} onValueChange={(v) => handleInputChange('collectionMethod', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venipuncture">Venipuncture</SelectItem>
                  <SelectItem value="Finger prick">Finger prick</SelectItem>
                  <SelectItem value="Heel prick">Heel prick</SelectItem>
                  <SelectItem value="Mid-stream urine">Mid-stream urine</SelectItem>
                  <SelectItem value="Clean catch urine">Clean catch urine</SelectItem>
                  <SelectItem value="Catheter sample">Catheter sample</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fasting Status <span className="text-red-500">*</span></Label>
              <Select value={form.fastingStatus} onValueChange={(v) => handleInputChange('fastingStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fasting">Fasting (8+ hours)</SelectItem>
                  <SelectItem value="non-fasting">Non-fasting</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="post-meal">Post-meal (2 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Collected By <span className="text-red-500">*</span></Label>
              <Input
                value={form.collectedBy}
                onChange={(e) => handleInputChange('collectedBy', e.target.value)}
                placeholder="Technician name"
                required
              />
            </div>
            <div>
              <Label>Sample Type</Label>
              <Select value={form.sampleType} onValueChange={(v) => handleInputChange('sampleType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blood">Blood</SelectItem>
                  <SelectItem value="Urine">Urine</SelectItem>
                  <SelectItem value="Saliva">Saliva</SelectItem>
                  <SelectItem value="Tissue">Tissue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Container Type</Label>
              <Select value={form.containerType} onValueChange={(v) => handleInputChange('containerType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select container..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDTA tube (Purple top)">EDTA tube (Purple top)</SelectItem>
                  <SelectItem value="Serum tube (Red top)">Serum tube (Red top)</SelectItem>
                  <SelectItem value="Urine container">Urine container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Volume</Label>
              <Input
                value={form.volume}
                onChange={(e) => handleInputChange('volume', e.target.value)}
                placeholder="e.g., 5ml"
              />
            </div>
          </div>

          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={form.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              rows={3}
              placeholder="Any special handling requirements..."
            />
          </div>

          <div>
            <Label>Collection Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              placeholder="Patient cooperation, collection difficulties..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Sample Collection Guidelines</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Verify patient identity using two identifiers</li>
                  <li>• Follow proper aseptic technique for all collections</li>
                  <li>• Use appropriate collection containers and preservatives</li>
                  <li>• Label samples immediately after collection</li>
                  <li>• Document collection time and any special circumstances</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              Record Collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { SampleCollectionModal };