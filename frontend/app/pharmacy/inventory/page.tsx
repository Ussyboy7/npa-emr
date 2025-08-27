// pharmacy/inventory/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Minus, AlertTriangle, Package, RefreshCw, TrendingUp, TrendingDown, Eye, Edit, Download, Filter, Calendar, CheckCircle, XCircle, Clock, ShoppingCart, Pill, Heart, Activity, Droplet, Shield, Layers, Archive, FileDown, FileText, BarChart3, User } from "lucide-react";

type MedicationCategory = "Antibiotics" | "Analgesics" | "Cardiovascular" | "Diabetes" | "Respiratory" | "Vitamins" | "Gastrointestinal" | "Dermatology" | "Neurology" | "Other";
type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Expired" | "Near Expiry";
type SupplierStatus = "Active" | "Inactive" | "Pending";
type BatchStatus = "Active" | "Near Expiry" | "Expired" | "Recalled";

interface MedicationBatch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  totalTablets: number;
  remainingTablets: number;
  dateReceived: string;
  packSize: number;
  packsReceived: number;
  openedPacks: number;
  sealedPacks: number;
  supplier: string;
  status: BatchStatus;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: MedicationCategory;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  supplier: string;
  supplierStatus: SupplierStatus;
  
  // Stock tracking (now in tablets)
  currentStock: number;  // Total tablets across all batches
  minimumStock: number;  // In tablets
  maximumStock: number;  // In tablets
  
  // Batch management
  batches: MedicationBatch[];
  packSize: number;  // Tablets per pack for purchasing
  
  // Other properties
  lastRestocked: string;
  lastDispensed?: string;
  monthlyUsage: number;
  status: StockStatus;
  location: string;
  barcode?: string;
  prescriptionRequired: boolean;
  isGeneric: boolean;
  notes?: string;
}

interface StockTransaction {
  id: string;
  medicationId: string;
  medicationName: string;
  type: "Dispensed" | "Restocked" | "Adjusted" | "Expired" | "Returned";
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  time: string;
  performedBy: string;
  patientId?: string;
  prescriptionId?: string;
  reason?: string;
  batchNumber?: string;
  batchesAffected?: Array<{batchId: string, quantity: number}>;
}

interface CategorySummary {
  category: MedicationCategory;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  nearExpiryItems: number;
}

// Enhanced mock data with batch tracking
const mockInventory: Medication[] = [
  // Antibiotics
  {
    id: "MED001",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotics",
    strength: "500mg",
    dosageForm: "Capsule",
    manufacturer: "PharmaCorp",
    supplier: "MediSupply Ltd",
    supplierStatus: "Active",
    packSize: 8,
    currentStock: 372,
    minimumStock: 240,
    maximumStock: 800,
    batches: [
      {
        id: "BATCH001",
        batchNumber: "AMX2024001",
        expiryDate: "2026-08-16",
        totalTablets: 200,
        remainingTablets: 172,
        dateReceived: "2024-06-15",
        packSize: 8,
        packsReceived: 25,
        openedPacks: 4,
        sealedPacks: 21,
        supplier: "MediSupply Ltd",
        status: "Near Expiry",
        notes: "Use first - expires soonest"
      },
      {
        id: "BATCH002",
        batchNumber: "AMX2024002",
        expiryDate: "2027-03-20",
        totalTablets: 400,
        remainingTablets: 200,
        dateReceived: "2024-08-20",
        packSize: 8,
        packsReceived: 50,
        openedPacks: 0,
        sealedPacks: 25,
        supplier: "MediSupply Ltd",
        status: "Active"
      }
    ],
    lastRestocked: "2024-08-20",
    lastDispensed: "2025-08-15",
    monthlyUsage: 45,
    status: "In Stock",
    location: "A1-B2",
    barcode: "123456789001",
    prescriptionRequired: true,
    isGeneric: true,
    notes: "Popular antibiotic for bacterial infections"
  },
  {
    id: "MED004",
    name: "Paracetamol",
    genericName: "Paracetamol",
    category: "Analgesics",
    strength: "500mg",
    dosageForm: "Tablet",
    manufacturer: "PainRelief Co",
    supplier: "GeneralMeds",
    supplierStatus: "Active",
    packSize: 10,
    currentStock: 850,
    minimumStock: 500,
    maximumStock: 2000,
    batches: [
      {
        id: "BATCH003",
        batchNumber: "PAR2024001",
        expiryDate: "2026-03-15",
        totalTablets: 500,
        remainingTablets: 350,
        dateReceived: "2024-05-10",
        packSize: 10,
        packsReceived: 50,
        openedPacks: 15,
        sealedPacks: 35,
        supplier: "GeneralMeds",
        status: "Active"
      },
      {
        id: "BATCH004",
        batchNumber: "PAR2024002",
        expiryDate: "2027-01-20",
        totalTablets: 1000,
        remainingTablets: 500,
        dateReceived: "2024-08-10",
        packSize: 10,
        packsReceived: 100,
        openedPacks: 0,
        sealedPacks: 50,
        supplier: "GeneralMeds",
        status: "Active"
      }
    ],
    lastRestocked: "2024-08-10",
    lastDispensed: "2025-08-15",
    monthlyUsage: 150,
    status: "In Stock",
    location: "B2-C1",
    barcode: "123456789004",
    prescriptionRequired: false,
    isGeneric: true,
    notes: "Over-the-counter pain reliever"
  },
  {
    id: "MED005",
    name: "Lisinopril",
    genericName: "Lisinopril",
    category: "Cardiovascular",
    strength: "10mg",
    dosageForm: "Tablet",
    manufacturer: "CardioPharm",
    supplier: "HeartMeds Inc",
    supplierStatus: "Active",
    packSize: 30,
    currentStock: 120,
    minimumStock: 200,
    maximumStock: 600,
    batches: [
      {
        id: "BATCH005",
        batchNumber: "LIS2024001",
        expiryDate: "2026-12-01",
        totalTablets: 120,
        remainingTablets: 120,
        dateReceived: "2024-07-01",
        packSize: 30,
        packsReceived: 4,
        openedPacks: 0,
        sealedPacks: 4,
        supplier: "HeartMeds Inc",
        status: "Active"
      }
    ],
    lastRestocked: "2024-07-01",
    monthlyUsage: 60,
    status: "Low Stock",
    location: "C1-D2",
    barcode: "123456789005",
    prescriptionRequired: true,
    isGeneric: true,
    notes: "ACE inhibitor for hypertension"
  }
];

