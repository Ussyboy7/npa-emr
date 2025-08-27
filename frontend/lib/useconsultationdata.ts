"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast';

export interface PatientVisit {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint: string;
  status: string;
  assigned_doctor: string;
  room_id: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalNote {
  id: string;
  visit_id: string;
  presenting_complaints: string;
  history_of_complaints: string;
  past_medical_history: string;
  family_history: string;
  social_history: string;
  systems_review: string;
  physical_examination: string;
  clinical_impression: string;
  plan_of_care: string;
  allergies: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PatientVitals {
  id: string;
  visit_id: string;
  temperature: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight: number;
  height: number;
  blood_glucose: number;
  pain_scale: number;
  recorded_by: string;
  recorded_at: string;
}

export interface LabOrder {
  id: string;
  visit_id: string;
  test_name: string;
  test_type: string;
  urgency: string;
  specimen_type: string;
  instructions: string;
  status: string;
  ordered_by: string;
  ordered_at: string;
}

export interface Prescription {
  id: string;
  visit_id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  status: string;
  prescribed_by: string;
  prescribed_at: string;
}

// Mock data stores
let mockVisits: PatientVisit[] = [];
let mockNotes: MedicalNote[] = [];
let mockVitals: PatientVitals[] = [];
let mockLabOrders: LabOrder[] = [];
let mockPrescriptions: Prescription[] = [];

// Utility to generate unique IDs
const generateId = () => crypto.randomUUID();

export function usePatientVisits() {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = () => {
    try {
      setLoading(true);
      setVisits(mockVisits);
    } catch (error) {
      console.error('Error loading visits:', error);
      toast({
        title: "Error",
        description: "Failed to load patient visits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVisit = (visitData: Partial<PatientVisit>) => {
    try {
      const newVisit = {
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...visitData
      } as PatientVisit;
      mockVisits = [newVisit, ...mockVisits];
      setVisits(mockVisits);
      toast({
        title: "Success",
        description: "Patient visit created successfully",
      });
      return newVisit;
    } catch (error) {
      console.error('Error creating visit:', error);
      toast({
        title: "Error",
        description: "Failed to create patient visit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVisit = (id: string, updates: Partial<PatientVisit>) => {
    try {
      const updatedVisit = mockVisits.map(visit => 
        visit.id === id ? { ...visit, ...updates, updated_at: new Date().toISOString() } : visit
      );
      mockVisits = updatedVisit;
      setVisits(updatedVisit);
      const updated = updatedVisit.find(v => v.id === id);
      toast({
        title: "Success",
        description: "Patient visit updated successfully",
      });
      return updated;
    } catch (error) {
      console.error('Error updating visit:', error);
      toast({
        title: "Error",
        description: "Failed to update patient visit",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    visits,
    loading,
    loadVisits,
    createVisit,
    updateVisit
  };
}

export function useMedicalNotes(visitId: string) {
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      loadNotes();
    }
  }, [visitId]);

  const loadNotes = () => {
    try {
      setLoading(true);
      const filteredNotes = mockNotes.filter(note => note.visit_id === visitId);
      setNotes(filteredNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load medical notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = (noteData: Partial<MedicalNote>) => {
    try {
      const newNote = {
        id: generateId(),
        visit_id: visitId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...noteData
      } as MedicalNote;
      mockNotes = [newNote, ...mockNotes];
      setNotes(mockNotes.filter(note => note.visit_id === visitId));
      toast({
        title: "Success",
        description: "Medical notes saved successfully",
      });
      return newNote;
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save medical notes",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    notes,
    loading,
    loadNotes,
    saveNotes
  };
}

export function usePatientVitals(visitId: string) {
  const [vitals, setVitals] = useState<PatientVitals[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      loadVitals();
    }
  }, [visitId]);

  const loadVitals = () => {
    try {
      setLoading(true);
      const filteredVitals = mockVitals.filter(vital => vital.visit_id === visitId);
      setVitals(filteredVitals);
    } catch (error) {
      console.error('Error loading vitals:', error);
      toast({
        title: "Error",
        description: "Failed to load patient vitals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVitals = (vitalsData: Partial<PatientVitals>) => {
    try {
      const newVitals = {
        id: generateId(),
        visit_id: visitId,
        recorded_at: new Date().toISOString(),
        ...vitalsData
      } as PatientVitals;
      mockVitals = [newVitals, ...mockVitals];
      setVitals(mockVitals.filter(vital => vital.visit_id === visitId));
      toast({
        title: "Success",
        description: "Patient vitals recorded successfully",
      });
      return newVitals;
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast({
        title: "Error",
        description: "Failed to record patient vitals",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    vitals,
    loading,
    loadVitals,
    saveVitals
  };
}

export function useLabOrders(visitId: string) {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      loadOrders();
    }
  }, [visitId]);

  const loadOrders = () => {
    try {
      setLoading(true);
      const filteredOrders = mockLabOrders.filter(order => order.visit_id === visitId);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading lab orders:', error);
      toast({
        title: "Error",
        description: "Failed to load lab orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = (orderData: Partial<LabOrder>) => {
    try {
      const newOrder = {
        id: generateId(),
        visit_id: visitId,
        ordered_at: new Date().toISOString(),
        ...orderData
      } as LabOrder;
      mockLabOrders = [newOrder, ...mockLabOrders];
      setOrders(mockLabOrders.filter(order => order.visit_id === visitId));
      toast({
        title: "Success",
        description: "Lab order created successfully",
      });
      return newOrder;
    } catch (error) {
      console.error('Error creating lab order:', error);
      toast({
        title: "Error",
        description: "Failed to create lab order",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    orders,
    loading,
    loadOrders,
    createOrder
  };
}

export function usePrescriptions(visitId: string) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      loadPrescriptions();
    }
  }, [visitId]);

  const loadPrescriptions = () => {
    try {
      setLoading(true);
      const filteredPrescriptions = mockPrescriptions.filter(pres => pres.visit_id === visitId);
      setPrescriptions(filteredPrescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = (prescriptionData: Partial<Prescription>) => {
    try {
      const newPrescription = {
        id: generateId(),
        visit_id: visitId,
        prescribed_at: new Date().toISOString(),
        ...prescriptionData
      } as Prescription;
      mockPrescriptions = [newPrescription, ...mockPrescriptions];
      setPrescriptions(mockPrescriptions.filter(pres => pres.visit_id === visitId));
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      return newPrescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    prescriptions,
    loading,
    loadPrescriptions,
    createPrescription
  };
}