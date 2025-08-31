"use client";

// Imports for React hooks and UI components from Shadcn/UI and Lucide icons
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Minus, AlertTriangle, Package, RefreshCw, Eye, Edit, Download, Filter, Calendar, CheckCircle, XCircle, Clock, ShoppingCart, Pill, Heart, Activity, Droplet, Shield, Layers, FileDown } from "lucide-react";

// Type definitions for the pharmacy inventory system
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
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  batches: MedicationBatch[];
  packSize: number;
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
  batchesAffected?: Array<{ batchId: string; quantity: number }>;
}

interface CategorySummary {
  category: MedicationCategory;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  nearExpiryItems: number;
}

// Mock data for inventory
const mockInventory: Medication[] = [
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
        notes: "Use first - expires soonest",
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
        status: "Active",
      },
    ],
    lastRestocked: "2024-08-20",
    lastDispensed: "2025-08-15",
    monthlyUsage: 45,
    status: "In Stock",
    location: "A1-B2",
    barcode: "123456789001",
    prescriptionRequired: true,
    isGeneric: true,
    notes: "Popular antibiotic for bacterial infections",
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
        status: "Active",
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
        status: "Active",
      },
    ],
    lastRestocked: "2024-08-10",
    lastDispensed: "2025-08-15",
    monthlyUsage: 150,
    status: "In Stock",
    location: "B2-C1",
    barcode: "123456789004",
    prescriptionRequired: false,
    isGeneric: true,
    notes: "Over-the-counter pain reliever",
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
        status: "Active",
      },
    ],
    lastRestocked: "2024-07-01",
    monthlyUsage: 60,
    status: "Low Stock",
    location: "C1-D2",
    barcode: "123456789005",
    prescriptionRequired: true,
    isGeneric: true,
    notes: "ACE inhibitor for hypertension",
  },
];

// Mock data for transactions
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
    batchesAffected: [{ batchId: "BATCH001", quantity: -28 }],
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
    batchesAffected: [{ batchId: "BATCH003", quantity: -30 }],
  },
];

// Utility functions for date formatting and status calculation
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Utility function for badge color based on stock status
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

const getDaysUntilExpiry = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
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
  const hasExpiredBatch = medication.batches.some(
    (batch) => getDaysUntilExpiry(batch.expiryDate) < 0 && batch.remainingTablets > 0
  );
  const hasNearExpiryBatch = medication.batches.some(
    (batch) =>
      getDaysUntilExpiry(batch.expiryDate) <= 30 &&
      getDaysUntilExpiry(batch.expiryDate) >= 0 &&
      batch.remainingTablets > 0
  );

  if (hasExpiredBatch) return "Expired";
  if (medication.currentStock === 0) return "Out of Stock";
  if (hasNearExpiryBatch) return "Near Expiry";
  if (medication.currentStock <= medication.minimumStock) return "Low Stock";
  return "In Stock";
};

const initializeInventory = (inventoryData: Medication[]): Medication[] =>
  inventoryData.map((med) => ({
    ...med,
    status: getStockStatus(med),
    batches: med.batches.map((batch) => ({
      ...batch,
      status: getBatchStatus(batch),
    })),
  }));

// Modal Components (defined as top-level to prevent remounting and flickering)

// RestockModal: Handles adding a new batch to a medication
interface RestockModalProps {
  showRestockModal: string | null;
  setShowRestockModal: (id: string | null) => void;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
  setTransactions: (transactions: (prev: StockTransaction[]) => StockTransaction[]) => void;
  restockData: { packSize: number; packsReceived: number; batchNumber: string; expiryDate: string; supplier: string };
  setRestockData: (data: { packSize: number; packsReceived: number; batchNumber: string; expiryDate: string; supplier: string }) => void;
}