const mockTransactions: StockTransaction[] = [
  {
    id: "TXN001",
    medicationId: "MED001",
    medicationName: "Amoxicillin 500mg",
    type: "Dispensed",
    quantity: -28,
    previousStock: 400,
    newStock: 372,
    date: "2025-08-15",
    time: "08:30",
    performedBy: "Pharm. Johnson",
    patientId: "P001",
    prescriptionId: "RX001",
    reason: "Patient prescription fulfillment",
    batchesAffected: [
      { batchId: "BATCH001", quantity: -28 }
    ]
  },
  {
    id: "TXN002",
    medicationId: "MED004",
    medicationName: "Paracetamol 500mg",
    type: "Dispensed",
    quantity: -30,
    previousStock: 880,
    newStock: 850,
    date: "2025-08-15",
    time: "08:35",
    performedBy: "Pharm. Johnson",
    patientId: "P001",
    prescriptionId: "RX001",
    batchesAffected: [
      { batchId: "BATCH003", quantity: -30 }
    ]
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDaysUntilExpiry = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getBatchStatus = (batch: MedicationBatch): BatchStatus => {
  const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
  
  if (daysUntilExpiry < 0) return "Expired";
  if (daysUntilExpiry <= 30) return "Near Expiry";
  return "Active";
};

const getStockStatus = (medication: Medication): StockStatus => {
  // Check if any batches are expired or near expiry
  const hasExpiredBatch = medication.batches.some(batch => 
    getDaysUntilExpiry(batch.expiryDate) < 0 && batch.remainingTablets > 0
  );
  const hasNearExpiryBatch = medication.batches.some(batch => 
    getDaysUntilExpiry(batch.expiryDate) <= 30 && getDaysUntilExpiry(batch.expiryDate) >= 0 && batch.remainingTablets > 0
  );

  if (hasExpiredBatch) return "Expired";
  if (medication.currentStock === 0) return "Out of Stock";
  if (hasNearExpiryBatch) return "Near Expiry";
  if (medication.currentStock <= medication.minimumStock) return "Low Stock";
  return "In Stock";
};

export default function EnhancedPharmacyInventorySystem() {
  const [inventory, setInventory] = useState<Medication[]>(
    mockInventory.map(med => ({ 
      ...med, 
      status: getStockStatus(med),
      batches: med.batches.map(batch => ({
        ...batch,
        status: getBatchStatus(batch)
      }))
    }))
  );
  const [transactions, setTransactions] = useState<StockTransaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MedicationCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "All">("All");
  const [supplierFilter, setSupplierFilter] = useState<string | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedView, setSelectedView] = useState<"inventory" | "transactions" | "categories" | "batches">("inventory");
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState<string | null>(null);
  const [showDispenseModal, setShowDispenseModal] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  
  // Restock form state
  const [restockData, setRestockData] = useState({
    packSize: 8,
    packsReceived: 0,
    batchNumber: "",
    expiryDate: "",
    supplier: ""
  });

  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  
  // Dispense form state
  const [dispenseData, setDispenseData] = useState({
    quantity: 0,
    patientId: "",
    prescriptionId: ""
  });

  // Edit form state
  const [editData, setEditData] = useState<Partial<Medication>>({});

  const itemsPerPage = 10;

  // Add Medication Form State
  const [newMed, setNewMed] = useState<Partial<Medication>>({
    name: "",
    genericName: "",
    category: "Other",
    strength: "",
    dosageForm: "",
    manufacturer: "",
    supplier: "",
    supplierStatus: "Active",
    packSize: 1,
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    lastRestocked: new Date().toISOString().split('T')[0],
    monthlyUsage: 0,
    location: "",
    barcode: "",
    prescriptionRequired: false,
    isGeneric: false,
    notes: "",
    batches: []
  });

  // Update stock status whenever inventory changes
  useEffect(() => {
    setInventory(prev => prev.map(med => ({
      ...med,
      status: getStockStatus(med),
      batches: med.batches.map(batch => ({
        ...batch,
        status: getBatchStatus(batch)
      }))
    })));
  }, []);

  // Calculate category summaries
  const getCategorySummaries = (): CategorySummary[] => {
    const categoryMap = inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          category: item.category,
          totalItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          expiredItems: 0,
          nearExpiryItems: 0
        };
      }
      const cat = acc[item.category];
      cat.totalItems++;
      if (item.status === "Low Stock") cat.lowStockItems++;
      if (item.status === "Out of Stock") cat.outOfStockItems++;
      if (item.status === "Expired") cat.expiredItems++;
      if (item.status === "Near Expiry") cat.nearExpiryItems++;
      return acc;
    }, {} as Record<MedicationCategory, CategorySummary>);

    return Object.values(categoryMap).sort((a, b) => a.category.localeCompare(b.category));
  };

  // Enhanced FIFO dispensing logic
  const dispenseFromFIFO = (medicationId: string, quantityToDispense: number, patientId?: string, prescriptionId?: string) => {
    const medication = inventory.find(med => med.id === medicationId);
    if (!medication || medication.currentStock < quantityToDispense) {
      alert("Insufficient stock available!");
      return false;
    }

    // Sort batches by expiry date (FIFO)
    const availableBatches = medication.batches
      .filter(batch => batch.remainingTablets > 0 && batch.status !== "Expired")
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let remainingToDispense = quantityToDispense;
    const batchesAffected: Array<{batchId: string, quantity: number}> = [];

    // Dispense from batches in FIFO order
    const updatedBatches = medication.batches.map(batch => {
      if (remainingToDispense <= 0) return batch;
      
      const batchInAvailable = availableBatches.find(ab => ab.id === batch.id);
      if (!batchInAvailable) return batch;

      const canDispenseFromBatch = Math.min(batch.remainingTablets, remainingToDispense);
      if (canDispenseFromBatch > 0) {
        remainingToDispense -= canDispenseFromBatch;
        batchesAffected.push({
          batchId: batch.id,
          quantity: canDispenseFromBatch
        });

        // Update pack counts
        const newRemainingTablets = batch.remainingTablets - canDispenseFromBatch;
        const tabletsPerPack = batch.packSize;
        const newOpenedPacks = Math.ceil((batch.totalTablets - newRemainingTablets) / tabletsPerPack) - Math.floor((batch.totalTablets - batch.remainingTablets) / tabletsPerPack);
        
        return {
          ...batch,
          remainingTablets: newRemainingTablets,
          openedPacks: batch.openedPacks + newOpenedPacks,
          sealedPacks: Math.max(0, batch.sealedPacks - newOpenedPacks)
        };
      }
      return batch;
    });

    if (remainingToDispense > 0) {
      alert(`Could only dispense ${quantityToDispense - remainingToDispense} tablets. Insufficient stock.`);
      return false;
    }

    // Create transaction record
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      medicationId,
      medicationName: `${medication.name} ${medication.strength}`,
      type: "Dispensed",
      quantity: -quantityToDispense,
      previousStock: medication.currentStock,
      newStock: medication.currentStock - quantityToDispense,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      performedBy: "Current User",
      patientId,
      prescriptionId,
      batchesAffected
    };

    // Update inventory
    setInventory(prev => prev.map(med => 
      med.id === medicationId 
        ? { 
            ...med, 
            currentStock: med.currentStock - quantityToDispense,
            lastDispensed: new Date().toISOString().split('T')[0],
            batches: updatedBatches,
            status: getStockStatus({ ...med, currentStock: med.currentStock - quantityToDispense, batches: updatedBatches })
          }
        : med
    ));

    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  // Enhanced restock with batch tracking
  const handleRestock = (medicationId: string) => {
    const { packSize, packsReceived, batchNumber, expiryDate, supplier } = restockData;
    
    if (!packsReceived || packsReceived <= 0 || !batchNumber || !expiryDate) {
      alert("Please fill in all required fields");
      return;
    }

    const medication = inventory.find(med => med.id === medicationId);
    if (!medication) return;

    const totalTablets = packSize * packsReceived;

    const newBatch: MedicationBatch = {
      id: `BATCH${Date.now()}`,
      batchNumber,
      expiryDate,
      totalTablets,
      remainingTablets: totalTablets,
      dateReceived: new Date().toISOString().split('T')[0],
      packSize,
      packsReceived,
      openedPacks: 0,
      sealedPacks: packsReceived,
      supplier: supplier || medication.supplier,
      status: getBatchStatus({ expiryDate } as MedicationBatch)
    };

    const newStock = medication.currentStock + totalTablets;
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      medicationId,
      medicationName: `${medication.name} ${medication.strength}`,
      type: "Restocked",
      quantity: totalTablets,
      previousStock: medication.currentStock,
      newStock,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      performedBy: "Current User",
      reason: `Added new batch: ${batchNumber}`,
      batchNumber
    };

    setInventory(prev => prev.map(med => 
      med.id === medicationId 
        ? { 
            ...med, 
            currentStock: newStock,
            lastRestocked: new Date().toISOString().split('T')[0],
            batches: [...med.batches, newBatch],
            status: getStockStatus({ ...med, currentStock: newStock, batches: [...med.batches, newBatch] })
          }
        : med
    ));

    setTransactions(prev => [newTransaction, ...prev]);
    setShowRestockModal(null);
    setRestockData({
      packSize: medication.packSize,
      packsReceived: 0,
      batchNumber: "",
      expiryDate: "",
      supplier: medication.supplier
    });
  };

  // Handle stock adjustment
  const handleStockAdjustment = (medicationId: string) => {
    const quantity = parseInt(adjustQuantity);
    if (isNaN(quantity) || !adjustReason) {
      alert("Please enter a valid quantity and reason");
      return;
    }

    const medication = inventory.find(med => med.id === medicationId);
    if (!medication) return;

    const newStock = Math.max(0, medication.currentStock + quantity);
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      medicationId,
      medicationName: `${medication.name} ${medication.strength}`,
      type: "Adjusted",
      quantity,
      previousStock: medication.currentStock,
      newStock,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      performedBy: "Current User",
      reason: adjustReason
    };

    setInventory(prev => prev.map(med => 
      med.id === medicationId 
        ? { 
            ...med, 
            currentStock: newStock,
            status: getStockStatus({ ...med, currentStock: newStock })
          }
        : med
    ));

    setTransactions(prev => [newTransaction, ...prev]);
    setShowAdjustModal(null);
    setAdjustQuantity("");
    setAdjustReason("");
  };

  // Handle dispense
  const handleDispense = (medicationId: string) => {
    const { quantity, patientId, prescriptionId } = dispenseData;
    
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const success = dispenseFromFIFO(medicationId, quantity, patientId, prescriptionId);
    if (success) {
      setShowDispenseModal(null);
      setDispenseData({ quantity: 0, patientId: "", prescriptionId: "" });
      alert(`Successfully dispensed ${quantity} tablets using FIFO system`);
    }
  };

  // Handle edit medication
  const handleEditMedication = (medicationId: string) => {
    if (!editData.name || !editData.strength) {
      alert("Please fill in required fields");
      return;
    }

    setInventory(prev => prev.map(med => 
      med.id === medicationId 
        ? { 
            ...med, 
            ...editData,
            status: getStockStatus({ ...med, ...editData } as Medication)
          }
        : med
    ));

    setShowEditModal(null);
    setEditData({});
    alert("Medication updated successfully!");
  };

  // Export functionality
  const handleExport = (format: 'csv' | 'json') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'csv') {
      const headers = 'Name,Category,Strength,Current Stock,Status,Expiry Date,Location\n';
      const rows = filteredInventory.map(med => 
        `"${med.name}","${med.category}","${med.strength}",${med.currentStock},"${med.status}","${med.batches[0]?.expiryDate || 'N/A'}","${med.location}"`
      ).join('\n');
      content = headers + rows;
      filename = 'pharmacy_inventory.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(filteredInventory, null, 2);
      filename = 'pharmacy_inventory.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get status badge colors
  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800 border-green-200";
      case "Low Stock": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border-red-200";
      case "Expired": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Near Expiry": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getBatchStatusColor = (status: BatchStatus) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Near Expiry": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Recalled": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: MedicationCategory) => {
    const colors = {
      "Antibiotics": "bg-blue-100 text-blue-800 border-blue-200",
      "Analgesics": "bg-purple-100 text-purple-800 border-purple-200",
      "Cardiovascular": "bg-red-100 text-red-800 border-red-200",
      "Diabetes": "bg-green-100 text-green-800 border-green-200",
      "Respiratory": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Vitamins": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Gastrointestinal": "bg-pink-100 text-pink-800 border-pink-200",
      "Dermatology": "bg-teal-100 text-teal-800 border-teal-200",
      "Neurology": "bg-orange-100 text-orange-800 border-orange-200",
      "Other": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category] || colors["Other"];
  };

  const getCategoryIcon = (category: MedicationCategory) => {
    switch (category) {
      case "Antibiotics": return Shield;
      case "Analgesics": return Activity;
      case "Cardiovascular": return Heart;
      case "Diabetes": return Droplet;
      case "Respiratory": return Activity;
      default: return Pill;
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesSupplier = supplierFilter === "All" || item.supplier === supplierFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique suppliers for filter
  const suppliers = Array.from(new Set(inventory.map(item => item.supplier)));

  // Get unique categories for filter
  const allCategories = [...new Set(inventory.map(item => item.category))].sort();

  // Calculate overall statistics
  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => item.status === "In Stock").length,
    lowStock: inventory.filter(item => item.status === "Low Stock").length,
    outOfStock: inventory.filter(item => item.status === "Out of Stock").length,
    nearExpiry: inventory.filter(item => item.status === "Near Expiry").length,
    expired: inventory.filter(item => item.status === "Expired").length,
    reorderNeeded: inventory.filter(item => item.currentStock <= item.minimumStock).length,
    totalBatches: inventory.reduce((sum, med) => sum + med.batches.length, 0),
    activeBatches: inventory.reduce((sum, med) => sum + med.batches.filter(b => b.status === "Active").length, 0)
  };

  // Handle add medication
  const handleAddMedication = () => {
    if (!newMed.name || !newMed.category || !newMed.strength || !newMed.dosageForm) {
      alert("Please fill in all required fields");
      return;
    }

    const newMedication: Medication = {
      id: `MED${Date.now()}`,
      ...newMed,
      status: "Out of Stock",
      lastRestocked: new Date().toISOString().split('T')[0],
      monthlyUsage: newMed.monthlyUsage || 0,
      supplierStatus: newMed.supplierStatus || "Active",
      genericName: newMed.genericName || "",
      barcode: newMed.barcode || "",
      notes: newMed.notes || "",
      batches: []
    } as Medication;

    setInventory(prev => [...prev, newMedication]);
    setShowAddModal(false);
    setNewMed({
      name: "",
      genericName: "",
      category: "Other",
      strength: "",
      dosageForm: "",
      manufacturer: "",
      supplier: "",
      supplierStatus: "Active",
      packSize: 1,
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      monthlyUsage: 0,
      location: "",
      barcode: "",
      prescriptionRequired: false,
      isGeneric: false,
      notes: "",
      batches: []
    });
    alert("Medication added successfully!");
  };

  // Restock Modal Component
  const RestockModal = () => {
    if (!showRestockModal) return null;

    const medication = inventory.find(med => med.id === showRestockModal);
    if (!medication) return null;

    return (
      <Dialog open={!!showRestockModal} onOpenChange={() => setShowRestockModal(null)}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add New Batch - {medication.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">{medication.name} {medication.strength}</h4>
              <p className="text-sm text-gray-600">Current Stock: {medication.currentStock} tablets</p>
              <p className="text-sm text-gray-600">Standard Pack Size: {medication.packSize} tablets</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pack-size">Tablets per Pack</Label>
                <Input
                  id="pack-size"
                  type="number"
                  value={restockData.packSize}
                  onChange={(e) => setRestockData({...restockData, packSize: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="packs-received">Packs Received</Label>
                <Input
                  id="packs-received"
                  type="number"
                  value={restockData.packsReceived || ''}
                  onChange={(e) => setRestockData({...restockData, packsReceived: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="batch-number">Batch Number</Label>
              <Input
                id="batch-number"
                value={restockData.batchNumber}
                onChange={(e) => setRestockData({...restockData, batchNumber: e.target.value})}
                placeholder="e.g., AMX2024003"
              />
            </div>

            <div>
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input
                id="expiry-date"
                type="date"
                value={restockData.expiryDate}
                onChange={(e) => setRestockData({...restockData, expiryDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="batch-supplier">Supplier</Label>
              <Input
                id="batch-supplier"
                value={restockData.supplier || medication.supplier}
                onChange={(e) => setRestockData({...restockData, supplier: e.target.value})}
              />
            </div>

            {restockData.packSize && restockData.packsReceived ? (
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm">
                  <div><strong>Total Tablets:</strong> {restockData.packSize * restockData.packsReceived}</div>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => handleRestock(showRestockModal)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
            <Button variant="outline" onClick={() => setShowRestockModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Dispense Modal Component
  const DispenseModal = () => {
    if (!showDispenseModal) return null;

    const medication = inventory.find(med => med.id === showDispenseModal);
    if (!medication) return null;

    // Sort batches by expiry date to show FIFO order
    const sortedBatches = medication.batches
      .filter(batch => batch.remainingTablets > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    return (
      <Dialog open={!!showDispenseModal} onOpenChange={() => setShowDispenseModal(null)}>
        <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Dispense Medication - {medication.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">{medication.name} {medication.strength}</h4>
              <p className="text-sm text-gray-600">Available Stock: {medication.currentStock} tablets</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="dispense-quantity">Quantity to Dispense (tablets)</Label>
                <Input
                  id="dispense-quantity"
                  type="number"
                  value={dispenseData.quantity || ''}
                  onChange={(e) => setDispenseData({...dispenseData, quantity: parseInt(e.target.value) || 0})}
                  min="1"
                  max={medication.currentStock}
                />
              </div>
              <div>
                <Label htmlFor="patient-id">Patient ID</Label>
                <Input
                  id="patient-id"
                  value={dispenseData.patientId}
                  onChange={(e) => setDispenseData({...dispenseData, patientId: e.target.value})}
                  placeholder="e.g., PAT001"
                />
              </div>
              <div>
                <Label htmlFor="prescription-id">Prescription ID</Label>
                <Input
                  id="prescription-id"
                  value={dispenseData.prescriptionId}
                  onChange={(e) => setDispenseData({...dispenseData, prescriptionId: e.target.value})}
                  placeholder="e.g., RX001"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <h5 className="font-medium mb-2">🔄 FIFO Dispensing Order:</h5>
              <div className="space-y-2 text-sm">
                {sortedBatches.slice(0, 3).map((batch, index) => (
                  <div key={batch.id} className="flex justify-between items-center">
                    <span className={index === 0 ? "font-medium" : ""}>
                      {index + 1}. Batch {batch.batchNumber}
                      {index === 0 && <span className="text-blue-600"> (Use First)</span>}
                    </span>
                    <span>{batch.remainingTablets} tablets</span>
                  </div>
                ))}
                {sortedBatches.length > 3 && (
                  <div className="text-gray-500">...and {sortedBatches.length - 3} more batches</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleDispense(showDispenseModal)}>
              <Minus className="h-4 w-4 mr-2" />
              Dispense
            </Button>
            <Button variant="outline" onClick={() => setShowDispenseModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Batch Details Modal Component
  const BatchModal = () => {
    if (!showBatchModal) return null;

    const medication = inventory.find(med => med.id === showBatchModal);
    if (!medication) return null;

    const sortedBatches = medication.batches.sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    return (
      <Dialog open={!!showBatchModal} onOpenChange={() => setShowBatchModal(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Batch Details - {medication.name} {medication.strength}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-lg font-bold text-blue-600">{medication.currentStock}</div>
                <div className="text-sm text-gray-600">Total Tablets</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-lg font-bold text-green-600">{sortedBatches.length}</div>
                <div className="text-sm text-gray-600">Total Batches</div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-lg font-bold text-orange-600">
                  {sortedBatches.filter(b => b.status === "Active" && b.remainingTablets > 0).length}
                </div>
                <div className="text-sm text-gray-600">Active Batches</div>
              </div>
            </div>

            <div className="space-y-3">
              {sortedBatches.map((batch, index) => {
                const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
                const isFirst = index === 0 && batch.remainingTablets > 0;
                
                return (
                  <div key={batch.id} className={`border rounded-lg p-4 ${isFirst ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          Batch {batch.batchNumber}
                          {isFirst && <span className="text-xs text-blue-600 ml-1">(NEXT)</span>}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Received: {formatDate(batch.dateReceived)} • Supplier: {batch.supplier}
                        </p>
                      </div>
                      <Badge className={getBatchStatusColor(batch.status)} variant="outline">
                        {batch.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Available:</strong>
                        <div className="font-medium text-lg">{batch.remainingTablets} tablets</div>
                        <div className="text-gray-500">
                          {Math.floor(batch.remainingTablets / batch.packSize)} full packs
                        </div>
                      </div>
                      <div>
                        <strong>Pack Status:</strong>
                        <div>Sealed: {batch.sealedPacks}</div>
                        <div>Opened: {batch.openedPacks}</div>
                      </div>
                      <div>
                        <strong>Expiry:</strong>
                        <div className={daysUntilExpiry <= 30 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                          {formatDate(batch.expiryDate)}
                        </div>
                        <div className="text-gray-500">
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'EXPIRED'}
                        </div>
                      </div>
                      <div>
                        <strong>Pack Size:</strong>
                        <div>{batch.packSize} tablets/pack</div>
                        <div className="text-gray-500">
                          Received: {batch.packsReceived} packs
                        </div>
                      </div>
                    </div>
                    
                    {batch.notes && (
                      <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {batch.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Adjust Stock Modal Component
  const AdjustStockModal = () => {
    if (!showAdjustModal) return null;

    const medication = inventory.find(med => med.id === showAdjustModal);
    if (!medication) return null;

    return (
      <Dialog open={!!showAdjustModal} onOpenChange={() => setShowAdjustModal(null)}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">{medication.name} {medication.strength}</h4>
              <p className="text-sm text-gray-600">Current Stock: {medication.currentStock} tablets</p>
            </div>

            <div>
              <Label htmlFor="adjust-quantity">Adjustment Quantity (+ or -)</Label>
              <Input
                id="adjust-quantity"
                type="number"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                placeholder="Enter quantity (use negative for reduction)"
              />
            </div>

            <div>
              <Label htmlFor="adjust-reason">Reason for Adjustment</Label>
              <Select 
                value={adjustReason}
                onValueChange={(value) => setAdjustReason(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Damaged">Damaged Items</SelectItem>
                  <SelectItem value="Expired">Expired Items</SelectItem>
                  <SelectItem value="Lost">Lost/Missing Items</SelectItem>
                  <SelectItem value="Returned">Returned Items</SelectItem>
                  <SelectItem value="Inventory Count">Inventory Count Correction</SelectItem>
                  <SelectItem value="Transfer">Transfer to/from Other Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleStockAdjustment(showAdjustModal)}>
              Adjust Stock
            </Button>
            <Button variant="outline" onClick={() => setShowAdjustModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Details Modal Component
  const DetailsModal = () => {
    if (!showDetailsModal) return null;

    const medication = inventory.find(med => med.id === showDetailsModal);
    if (!medication) return null;

    return (
      <Dialog open={!!showDetailsModal} onOpenChange={() => setShowDetailsModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medication Details - {medication.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {medication.name}</div>
                  <div><strong>Generic Name:</strong> {medication.genericName || 'N/A'}</div>
                  <div><strong>Strength:</strong> {medication.strength}</div>
                  <div><strong>Dosage Form:</strong> {medication.dosageForm}</div>
                  <div><strong>Category:</strong> {medication.category}</div>
                  <div><strong>Manufacturer:</strong> {medication.manufacturer}</div>
                  <div><strong>Supplier:</strong> {medication.supplier}</div>
                  <div><strong>Location:</strong> {medication.location}</div>
                  <div><strong>Barcode:</strong> {medication.barcode || 'N/A'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Stock Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Current Stock:</strong> {medication.currentStock} tablets</div>
                  <div><strong>Minimum Stock:</strong> {medication.minimumStock} tablets</div>
                  <div><strong>Maximum Stock:</strong> {medication.maximumStock} tablets</div>
                  <div><strong>Pack Size:</strong> {medication.packSize} tablets</div>
                  <div><strong>Monthly Usage:</strong> {medication.monthlyUsage} tablets</div>
                  <div><strong>Last Restocked:</strong> {formatDate(medication.lastRestocked)}</div>
                  <div><strong>Last Dispensed:</strong> {medication.lastDispensed ? formatDate(medication.lastDispensed) : 'Never'}</div>
                </div>
              </div>
            </div>

            {/* Status & Flags */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Status & Properties</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(medication.status)} variant="outline">
                  {medication.status}
                </Badge>
                <Badge className={getCategoryColor(medication.category)} variant="outline">
                  {medication.category}
                </Badge>
                {medication.isGeneric && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                    Generic
                  </Badge>
                )}
                {medication.prescriptionRequired && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200" variant="outline">
                    Prescription Required
                  </Badge>
                )}
                <Badge className={
                  medication.supplierStatus === "Active" ? "bg-green-100 text-green-800 border-green-200" :
                  medication.supplierStatus === "Inactive" ? "bg-red-100 text-red-800 border-red-200" :
                  "bg-yellow-100 text-yellow-800 border-yellow-200"
                } variant="outline">
                  Supplier: {medication.supplierStatus}
                </Badge>
              </div>
            </div>

            {/* Batch Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Batch Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-bold text-blue-600">{medication.batches.length}</div>
                  <div>Total Batches</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-bold text-green-600">
                    {medication.batches.filter(b => b.status === "Active").length}
                  </div>
                  <div>Active Batches</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="font-bold text-orange-600">
                    {medication.batches.filter(b => b.status === "Near Expiry").length}
                  </div>
                  <div>Near Expiry</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="font-bold text-red-600">
                    {medication.batches.filter(b => b.status === "Expired").length}
                  </div>
                  <div>Expired</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {medication.notes && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Notes</h3>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  {medication.notes}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowDetailsModal(null);
              setShowEditModal(medication.id);
              setEditData(medication);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Edit Modal Component
  const EditModal = () => {
    if (!showEditModal) return null;

    const medication = inventory.find(med => med.id === showEditModal);
    if (!medication) return null;

    return (
      <Dialog open={!!showEditModal} onOpenChange={() => setShowEditModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medication - {medication.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editData.name || medication.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-genericName">Generic Name</Label>
                <Input
                  id="edit-genericName"
                  value={editData.genericName || medication.genericName || ''}
                  onChange={(e) => setEditData({...editData, genericName: e.target.value})}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={editData.category || medication.category} 
                  onValueChange={(value: MedicationCategory) => setEditData({...editData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Antibiotics", "Analgesics", "Cardiovascular", "Diabetes", "Respiratory", "Vitamins", "Gastrointestinal", "Dermatology", "Neurology", "Other"].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-strength">Strength *</Label>
                <Input
                  id="edit-strength"
                  value={editData.strength || medication.strength}
                  onChange={(e) => setEditData({...editData, strength: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-dosageForm">Dosage Form</Label>
                <Input
                  id="edit-dosageForm"
                  value={editData.dosageForm || medication.dosageForm}
                  onChange={(e) => setEditData({...editData, dosageForm: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-manufacturer">Manufacturer</Label>
                <Input
                  id="edit-manufacturer"
                  value={editData.manufacturer || medication.manufacturer}
                  onChange={(e) => setEditData({...editData, manufacturer: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Input
                  id="edit-supplier"
                  value={editData.supplier || medication.supplier}
                  onChange={(e) => setEditData({...editData, supplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editData.location || medication.location}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-minimumStock">Minimum Stock</Label>
                <Input
                  id="edit-minimumStock"
                  type="number"
                  value={editData.minimumStock || medication.minimumStock}
                  onChange={(e) => setEditData({...editData, minimumStock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-maximumStock">Maximum Stock</Label>
                <Input
                  id="edit-maximumStock"
                  type="number"
                  value={editData.maximumStock || medication.maximumStock}
                  onChange={(e) => setEditData({...editData, maximumStock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-monthlyUsage">Monthly Usage</Label>
                <Input
                  id="edit-monthlyUsage"
                  type="number"
                  value={editData.monthlyUsage || medication.monthlyUsage}
                  onChange={(e) => setEditData({...editData, monthlyUsage: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-packSize">Pack Size</Label>
                <Input
                  id="edit-packSize"
                  type="number"
                  value={editData.packSize || medication.packSize}
                  onChange={(e) => setEditData({...editData, packSize: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-prescriptionRequired"
                  checked={editData.prescriptionRequired !== undefined ? editData.prescriptionRequired : medication.prescriptionRequired}
                  onCheckedChange={(checked) => setEditData({...editData, prescriptionRequired: !!checked})}
                />
                <Label htmlFor="edit-prescriptionRequired">Prescription Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-isGeneric"
                  checked={editData.isGeneric !== undefined ? editData.isGeneric : medication.isGeneric}
                  onCheckedChange={(checked) => setEditData({...editData, isGeneric: !!checked})}
                />
                <Label htmlFor="edit-isGeneric">Is Generic</Label>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editData.notes !== undefined ? editData.notes : medication.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleEditMedication(showEditModal)}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Add Medication Modal
  const AddMedicationModal = () => {
    return (
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newMed.name}
                onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                placeholder="Medication name"
              />
            </div>
            <div>
              <Label htmlFor="genericName">Generic Name</Label>
              <Input
                id="genericName"
                value={newMed.genericName}
                onChange={(e) => setNewMed({...newMed, genericName: e.target.value})}
                placeholder="Generic name"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select 
                value={newMed.category} 
                onValueChange={(value: MedicationCategory) => setNewMed({...newMed, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {["Antibiotics", "Analgesics", "Cardiovascular", "Diabetes", "Respiratory", "Vitamins", "Gastrointestinal", "Dermatology", "Neurology", "Other"].map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strength">Strength *</Label>
              <Input
                id="strength"
                value={newMed.strength}
                onChange={(e) => setNewMed({...newMed, strength: e.target.value})}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <Label htmlFor="dosageForm">Dosage Form *</Label>
              <Input
                id="dosageForm"
                value={newMed.dosageForm}
                onChange={(e) => setNewMed({...newMed, dosageForm: e.target.value})}
                placeholder="e.g., Tablet"
              />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={newMed.manufacturer}
                onChange={(e) => setNewMed({...newMed, manufacturer: e.target.value})}
                placeholder="Manufacturer name"
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={newMed.supplier}
                onChange={(e) => setNewMed({...newMed, supplier: e.target.value})}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <Label>Supplier Status</Label>
              <Select 
                value={newMed.supplierStatus} 
                onValueChange={(value: SupplierStatus) => setNewMed({...newMed, supplierStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currentStock">Initial Stock</Label>
              <Input
                id="currentStock"
                type="number"
                value={newMed.currentStock || ''}
                onChange={(e) => setNewMed({...newMed, currentStock: parseInt(e.target.value) || 0})}
                placeholder="Initial stock quantity"
              />
            </div>
            <div>
              <Label htmlFor="minimumStock">Minimum Stock *</Label>
              <Input
                id="minimumStock"
                type="number"
                value={newMed.minimumStock || ''}
                onChange={(e) => setNewMed({...newMed, minimumStock: parseInt(e.target.value) || 0})}
                placeholder="Minimum stock level"
              />
            </div>
            <div>
              <Label htmlFor="maximumStock">Maximum Stock</Label>
              <Input
                id="maximumStock"
                type="number"
                value={newMed.maximumStock || ''}
                onChange={(e) => setNewMed({...newMed, maximumStock: parseInt(e.target.value) || 0})}
                placeholder="Maximum stock level"
              />
            </div>
            <div>
              <Label htmlFor="monthlyUsage">Monthly Usage</Label>
              <Input
                id="monthlyUsage"
                type="number"
                value={newMed.monthlyUsage || ''}
                onChange={(e) => setNewMed({...newMed, monthlyUsage: parseInt(e.target.value) || 0})}
                placeholder="Estimated monthly usage"
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={newMed.location}
                onChange={(e) => setNewMed({...newMed, location: e.target.value})}
                placeholder="Storage location"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={newMed.barcode}
                onChange={(e) => setNewMed({...newMed, barcode: e.target.value})}
                placeholder="Barcode"
              />
            </div>
            <div>
              <Label htmlFor="packSize">Pack Size</Label>
              <Input
                id="packSize"
                type="number"
                value={newMed.packSize || ''}
                onChange={(e) => setNewMed({...newMed, packSize: parseInt(e.target.value) || 1})}
                placeholder="Tablets per pack"
              />
            </div>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="prescriptionRequired"
                checked={newMed.prescriptionRequired}
                onCheckedChange={(checked) => setNewMed({...newMed, prescriptionRequired: !!checked})}
              />
              <Label htmlFor="prescriptionRequired">Prescription Required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isGeneric"
                checked={newMed.isGeneric}
                onCheckedChange={(checked) => setNewMed({...newMed, isGeneric: !!checked})}
              />
              <Label htmlFor="isGeneric">Is Generic</Label>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newMed.notes}
                onChange={(e) => setNewMed({...newMed, notes: e.target.value})}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={handleAddMedication}>
              Add Medication
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pharmacy Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex border-b">
        {[
          { id: "inventory", label: "Inventory", icon: Package },
          { id: "batches", label: "Batch View", icon: Layers },
          { id: "categories", label: "Categories", icon: Filter },
          { id: "transactions", label: "Transactions", icon: Clock }
        ].map(view => {
          const IconComponent = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                selectedView === view.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Medications</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Unavailable</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.nearExpiry}</div>
            <p className="text-xs text-muted-foreground">≤30 days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Past expiry</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBatches}</div>
            <p className="text-xs text-muted-foreground">All batches</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeBatches}</div>
            <p className="text-xs text-muted-foreground">In use</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch View */}
      {selectedView === "batches" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Batch Management</h2>
          
          {/* Demo Dispensing Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>🎮 Demo: FIFO Dispensing System</CardTitle>
              <CardDescription>Click to test the automatic FIFO (First In, First Out) dispensing system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => dispenseFromFIFO("MED001", 15, "DEMO-P001", "DEMO-RX001")}
                >
                  Dispense 15x Amoxicillin
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => dispenseFromFIFO("MED004", 25, "DEMO-P002", "DEMO-RX002")}
                >
                  Dispense 25x Paracetamol
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowDispenseModal("MED001")}
                >
                  🧪 Custom Dispense (Amoxicillin)
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowDispenseModal("MED004")}
                >
                  🧪 Custom Dispense (Paracetamol)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Batch Overview */}
          <div className="space-y-4">
            {inventory.map((medication) => (
              <Card key={medication.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{medication.name} {medication.strength}</CardTitle>
                      <CardDescription>
                        Total Stock: {medication.currentStock} tablets • {medication.batches.length} batches
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(medication.status)} variant="outline">
                        {medication.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setShowBatchModal(medication.id)}>
                        <Layers className="h-4 w-4 mr-1" />
                        View Batches
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {medication.batches.slice(0, 3).map((batch, index) => {
                      const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
                      const isFirst = index === 0 && batch.remainingTablets > 0;
                      
                      return (
                        <div key={batch.id} className={`p-3 rounded border ${isFirst ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">
                              Batch {batch.batchNumber}
                              {isFirst && <span className="text-xs text-blue-600 ml-1">(NEXT)</span>}
                            </h4>
                            <Badge className={getBatchStatusColor(batch.status)} variant="outline" className="text-xs">
                              {batch.status}
                            </Badge>
                          </div>
                          <div className="text-xs space-y-1">
                            <div><strong>Available:</strong> {batch.remainingTablets} tablets</div>
                            <div><strong>Expires:</strong> {formatDate(batch.expiryDate)}</div>
                            <div className={daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-gray-500'}>
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'EXPIRED'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {medication.batches.length > 3 && (
                      <div className="p-3 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                        +{medication.batches.length - 3} more batches
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories View */}
      {selectedView === "categories" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCategorySummaries().map((category) => {
              const IconComponent = getCategoryIcon(category.category);
              return (
                <Card key={category.category} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(category.category)}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.category}</CardTitle>
                          <CardDescription>{category.totalItems} medications</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span>In Stock:</span>
                        <span className="font-medium text-green-600">
                          {category.totalItems - category.outOfStockItems - category.expiredItems}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Low Stock:</span>
                        <span className="font-medium text-yellow-600">{category.lowStockItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Out of Stock:</span>
                        <span className="font-medium text-red-600">{category.outOfStockItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Near Expiry:</span>
                        <span className="font-medium text-orange-600">{category.nearExpiryItems}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setCategoryFilter(category.category);
                          setSelectedView("inventory");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions View */}
      {selectedView === "transactions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Stock Transactions</h2>
            <div className="text-sm text-gray-600">
              Showing latest {transactions.length} transactions
            </div>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "Dispensed" ? "bg-red-100" :
                          transaction.type === "Restocked" ? "bg-green-100" :
                          transaction.type === "Adjusted" ? "bg-blue-100" :
                          transaction.type === "Expired" ? "bg-gray-100" :
                          "bg-yellow-100"
                        }`}>
                          {transaction.type === "Dispensed" && <Minus className="h-4 w-4 text-red-600" />}
                          {transaction.type === "Restocked" && <Plus className="h-4 w-4 text-green-600" />}
                          {transaction.type === "Adjusted" && <RefreshCw className="h-4 w-4 text-blue-600" />}
                          {transaction.type === "Expired" && <XCircle className="h-4 w-4 text-gray-600" />}
                          {transaction.type === "Returned" && <Package className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.medicationName}</div>
                          <div className="text-sm text-gray-600">
                            {transaction.type} by {transaction.performedBy} on {formatDate(transaction.date)} at {transaction.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${
                        transaction.quantity < 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {transaction.quantity > 0 ? "+" : ""}{transaction.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.previousStock} → {transaction.newStock}
                      </div>
                    </div>
                  </div>
                  {transaction.reason && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Reason:</strong> {transaction.reason}
                    </div>
                  )}
                  {transaction.patientId && transaction.prescriptionId && (
                    <div className="mt-2 text-xs text-blue-600">
                      <strong>Patient:</strong> {transaction.patientId} | <strong>Prescription:</strong> {transaction.prescriptionId}
                    </div>
                  )}
                  {transaction.batchNumber && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Batch:</strong> {transaction.batchNumber}
                    </div>
                  )}
                  {transaction.batchesAffected && transaction.batchesAffected.length > 0 && (
                    <div className="mt-2 text-xs text-purple-600">
                      <strong>Batches Affected:</strong> {transaction.batchesAffected.map(ba => 
                        `${ba.quantity} from ${ba.batchId}`
                      ).join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {transactions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-medium mb-1">No transactions found</p>
                  <p className="text-sm">
                    Stock movements will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Inventory View */}
      {selectedView === "inventory" && (
        <div className="space-y-6">
          {/* Search & Filter Section */}
          <div className="space-y-4 p-4 border rounded">
            <h2 className="font-semibold">Search & Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Search Inventory</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, generic, manufacturer"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Category Filter</Label>
                <Select 
                  value={categoryFilter} 
                  onValueChange={(value: string) => {
                    setCategoryFilter(value as MedicationCategory | "All");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {allCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status Filter</Label>
                <Select 
                  value={statusFilter} 
                  onValueChange={(value: string) => {
                    setStatusFilter(value as StockStatus | "All");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Near Expiry">Near Expiry</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Supplier Filter</Label>
                <Select 
                  value={supplierFilter} 
                  onValueChange={(value: string) => {
                    setSupplierFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Suppliers</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("All");
                    setStatusFilter("All");
                    setSupplierFilter("All");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            Showing {paginatedInventory.length} of {filteredInventory.length} medications
          </div>

          {/* Inventory Items */}
          <div className="space-y-4">
            {paginatedInventory.length > 0 ? (
              paginatedInventory.map((medication) => {
                const nextExpiryBatch = medication.batches
                  .filter(batch => batch.remainingTablets > 0)
                  .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
                const daysUntilExpiry = nextExpiryBatch ? getDaysUntilExpiry(nextExpiryBatch.expiryDate) : null;
                
                return (
                  <Card key={medication.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <span>{medication.name}</span>
                            {medication.genericName && (
                              <span className="text-sm text-muted-foreground font-normal">
                                ({medication.genericName})
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground font-normal">
                              {medication.strength}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-sm">
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span><strong>Category:</strong> {medication.category}</span>
                              <span><strong>Form:</strong> {medication.dosageForm}</span>
                              <span><strong>Manufacturer:</strong> {medication.manufacturer}</span>
                              <span><strong>Supplier:</strong> {medication.supplier}</span>
                              <span><strong>Location:</strong> {medication.location}</span>
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge className={getCategoryColor(medication.category)} variant="outline">
                            {medication.category}
                          </Badge>
                          <Badge className={getStatusColor(medication.status)} variant="outline">
                            {medication.status}
                          </Badge>
                          {medication.isGeneric && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                              Generic
                            </Badge>
                          )}
                          {medication.prescriptionRequired && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200" variant="outline">
                              Rx Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-foreground">Current Stock:</strong>
                          <div className={`font-bold ${
                            medication.currentStock === 0 ? 'text-red-600' :
                            medication.currentStock <= medication.minimumStock ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {medication.currentStock} tablets
                          </div>
                        </div>
                        <div>
                          <strong className="text-foreground">Min/Max Stock:</strong>
                          <div>{medication.minimumStock} / {medication.maximumStock}</div>
                        </div>
                        <div>
                          <strong className="text-foreground">Next Expiry:</strong>
                          <div className={daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-orange-600 font-medium' : ''}>
                            {nextExpiryBatch ? formatDate(nextExpiryBatch.expiryDate) : 'N/A'}
                            {daysUntilExpiry && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                              <span className="text-xs block">({daysUntilExpiry} days)</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <strong className="text-foreground">Monthly Usage:</strong>
                          <div>{medication.monthlyUsage} tablets</div>
                        </div>
                        <div>
                          <strong className="text-foreground">Batches:</strong>
                          <div>{medication.batches.length} total</div>
                        </div>
                        <div>
                          <strong className="text-foreground">Last Restocked:</strong>
                          <div>{formatDate(medication.lastRestocked)}</div>
                        </div>
                      </div>

                      {medication.notes && (
                        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded mb-4">
                          <strong>Notes:</strong> {medication.notes}
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2 flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setRestockData({
                              packSize: medication.packSize,
                              packsReceived: 0,
                              batchNumber: "",
                              expiryDate: "",
                              supplier: medication.supplier
                            });
                            setShowRestockModal(medication.id);
                          }}
                          className="hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Restock
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowDispenseModal(medication.id)}
                          className="hover:bg-blue-50"
                          disabled={medication.currentStock === 0}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Dispense
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowAdjustModal(medication.id)}
                          className="hover:bg-blue-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50"
                          onClick={() => setShowDetailsModal(medication.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-green-50"
                          onClick={() => {
                            setEditData(medication);
                            setShowEditModal(medication.id);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground">
                    <Search className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-medium mb-1">No medications found</p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RestockModal />
      <DispenseModal />
      <BatchModal />
      <AdjustStockModal />
      <DetailsModal />
      <EditModal />
      <AddMedicationModal />
    </div>
  );
}