const RestockModal = ({
  showRestockModal,
  setShowRestockModal,
  inventory,
  setInventory,
  setTransactions,
  restockData,
  setRestockData,
}: RestockModalProps) => {
  if (!showRestockModal) return null;

  const medication = inventory.find((med) => med.id === showRestockModal);
  if (!medication) return null;

  const handleRestock = () => {
    const { packSize, packsReceived, batchNumber, expiryDate, supplier } = restockData;

    if (!packsReceived || packsReceived <= 0 || !batchNumber || !expiryDate) {
      alert("Please fill in all required fields (Packs Received, Batch Number, Expiry Date)");
      return;
    }

    const totalTablets = packSize * packsReceived;
    const newBatch: MedicationBatch = {
      id: `BATCH${Date.now()}`,
      batchNumber,
      expiryDate,
      totalTablets,
      remainingTablets: totalTablets,
      dateReceived: new Date().toISOString().split("T")[0],
      packSize,
      packsReceived,
      openedPacks: 0,
      sealedPacks: packsReceived,
      supplier: supplier || medication.supplier,
      status: getBatchStatus({ expiryDate } as MedicationBatch),
    };

    const newStock = medication.currentStock + totalTablets;
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      medicationId: showRestockModal,
      medicationName: `${medication.name} ${medication.strength}`,
      type: "Restocked",
      quantity: totalTablets,
      previousStock: medication.currentStock,
      newStock,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      performedBy: "Current User",
      reason: `Added new batch: ${batchNumber}`,
      batchNumber,
    };

    setInventory(
      inventory.map((med) =>
        med.id === showRestockModal
          ? {
              ...med,
              currentStock: newStock,
              lastRestocked: new Date().toISOString().split("T")[0],
              batches: [...med.batches, newBatch],
              status: getStockStatus({
                ...med,
                currentStock: newStock,
                batches: [...med.batches, newBatch],
              }),
            }
          : med
      )
    );

    setTransactions((prev) => [newTransaction, ...prev]);
    setShowRestockModal(null);
    setRestockData({
      packSize: medication.packSize,
      packsReceived: 0,
      batchNumber: "",
      expiryDate: "",
      supplier: medication.supplier,
    });
  };

  return (
    <Dialog open={!!showRestockModal} onOpenChange={() => setShowRestockModal(null)}>
      <DialogContent className="max-w-md">
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
              <Label htmlFor="pack-size">Tablets per Pack *</Label>
              <Input
                id="pack-size"
                type="number"
                value={restockData.packSize}
                onChange={(e) =>
                  setRestockData({ ...restockData, packSize: Math.max(1, parseInt(e.target.value) || 1) })
                }
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="packs-received">Packs Received *</Label>
              <Input
                id="packs-received"
                type="number"
                value={restockData.packsReceived || ""}
                onChange={(e) =>
                  setRestockData({ ...restockData, packsReceived: Math.max(0, parseInt(e.target.value) || 0) })
                }
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="batch-number">Batch Number *</Label>
            <Input
              id="batch-number"
              value={restockData.batchNumber}
              onChange={(e) => setRestockData({ ...restockData, batchNumber: e.target.value })}
              placeholder="e.g., AMX2024003"
              required
            />
          </div>

          <div>
            <Label htmlFor="expiry-date">Expiry Date *</Label>
            <Input
              id="expiry-date"
              type="date"
              value={restockData.expiryDate}
              onChange={(e) => setRestockData({ ...restockData, expiryDate: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="batch-supplier">Supplier</Label>
            <Input
              id="batch-supplier"
              value={restockData.supplier || medication.supplier}
              onChange={(e) => setRestockData({ ...restockData, supplier: e.target.value })}
            />
          </div>

          {restockData.packSize && restockData.packsReceived ? (
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm">
                <strong>Total Tablets:</strong> {restockData.packSize * restockData.packsReceived}
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={handleRestock}>
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

// DispenseModal: Handles dispensing medication using FIFO (First In, First Out)
interface DispenseModalProps {
  showDispenseModal: string | null;
  setShowDispenseModal: (id: string | null) => void;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
  setTransactions: (transactions: (prev: StockTransaction[]) => StockTransaction[]) => void;
  dispenseData: { quantity: number; patientId: string; prescriptionId: string };
  setDispenseData: (data: { quantity: number; patientId: string; prescriptionId: string }) => void;
}

const DispenseModal = ({
  showDispenseModal,
  setShowDispenseModal,
  inventory,
  setInventory,
  setTransactions,
  dispenseData,
  setDispenseData,
}: DispenseModalProps) => {
  if (!showDispenseModal) return null;

  const medication = inventory.find((med) => med.id === showDispenseModal);
  if (!medication) return null;

  const sortedBatches = medication.batches
    .filter((batch) => batch.remainingTablets > 0)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // Local dispenseFromFIFO function (encapsulated here as it's only used in DispenseModal)
  const dispenseFromFIFO = (
    medicationId: string,
    quantityToDispense: number,
    patientId?: string,
    prescriptionId?: string
  ) => {
    const medication = inventory.find((med) => med.id === medicationId);
    if (!medication || medication.currentStock < quantityToDispense) {
      alert("Insufficient stock available!");
      return false;
    }

    const availableBatches = medication.batches
      .filter((batch) => batch.remainingTablets > 0 && batch.status !== "Expired")
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let remainingToDispense = quantityToDispense;
    const batchesAffected: Array<{ batchId: string; quantity: number }> = [];

    const updatedBatches = medication.batches.map((batch) => {
      if (remainingToDispense <= 0) return batch;

      const batchInAvailable = availableBatches.find((ab) => ab.id === batch.id);
      if (!batchInAvailable) return batch;

      const canDispenseFromBatch = Math.min(batch.remainingTablets, remainingToDispense);
      if (canDispenseFromBatch > 0) {
        remainingToDispense -= canDispenseFromBatch;
        batchesAffected.push({
          batchId: batch.id,
          quantity: -canDispenseFromBatch,
        });

        const newRemainingTablets = batch.remainingTablets - canDispenseFromBatch;
        const tabletsPerPack = batch.packSize;
        const newOpenedPacks = Math.ceil(
          (batch.totalTablets - newRemainingTablets) / tabletsPerPack
        ) - Math.floor((batch.totalTablets - batch.remainingTablets) / tabletsPerPack);

        return {
          ...batch,
          remainingTablets: newRemainingTablets,
          openedPacks: batch.openedPacks + newOpenedPacks,
          sealedPacks: Math.max(0, batch.sealedPacks - newOpenedPacks),
          status: getBatchStatus({ ...batch, remainingTablets: newRemainingTablets }),
        };
      }
      return batch;
    });

    if (remainingToDispense > 0) {
      alert(`Could only dispense ${quantityToDispense - remainingToDispense} tablets. Insufficient stock.`);
      return false;
    }

    const newStock = medication.currentStock - quantityToDispense;
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      medicationId,
      medicationName: `${medication.name} ${medication.strength}`,
      type: "Dispensed",
      quantity: -quantityToDispense,
      previousStock: medication.currentStock,
      newStock,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      performedBy: "Current User",
      patientId,
      prescriptionId,
      batchesAffected,
    };

    setInventory(
      inventory.map((med) =>
        med.id === medicationId
          ? {
              ...med,
              currentStock: newStock,
              lastDispensed: new Date().toISOString().split("T")[0],
              batches: updatedBatches,
              status: getStockStatus({
                ...med,
                currentStock: newStock,
                batches: updatedBatches,
              }),
            }
          : med
      )
    );

    setTransactions((prev) => [newTransaction, ...prev]);
    return true;
  };

  const handleDispense = () => {
    const { quantity, patientId, prescriptionId } = dispenseData;

    if (!quantity || quantity <= 0 || !medication || quantity > medication.currentStock) {
      alert("Please enter a valid quantity within available stock");
      return;
    }

    const success = dispenseFromFIFO(showDispenseModal, quantity, patientId, prescriptionId);
    if (success) {
      setShowDispenseModal(null);
      setDispenseData({ quantity: 0, patientId: "", prescriptionId: "" });
      alert(`Successfully dispensed ${quantity} tablets using FIFO system`);
    }
  };

  return (
    <Dialog open={!!showDispenseModal} onOpenChange={() => setShowDispenseModal(null)}>
      <DialogContent className="max-w-lg">
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
              <Label htmlFor="dispense-quantity">Quantity to Dispense (tablets) *</Label>
              <Input
                id="dispense-quantity"
                type="number"
                value={dispenseData.quantity || ""}
                onChange={(e) =>
                  setDispenseData({
                    ...dispenseData,
                    quantity: Math.min(
                      Math.max(1, parseInt(e.target.value) || 0),
                      medication.currentStock
                    ),
                  })
                }
                min="1"
                max={medication.currentStock}
                required
              />
            </div>
            <div>
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                value={dispenseData.patientId}
                onChange={(e) => setDispenseData({ ...dispenseData, patientId: e.target.value })}
                placeholder="e.g., PAT001"
              />
            </div>
            <div>
              <Label htmlFor="prescription-id">Prescription ID</Label>
              <Input
                id="prescription-id"
                value={dispenseData.prescriptionId}
                onChange={(e) => setDispenseData({ ...dispenseData, prescriptionId: e.target.value })}
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
          <Button onClick={handleDispense}>
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

// BatchModal: Displays batch details for a selected medication
interface BatchModalProps {
  showBatchModal: string | null;
  setShowBatchModal: (id: string | null) => void;
  inventory: Medication[];
}

const BatchModal = ({ showBatchModal, setShowBatchModal, inventory }: BatchModalProps) => {
  if (!showBatchModal) return null;

  const medication = inventory.find((med) => med.id === showBatchModal);
  if (!medication) return null;

  const sortedBatches = medication.batches.sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <Dialog open={!!showBatchModal} onOpenChange={() => setShowBatchModal(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                {sortedBatches.filter((b) => b.status === "Active" && b.remainingTablets > 0).length}
              </div>
              <div className="text-sm text-gray-600">Active Batches</div>
            </div>
          </div>

          <div className="space-y-3">
            {sortedBatches.map((batch, index) => {
              const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
              const isFirst = index === 0 && batch.remainingTablets > 0;

                function getBatchStatusColor(status: string): string {
                switch (status) {
                  case "Active":
                  return "bg-green-100 text-green-800 border-green-200";
                  case "Near Expiry":
                  return "bg-orange-100 text-orange-800 border-orange-200";
                  case "Expired":
                  return "bg-red-100 text-red-800 border-red-200";
                  case "Recalled":
                  return "bg-purple-100 text-purple-800 border-purple-200";
                  default:
                  return "bg-gray-100 text-gray-800 border-gray-200";
                }
                }
                
              return (
                <div
                  key={batch.id}
                  className={`border rounded-lg p-4 ${isFirst ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
                >
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
                      <div className={daysUntilExpiry <= 30 ? "text-orange-600 font-medium" : "text-gray-500"}>
                        {formatDate(batch.expiryDate)}
                      </div>
                      <div className="text-gray-500">
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : "EXPIRED"}
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

// AdjustStockModal: Handles manual stock adjustments
interface AdjustStockModalProps {
  showAdjustModal: string | null;
  setShowAdjustModal: (id: string | null) => void;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
  setTransactions: (transactions: (prev: StockTransaction[]) => StockTransaction[]) => void;
  adjustQuantity: string;
  setAdjustQuantity: (quantity: string) => void;
  adjustReason: string;
  setAdjustReason: (reason: string) => void;
}

const AdjustStockModal = ({
  showAdjustModal,
  setShowAdjustModal,
  inventory,
  setInventory,
  setTransactions,
  adjustQuantity,
  setAdjustQuantity,
  adjustReason,
  setAdjustReason,
}: AdjustStockModalProps) => {
  if (!showAdjustModal) return null;

  const medication = inventory.find((med) => med.id === showAdjustModal);
  if (!medication) return null;

  const handleStockAdjustment = () => {
    const quantity = parseInt(adjustQuantity);
    if (isNaN(quantity) || quantity === 0 || !adjustReason) {
      alert("Please enter a valid non-zero quantity and reason");
      return;
    }

    const newStock = Math.max(0, medication.currentStock + quantity);
    const newTransaction: StockTransaction = {
      id: `TXN${Date.now()}`,
      medicationId: showAdjustModal,
      medicationName: `${medication.name} ${medication.strength}`,
      type: "Adjusted",
      quantity,
      previousStock: medication.currentStock,
      newStock,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      performedBy: "Current User",
      reason: adjustReason,
    };

    setInventory(
      inventory.map((med) =>
        med.id === showAdjustModal
          ? {
              ...med,
              currentStock: newStock,
              status: getStockStatus({ ...med, currentStock: newStock }),
            }
          : med
      )
    );

    setTransactions((prev) => [newTransaction, ...prev]);
    setShowAdjustModal(null);
    setAdjustQuantity("");
    setAdjustReason("");
  };

  return (
    <Dialog open={!!showAdjustModal} onOpenChange={() => setShowAdjustModal(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium">{medication.name} {medication.strength}</h4>
            <p className="text-sm text-gray-600">Current Stock: {medication.currentStock} tablets</p>
          </div>

          <div>
            <Label htmlFor="adjust-quantity">Adjustment Quantity (+ or -) *</Label>
            <Input
              id="adjust-quantity"
              type="number"
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(e.target.value)}
              placeholder="Enter quantity (use negative for reduction)"
              required
            />
          </div>

          <div>
            <Label htmlFor="adjust-reason">Reason for Adjustment *</Label>
            <Select value={adjustReason} onValueChange={setAdjustReason}>
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
          <Button onClick={handleStockAdjustment}>Adjust Stock</Button>
          <Button variant="outline" onClick={() => setShowAdjustModal(null)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// DetailsModal: Displays detailed information about a selected medication
interface DetailsModalProps {
  showDetailsModal: string | null;
  setShowDetailsModal: (id: string | null) => void;
  setShowEditModal: (id: string | null) => void;
  setEditData: (data: Partial<Medication>) => void;
  inventory: Medication[];
}

const DetailsModal = ({
  showDetailsModal,
  setShowDetailsModal,
  setShowEditModal,
  setEditData,
  inventory,
}: DetailsModalProps) => {
  if (!showDetailsModal) return null;

  const medication = inventory.find((med) => med.id === showDetailsModal);
  if (!medication) return null;

  function getCategoryColor(category: string): string {
    switch (category) {
      case "Antibiotics":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Analgesics":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Cardiovascular":
        return "bg-red-100 text-red-800 border-red-200";
      case "Diabetes":
        return "bg-green-100 text-green-800 border-green-200";
      case "Respiratory":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Vitamins":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Gastrointestinal":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "Dermatology":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "Neurology":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Other":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }
  
  return (
    <Dialog open={!!showDetailsModal} onOpenChange={() => setShowDetailsModal(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Medication Details - {medication.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {medication.name}</div>
                <div><strong>Generic Name:</strong> {medication.genericName || "N/A"}</div>
                <div><strong>Strength:</strong> {medication.strength}</div>
                <div><strong>Dosage Form:</strong> {medication.dosageForm}</div>
                <div><strong>Category:</strong> {medication.category}</div>
                <div><strong>Manufacturer:</strong> {medication.manufacturer}</div>
                <div><strong>Supplier:</strong> {medication.supplier}</div>
                <div><strong>Location:</strong> {medication.location}</div>
                <div><strong>Barcode:</strong> {medication.barcode || "N/A"}</div>
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
                <div><strong>Last Dispensed:</strong> {medication.lastDispensed ? formatDate(medication.lastDispensed) : "Never"}</div>
              </div>
            </div>
          </div>

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
              <Badge
                className={
                  medication.supplierStatus === "Active"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : medication.supplierStatus === "Inactive"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
                variant="outline"
              >
                Supplier: {medication.supplierStatus}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Batch Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-bold text-blue-600">{medication.batches.length}</div>
                <div>Total Batches</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="font-bold text-green-600">
                  {medication.batches.filter((b) => b.status === "Active").length}
                </div>
                <div>Active Batches</div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="font-bold text-orange-600">
                  {medication.batches.filter((b) => b.status === "Near Expiry").length}
                </div>
                <div>Near Expiry</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="font-bold text-red-600">
                  {medication.batches.filter((b) => b.status === "Expired").length}
                </div>
                <div>Expired</div>
              </div>
            </div>
          </div>

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
          <Button
            onClick={() => {
              setShowDetailsModal(null);
              setShowEditModal(medication.id);
              setEditData(medication);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// EditModal: Allows editing of medication details
interface EditModalProps {
  showEditModal: string | null;
  setShowEditModal: (id: string | null) => void;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
  editData: Partial<Medication>;
  setEditData: (data: Partial<Medication>) => void;
}

const EditModal = ({
  showEditModal,
  setShowEditModal,
  inventory,
  setInventory,
  editData,
  setEditData,
}: EditModalProps) => {
  if (!showEditModal) return null;

  const medication = inventory.find((med) => med.id === showEditModal);
  if (!medication) return null;

  const handleEditMedication = () => {
    if (!editData.name || !editData.strength) {
      alert("Please fill in required fields (Name and Strength)");
      return;
    }

    setInventory(
      inventory.map((med) =>
        med.id === showEditModal
          ? {
              ...med,
              ...editData,
              status: getStockStatus({ ...med, ...editData } as Medication),
            }
          : med
      )
    );

    setShowEditModal(null);
    setEditData({});
    alert("Medication updated successfully!");
  };

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
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-genericName">Generic Name</Label>
              <Input
                id="edit-genericName"
                value={editData.genericName || medication.genericName || ""}
                onChange={(e) => setEditData({ ...editData, genericName: e.target.value })}
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={editData.category || medication.category}
                onValueChange={(value: MedicationCategory) => setEditData({ ...editData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Antibiotics", "Analgesics", "Cardiovascular", "Diabetes", "Respiratory", "Vitamins", "Gastrointestinal", "Dermatology", "Neurology", "Other"].map((cat) => (
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
                onChange={(e) => setEditData({ ...editData, strength: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-dosageForm">Dosage Form *</Label>
              <Input
                id="edit-dosageForm"
                value={editData.dosageForm || medication.dosageForm}
                onChange={(e) => setEditData({ ...editData, dosageForm: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-manufacturer">Manufacturer</Label>
              <Input
                id="edit-manufacturer"
                value={editData.manufacturer || medication.manufacturer}
                onChange={(e) => setEditData({ ...editData, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                value={editData.supplier || medication.supplier}
                onChange={(e) => setEditData({ ...editData, supplier: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={editData.location || medication.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-minimumStock">Minimum Stock *</Label>
              <Input
                id="edit-minimumStock"
                type="number"
                value={editData.minimumStock || medication.minimumStock}
                onChange={(e) => setEditData({ ...editData, minimumStock: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-maximumStock">Maximum Stock</Label>
              <Input
                id="edit-maximumStock"
                type="number"
                value={editData.maximumStock || medication.maximumStock}
                onChange={(e) => setEditData({ ...editData, maximumStock: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit-monthlyUsage">Monthly Usage</Label>
              <Input
                id="edit-monthlyUsage"
                type="number"
                value={editData.monthlyUsage || medication.monthlyUsage}
                onChange={(e) => setEditData({ ...editData, monthlyUsage: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit-packSize">Pack Size *</Label>
              <Input
                id="edit-packSize"
                type="number"
                value={editData.packSize || medication.packSize}
                onChange={(e) => setEditData({ ...editData, packSize: Math.max(1, parseInt(e.target.value) || 1) })}
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-prescriptionRequired"
                checked={editData.prescriptionRequired !== undefined ? editData.prescriptionRequired : medication.prescriptionRequired}
                onCheckedChange={(checked) => setEditData({ ...editData, prescriptionRequired: !!checked })}
              />
              <Label htmlFor="edit-prescriptionRequired">Prescription Required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isGeneric"
                checked={editData.isGeneric !== undefined ? editData.isGeneric : medication.isGeneric}
                onCheckedChange={(checked) => setEditData({ ...editData, isGeneric: !!checked })}
              />
              <Label htmlFor="edit-isGeneric">Is Generic</Label>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editData.notes !== undefined ? editData.notes : medication.notes || ""}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEditMedication}>Save Changes</Button>
          <Button variant="outline" onClick={() => setShowEditModal(null)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// AddMedicationModal: Allows adding a new medication to the inventory
interface AddMedicationModalProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
  newMed: Partial<Medication>;
  setNewMed: (data: Partial<Medication>) => void;
}

const AddMedicationModal = ({
  showAddModal,
  setShowAddModal,
  inventory,
  setInventory,
  newMed,
  setNewMed,
}: AddMedicationModalProps) => {
  const handleAddMedication = () => {
    if (!newMed.name || !newMed.category || !newMed.strength || !newMed.dosageForm || !newMed.location) {
      alert("Please fill in all required fields (Name, Category, Strength, Dosage Form, Location)");
      return;
    }

    const newMedication: Medication = {
      id: `MED${Date.now()}`,
      ...newMed,
      status: getStockStatus({ ...newMed, batches: [] } as Medication),
      lastRestocked: new Date().toISOString().split("T")[0],
      monthlyUsage: newMed.monthlyUsage || 0,
      supplierStatus: newMed.supplierStatus || "Active",
      genericName: newMed.genericName || "",
      barcode: newMed.barcode || "",
      notes: newMed.notes || "",
      batches: [],
    } as Medication;

    setInventory([...inventory, newMedication]);
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
      batches: [],
    });
    alert("Medication added successfully!");
  };

  return (
    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="Medication name"
              required
            />
          </div>
          <div>
            <Label htmlFor="genericName">Generic Name</Label>
            <Input
              id="genericName"
              value={newMed.genericName}
              onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
              placeholder="Generic name"
            />
          </div>
          <div>
            <Label>Category *</Label>
            <Select
              value={newMed.category}
              onValueChange={(value: MedicationCategory) => setNewMed({ ...newMed, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {["Antibiotics", "Analgesics", "Cardiovascular", "Diabetes", "Respiratory", "Vitamins", "Gastrointestinal", "Dermatology", "Neurology", "Other"].map((cat) => (
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
              onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
              placeholder="e.g., 500mg"
              required
            />
          </div>
          <div>
            <Label htmlFor="dosageForm">Dosage Form *</Label>
            <Input
              id="dosageForm"
              value={newMed.dosageForm}
              onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
              placeholder="e.g., Tablet"
              required
            />
          </div>
          <div>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={newMed.manufacturer}
              onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
              placeholder="Manufacturer name"
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={newMed.supplier}
              onChange={(e) => setNewMed({ ...newMed, supplier: e.target.value })}
              placeholder="Supplier name"
            />
          </div>
          <div>
            <Label>Supplier Status</Label>
            <Select
              value={newMed.supplierStatus}
              onValueChange={(value: SupplierStatus) => setNewMed({ ...newMed, supplierStatus: value })}
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
              value={newMed.currentStock || ""}
              onChange={(e) => setNewMed({ ...newMed, currentStock: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Initial stock quantity"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="minimumStock">Minimum Stock *</Label>
            <Input
              id="minimumStock"
              type="number"
              value={newMed.minimumStock || ""}
              onChange={(e) => setNewMed({ ...newMed, minimumStock: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Minimum stock level"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="maximumStock">Maximum Stock</Label>
            <Input
              id="maximumStock"
              type="number"
              value={newMed.maximumStock || ""}
              onChange={(e) => setNewMed({ ...newMed, maximumStock: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Maximum stock level"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="monthlyUsage">Monthly Usage</Label>
            <Input
              id="monthlyUsage"
              type="number"
              value={newMed.monthlyUsage || ""}
              onChange={(e) => setNewMed({ ...newMed, monthlyUsage: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Estimated monthly usage"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={newMed.location}
              onChange={(e) => setNewMed({ ...newMed, location: e.target.value })}
              placeholder="Storage location"
              required
            />
          </div>
          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={newMed.barcode}
              onChange={(e) => setNewMed({ ...newMed, barcode: e.target.value })}
              placeholder="Barcode"
            />
          </div>
          <div>
            <Label htmlFor="packSize">Pack Size *</Label>
            <Input
              id="packSize"
              type="number"
              value={newMed.packSize || ""}
              onChange={(e) => setNewMed({ ...newMed, packSize: Math.max(1, parseInt(e.target.value) || 1) })}
              placeholder="Tablets per pack"
              min="1"
              required
            />
          </div>
        </div>
        <div className="space-y-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="prescriptionRequired"
              checked={newMed.prescriptionRequired}
              onCheckedChange={(checked) => setNewMed({ ...newMed, prescriptionRequired: !!checked })}
            />
            <Label htmlFor="prescriptionRequired">Prescription Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isGeneric"
              checked={newMed.isGeneric}
              onCheckedChange={(checked) => setNewMed({ ...newMed, isGeneric: !!checked })}
            />
            <Label htmlFor="isGeneric">Is Generic</Label>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newMed.notes}
              onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
              placeholder="Additional notes"
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={handleAddMedication}>Add Medication</Button>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component: EnhancedPharmacyInventorySystem
export default function EnhancedPharmacyInventorySystem() {
  // State management for inventory, transactions, filters, and modals
  const [inventory, setInventory] = useState<Medication[]>(initializeInventory(mockInventory));
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
  const [batchViewMode, setBatchViewMode] = useState<"grouped" | "flat">("grouped");

  const [restockData, setRestockData] = useState({
    packSize: 8,
    packsReceived: 0,
    batchNumber: "",
    expiryDate: "",
    supplier: "",
  });

  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const [dispenseData, setDispenseData] = useState({
    quantity: 0,
    patientId: "",
    prescriptionId: "",
  });

  const [editData, setEditData] = useState<Partial<Medication>>({});

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
    monthlyUsage: 0,
    location: "",
    barcode: "",
    prescriptionRequired: false,
    isGeneric: false,
    notes: "",
    batches: [],
  });

  const itemsPerPage = 10;

  // Placeholder for future data fetching
  useEffect(() => {
    // Minimal useEffect for future external data sync
  }, []);

  // Calculate category summaries for the categories view
  const getCategorySummaries = (): CategorySummary[] => {
    const categoryMap = filteredInventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          category: item.category,
          totalItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          expiredItems: 0,
          nearExpiryItems: 0,
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

  // Export inventory data as CSV or JSON
  const handleExport = (format: "csv" | "json") => {
    let content = "";
    let filename = "";
    let mimeType = "";

    if (format === "csv") {
      const headers = "Name,Category,Strength,Current Stock,Status,Expiry Date,Location\n";
      const rows = filteredInventory
        .map((med) =>
          `"${med.name}","${med.category}","${med.strength}",${med.currentStock},"${med.status}","${med.batches[0]?.expiryDate || "N/A"}","${med.location}"`
        )
        .join("\n");
      content = headers + rows;
      filename = "pharmacy_inventory.csv";
      mimeType = "text/csv";
    } else {
      content = JSON.stringify(filteredInventory, null, 2);
      filename = "pharmacy_inventory.json";
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Utility functions for styling
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
      Antibiotics: "bg-blue-100 text-blue-800 border-blue-200",
      Analgesics: "bg-purple-100 text-purple-800 border-purple-200",
      Cardiovascular: "bg-red-100 text-red-800 border-red-200",
      Diabetes: "bg-green-100 text-green-800 border-green-200",
      Respiratory: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Vitamins: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Gastrointestinal: "bg-pink-100 text-pink-800 border-pink-200",
      Dermatology: "bg-teal-100 text-teal-800 border-teal-200",
      Neurology: "bg-orange-100 text-orange-800 border-orange-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
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
    case "Vitamins": return Pill;
    case "Gastrointestinal": return Pill;
    case "Dermatology": return Pill;
    case "Neurology": return Activity;
    case "Other": return Pill;
    default: return Pill;
  }
};


  // Filter and paginate inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const suppliers = Array.from(new Set(inventory.map((item) => item.supplier)));
  const allCategories = [...new Set(inventory.map((item) => item.category))].sort();

  // Calculate statistics for dashboard cards
  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter((item) => item.status === "In Stock").length,
    lowStock: inventory.filter((item) => item.status === "Low Stock").length,
    outOfStock: inventory.filter((item) => item.status === "Out of Stock").length,
    nearExpiry: inventory.filter((item) => item.status === "Near Expiry").length,
    expired: inventory.filter((item) => item.status === "Expired").length,
    reorderNeeded: inventory.filter((item) => item.currentStock <= item.minimumStock).length,
    totalBatches: inventory.reduce((sum, med) => sum + med.batches.length, 0),
    activeBatches: inventory.reduce(
      (sum, med) => sum + med.batches.filter((b) => b.status === "Active").length,
      0
    ),
  };

  // Filtered transactions based on filters
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.medicationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter(transaction => {
        const med = inventory.find(m => m.id === transaction.medicationId);
        return med && med.category === categoryFilter;
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(transaction => {
        const med = inventory.find(m => m.id === transaction.medicationId);
        return med && med.status === statusFilter;
      });
    }

    if (supplierFilter !== "All") {
      filtered = filtered.filter(transaction => {
        const med = inventory.find(m => m.id === transaction.medicationId);
        return med && med.supplier === supplierFilter;
      });
    }

    return filtered;
  }, [transactions, searchTerm, categoryFilter, statusFilter, supplierFilter, inventory]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with title and export/add buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pharmacy Inventory</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex border-b">
        {[
          { id: "inventory", label: "Inventory", icon: Package },
          { id: "batches", label: "Batch View", icon: Layers },
          { id: "categories", label: "Categories", icon: Filter },
          { id: "transactions", label: "Transactions", icon: Clock },
        ].map((view) => {
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

       {/* Dashboard cards with key statistics */}
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
            <p className="text-xs text-muted-foreground">Below Minimum</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Depleted</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.nearExpiry}</div>
            <p className="text-xs text-muted-foreground">Within 30 Days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Past Expiry</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reorder Needed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reorderNeeded}</div>
            <p className="text-xs text-muted-foreground">Below Below Threshold</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalBatches}</div>
            <p className="text-xs text-muted-foreground">Active: {stats.activeBatches}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select
                value={categoryFilter}
                onValueChange={(value: MedicationCategory | "All") => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value: StockStatus | "All") => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Near Expiry">Near Expiry</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={supplierFilter}
                onValueChange={(value) => setSupplierFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Inventory View: Displays list of medications */}
        {selectedView === "inventory" && (
          <CardContent>
            <div className="space-y-4">
              {paginatedInventory.map((medication) => {
                const CategoryIcon = getCategoryIcon(medication.category);
                return (
                  <Card key={medication.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <CardTitle>{medication.name} {medication.strength}</CardTitle>
                          <CardDescription>{medication.dosageForm} • {medication.manufacturer}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(medication.status)} variant="outline">
                          {medication.status}
                        </Badge>
                        <Badge className={getCategoryColor(medication.category)} variant="outline">
                          {medication.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <strong>Stock:</strong> {medication.currentStock} tablets
                          {medication.currentStock <= medication.minimumStock && (
                            <span className="text-red-500 ml-1"> (Low)</span>
                          )}
                        </div>
                        <div>
                          <strong>Location:</strong> {medication.location}
                        </div>
                        <div>
                          <strong>Last Restocked:</strong> {formatDate(medication.lastRestocked)}
                        </div>
                        <div>
                          <strong>Batches:</strong> {medication.batches.length} (
                          {medication.batches.filter((b) => b.status === "Active").length} active)
                        </div>
                      </div>
                    </CardContent>
                    <div className="flex justify-end gap-2 p-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetailsModal(medication.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowRestockModal(medication.id);
                          setRestockData({
                            packSize: medication.packSize,
                            packsReceived: 0,
                            batchNumber: "",
                            expiryDate: "",
                            supplier: medication.supplier,
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Restock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDispenseModal(medication.id)}
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Dispense
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdjustModal(medication.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Adjust
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBatchModal(medication.id)}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Batches
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        )}

        {/* Batches View: Displays all batches, grouped or flat */}
        {selectedView === "batches" && (
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Batches</h3>
              <Select
                value={batchViewMode}
                onValueChange={(value: "grouped" | "flat") => setBatchViewMode(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grouped">Grouped by Medication</SelectItem>
                  <SelectItem value="flat">Flat List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {batchViewMode === "grouped" ? (
              filteredInventory.map((medication) => (
                <Card key={medication.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-gray-500" />
                        <CardTitle>{medication.name} {medication.strength}</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBatchModal(medication.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {medication.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="border-t pt-2 mt-2 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">Batch {batch.batchNumber}</div>
                          <div className="text-sm text-gray-600">
                            Expiry: {formatDate(batch.expiryDate)} • {batch.remainingTablets} tablets
                          </div>
                        </div>
                        <Badge className={getBatchStatusColor(batch.status)} variant="outline">
                          {batch.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="space-y-4">
                {filteredInventory.flatMap((medication) =>
                  medication.batches.map((batch) => (
                    <Card key={batch.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{medication.name} {medication.strength}</CardTitle>
                            <CardDescription>Batch {batch.batchNumber}</CardDescription>
                          </div>
                          <Badge className={getBatchStatusColor(batch.status)} variant="outline">
                            {batch.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Remaining:</strong> {batch.remainingTablets} tablets
                          </div>
                          <div>
                            <strong>Expiry:</strong> {formatDate(batch.expiryDate)}
                          </div>
                          <div>
                            <strong>Received:</strong> {formatDate(batch.dateReceived)}
                          </div>
                          <div>
                            <strong>Supplier:</strong> {batch.supplier}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        )}

        {/* Categories View: Displays summary by category */}
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

      {/* Transactions View: Displays transaction history */}
        {selectedView === "transactions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Stock Transactions</h2>
                    <div className="text-sm text-gray-600">
                      Showing latest {transactions.length} transactions
                    </div>
                  </div>
        
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
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
        
                  {filteredTransactions.length === 0 && (
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
      </Card>

      {/* Render all modals */}
      <RestockModal
        showRestockModal={showRestockModal}
        setShowRestockModal={setShowRestockModal}
        inventory={inventory}
        setInventory={setInventory}
        setTransactions={setTransactions}
        restockData={restockData}
        setRestockData={setRestockData}
      />
      <DispenseModal
        showDispenseModal={showDispenseModal}
        setShowDispenseModal={setShowDispenseModal}
        inventory={inventory}
        setInventory={setInventory}
        setTransactions={setTransactions}
        dispenseData={dispenseData}
        setDispenseData={setDispenseData}
      />
      <BatchModal
        showBatchModal={showBatchModal}
        setShowBatchModal={setShowBatchModal}
        inventory={inventory}
      />
      <AdjustStockModal
        showAdjustModal={showAdjustModal}
        setShowAdjustModal={setShowAdjustModal}
        inventory={inventory}
        setInventory={setInventory}
        setTransactions={setTransactions}
        adjustQuantity={adjustQuantity}
        setAdjustQuantity={setAdjustQuantity}
        adjustReason={adjustReason}
        setAdjustReason={setAdjustReason}
      />
      <DetailsModal
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        setShowEditModal={setShowEditModal}
        setEditData={setEditData}
        inventory={inventory}
      />
      <EditModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        inventory={inventory}
        setInventory={setInventory}
        editData={editData}
        setEditData={setEditData}
      />
      <AddMedicationModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        inventory={inventory}
        setInventory={setInventory}
        newMed={newMed}
        setNewMed={setNewMed}
      />
    </div>
  );
}