"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, Minus, AlertTriangle, Package, RefreshCw, Eye, Edit, Download, Filter, Calendar, CheckCircle, XCircle, Clock, ShoppingCart, Pill, Heart, Activity, Droplet, Shield, Layers, FileDown, BarChart3, ArrowUpDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type definitions (unchanged from previous version)
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
  lastRestocked: string | null;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Utility functions (unchanged from previous version)
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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
  const batches = medication.batches || [];
  const hasExpiredBatch = batches.some(
    (batch) => getDaysUntilExpiry(batch.expiryDate) < 0 && batch.remainingTablets > 0
  );
  const hasNearExpiryBatch = batches.some(
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

const getCategorySummaries = (medications: Medication[]): CategorySummary[] => {
  const categoryMap = medications.reduce((acc, item) => {
    if (!item || !item.category) return acc;
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
    const status = getStockStatus(item);
    if (status === "Low Stock") cat.lowStockItems++;
    if (status === "Out of Stock") cat.outOfStockItems++;
    if (status === "Expired") cat.expiredItems++;
    if (status === "Near Expiry") cat.nearExpiryItems++;
    return acc;
  }, {} as Record<MedicationCategory, CategorySummary>);

  return Object.values(categoryMap).sort((a, b) => a.category.localeCompare(b.category));
};

const getStatusColor = (status: StockStatus): string => {
  switch (status) {
    case "In Stock": return "bg-green-100 text-green-800 border-green-200";
    case "Low Stock": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Out of Stock": return "bg-red-100 text-red-800 border-red-200";
    case "Expired": return "bg-gray-100 text-gray-800 border-gray-200";
    case "Near Expiry": return "bg-orange-100 text-orange-800 border-orange-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getBatchStatusColor = (status: BatchStatus): string => {
  switch (status) {
    case "Active": return "bg-green-100 text-green-800 border-green-200";
    case "Near Expiry": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Expired": return "bg-red-100 text-red-800 border-red-200";
    case "Recalled": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getCategoryColor = (category: MedicationCategory): string => {
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

// Details Modal component
const DetailsModal = ({
  showDetailsModal,
  setShowDetailsModal,
  medication,
}: {
  showDetailsModal: string | null;
  setShowDetailsModal: (id: string | null) => void;
  medication: Medication | null;
}) => {
  if (!showDetailsModal || !medication) return null;

  return (
    <Dialog open={!!showDetailsModal} onOpenChange={() => setShowDetailsModal(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Medication Details - {medication.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            <h3 className="font-semibold text-lg">Status & Properties</h3>
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
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg">Batch Summary</h3>
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
              <h3 className="font-semibold text-lg">Notes</h3>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Restock Modal component (FIXED)
const RestockModal = ({
  showRestockModal,
  setShowRestockModal,
  medication,
  inventory,
  setInventory,
}: {
  showRestockModal: string | null;
  setShowRestockModal: (id: string | null) => void;
  medication: Medication | null;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
}) => {
  if (!showRestockModal || !medication) return null;

  const [packSize, setPackSize] = useState(medication.packSize);
  const [packsReceived, setPacksReceived] = useState(1);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplier, setSupplier] = useState(medication.supplier);

  const handleRestock = async () => {
    if (!packsReceived || packsReceived <= 0 || !batchNumber || !expiryDate) {
      alert("Please fill in all required fields (Packs Received, Batch Number, Expiry Date)");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/medications/${medication.id}/add_batch/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          batch_number: batchNumber,
          expiry_date: expiryDate,
          pack_size: packSize,
          packs_received: packsReceived,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setInventory(
          inventory.map(med =>
            med.id === showRestockModal
              ? { ...med, currentStock: result.new_stock }
              : med
          )
        );
        setShowRestockModal(null);
        alert(`Successfully added ${packSize * packsReceived} tablets to stock!`);
      } else {
        const errorData = await response.json();
        alert(`Error adding batch: ${errorData.error || errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding batch:", error);
      alert("Failed to add batch. Please try again.");
    }
  };

  return (
    <Dialog open={!!showRestockModal} onOpenChange={() => setShowRestockModal(null)}>
      <DialogContent>
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
                value={packSize}
                onChange={(e) => setPackSize(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="packs-received">Packs Received *</Label>
              <Input
                id="packs-received"
                type="number"
                value={packsReceived || ""}
                onChange={(e) => setPacksReceived(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="batch-number">Batch Number *</Label>
            <Input
              id="batch-number"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g., AMX2024003"
              required
            />
          </div>

          <div>
            <Label htmlFor="expiry-date">Expiry Date *</Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="batch-supplier">Supplier</Label>
            <Input
              id="batch-supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          {packSize && packsReceived ? (
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm">
                <strong>Total Tablets:</strong> {packSize * packsReceived}
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

// Adjust Stock Modal component
const AdjustStockModal = ({
  showAdjustModal,
  setShowAdjustModal,
  medication,
  inventory,
  setInventory,
}: {
  showAdjustModal: string | null;
  setShowAdjustModal: (id: string | null) => void;
  medication: Medication | null;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
}) => {
  if (!showAdjustModal || !medication) return null;

  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const handleStockAdjustment = async () => {
    const quantity = parseInt(adjustQuantity);
    if (isNaN(quantity) || quantity === 0 || !adjustReason) {
      alert("Please enter a valid non-zero quantity and reason");
      return;
    }

    const newStock = Math.max(0, medication.currentStock + quantity);

    try {
      const response = await fetch(`${API_URL}/api/medications/${medication.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentStock: newStock }),
      });

      if (response.ok) {
        setInventory(
          inventory.map(med =>
            med.id === showAdjustModal
              ? { ...med, currentStock: newStock }
              : med
          )
        );
        setShowAdjustModal(null);
        setAdjustQuantity("");
        setAdjustReason("");
        alert(`Stock adjusted by ${quantity} tablets!`);
      } else {
        const errorData = await response.json();
        alert(`Error adjusting stock: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Failed to adjust stock. Please try again.");
    }
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

// Batch Modal component
const BatchModal = ({
  showBatchModal,
  setShowBatchModal,
  medication,
}: {
  showBatchModal: string | null;
  setShowBatchModal: (id: string | null) => void;
  medication: Medication | null;
}) => {
  if (!showBatchModal || !medication) return null;

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
              <div className="text-lg font-bold text-green-600">{medication.batches.length}</div>
              <div className="text-sm text-gray-600">Total Batches</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-lg font-bold text-orange-600">
                {medication.batches.filter((b) => b.status === "Active" && b.remainingTablets > 0).length}
              </div>
              <div className="text-sm text-gray-600">Active Batches</div>
            </div>
          </div>

          <div className="space-y-3">
            {sortedBatches.map((batch, index) => {
              const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
              const isFirst = index === 0 && batch.remainingTablets > 0;

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

// AddMedicationModal component
const AddMedicationModal = ({
  showAddModal,
  setShowAddModal,
  inventory,
  setInventory,
  newMed,
  setNewMed,
}: {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  inventory: Medication[];
  setInventory: (inventory: Medication[]) => void;
  newMed: Partial<Medication>;
  setNewMed: (data: Partial<Medication>) => void;
}) => {
  const handleAddMedication = async () => {
    // Validate required fields
    if (
      !newMed.name ||
      !newMed.category ||
      !newMed.strength ||
      !newMed.dosageForm ||
      !newMed.manufacturer ||
      !newMed.supplier ||
      !newMed.location
    ) {
      alert(
        "Please fill in all required fields: Name, Category, Strength, Dosage Form, Manufacturer, Supplier, Location"
      );
      return;
    }

    // Map frontend field names to backend field names
    const payload = {
      name: newMed.name,
      generic_name: newMed.genericName || "",
      category: newMed.category,
      strength: newMed.strength,
      dosage_form: newMed.dosageForm, // Match backend field name
      manufacturer: newMed.manufacturer,
      supplier: newMed.supplier,
      location: newMed.location,
      pack_size: newMed.packSize || 1,
      current_stock: newMed.currentStock || 0,
      minimum_stock: newMed.minimumStock || 0,
      maximum_stock: newMed.maximumStock || 0,
      monthly_usage: newMed.monthlyUsage || 0,
      barcode: newMed.barcode || "",
      prescription_required: newMed.prescriptionRequired || false,
      is_generic: newMed.isGeneric || false,
      notes: newMed.notes || "",
      supplier_status: newMed.supplierStatus || "Active",
      batches: [],
    };

    console.log("Payload:", JSON.stringify(payload, null, 2)); // Log payload for debugging

    try {
      const response = await fetch(`${API_URL}/api/medications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const addedMedication = await response.json();
        setInventory([...inventory, addedMedication]);
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
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Log error response
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field.replace('_', ' ')}: ${(errors as string[]).join(", ")}`)
            .join("\n");
          alert(`Error adding medication:\n${errorMessages}`);
        } else {
          alert(`Error adding medication: ${errorData.detail || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Error adding medication:", error);
      alert("Failed to add medication. Please check your network and try again.");
    }
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
                {[
                  "Antibiotics",
                  "Analgesics",
                  "Cardiovascular",
                  "Diabetes",
                  "Respiratory",
                  "Vitamins",
                  "Gastrointestinal",
                  "Dermatology",
                  "Neurology",
                  "Other",
                ].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
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
            <Select
              value={newMed.dosageForm}
              onValueChange={(value) => setNewMed({ ...newMed, dosageForm: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dosage form" />
              </SelectTrigger>
              <SelectContent>
                {["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Inhaler"].map(
                  (form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="manufacturer">Manufacturer *</Label>
            <Input
              id="manufacturer"
              value={newMed.manufacturer}
              onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
              placeholder="Manufacturer name"
              required
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier *</Label>
            <Input
              id="supplier"
              value={newMed.supplier}
              onChange={(e) => setNewMed({ ...newMed, supplier: e.target.value })}
              placeholder="Supplier name"
              required
            />
          </div>
          <div>
            <Label htmlFor="currentStock">Initial Stock</Label>
            <Input
              id="currentStock"
              type="number"
              value={newMed.currentStock || ""}
              onChange={(e) =>
                setNewMed({ ...newMed, currentStock: Math.max(0, parseInt(e.target.value) || 0) })
              }
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
              onChange={(e) =>
                setNewMed({ ...newMed, minimumStock: Math.max(0, parseInt(e.target.value) || 0) })
              }
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
              onChange={(e) =>
                setNewMed({ ...newMed, maximumStock: Math.max(0, parseInt(e.target.value) || 0) })
              }
              placeholder="Maximum stock level"
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
            <Label htmlFor="packSize">Pack Size *</Label>
            <Input
              id="packSize"
              type="number"
              value={newMed.packSize || ""}
              onChange={(e) =>
                setNewMed({ ...newMed, packSize: Math.max(1, parseInt(e.target.value) || 1) })
              }
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
              onCheckedChange={(checked) =>
                setNewMed({ ...newMed, prescriptionRequired: !!checked })
              }
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

const TransactionModal = ({
  showTransactionModal,
  setShowTransactionModal,
  medication,
  transactions,
}: {
  showTransactionModal: string | null;
  setShowTransactionModal: (id: string | null) => void;
  medication: Medication | null;
  transactions: StockTransaction[];
}) => {
  if (!showTransactionModal || !medication) return null;

  const medicationTransactions = transactions.filter((tx) => tx.medicationId === medication.id);
  console.log(`Transactions for ${medication.name} (${medication.id}):`, medicationTransactions);

  return (
    <Dialog open={!!showTransactionModal} onOpenChange={() => setShowTransactionModal(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock Transactions - {medication.name} {medication.strength}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-lg font-bold text-blue-600">{medicationTransactions.length}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg font-bold text-green-600">
                {medicationTransactions.filter((tx) => tx.type === "Restocked").length}
              </div>
              <div className="text-sm text-gray-600">Restocks</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-lg font-bold text-red-600">
                {medicationTransactions.filter((tx) => tx.type === "Dispensed").length}
              </div>
              <div className="text-sm text-gray-600">Dispensed</div>
            </div>
          </div>

          <div className="space-y-3">
            {medicationTransactions.length === 0 ? (
              <div className="text-center text-gray-500">No transactions found for this medication.</div>
            ) : (
              medicationTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "Dispensed"
                              ? "bg-red-100"
                              : transaction.type === "Restocked"
                              ? "bg-green-100"
                              : transaction.type === "Adjusted"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {transaction.type === "Dispensed" && <Minus className="h-4 w-4 text-red-600" />}
                          {transaction.type === "Restocked" && <Plus className="h-4 w-4 text-green-600" />}
                          {transaction.type === "Adjusted" && <RefreshCw className="h-4 w-4 text-blue-600" />}
                          {transaction.type === "Expired" && <XCircle className="h-4 w-4 text-gray-600" />}
                          {transaction.type === "Returned" && <Package className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.type}</div>
                          <div className="text-sm text-gray-600">
                            By {transaction.performedBy} on {formatDate(transaction.date)} at {transaction.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-lg ${
                            transaction.quantity < 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
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
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTransactionModal(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function EnhancedPharmacyInventorySystem() {
  const [inventory, setInventory] = useState<Medication[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState<string | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState<string | null>(null);
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [reportType, setReportType] = useState("daily");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const itemsPerPage = 10;
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
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [inventoryResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_URL}/api/medications/`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`${API_URL}/api/stock-transactions/`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        console.log("Fetched inventory:", inventoryData);
        const transformedInventory = (inventoryData.results || inventoryData).map((item: any) => ({
          ...item,
          currentStock: item.current_stock || 0,
          batches: item.batches
            ? item.batches.map((batch: any) => ({
                ...batch,
                status: getBatchStatus(batch),
              }))
            : [],
          status: getStockStatus({
            ...item,
            currentStock: item.current_stock || 0,
            batches: item.batches
              ? item.batches.map((batch: any) => ({
                  ...batch,
                  status: getBatchStatus(batch),
                }))
              : [],
          }),
        }));
        setInventory(transformedInventory);
      } else {
        console.error("Inventory fetch failed:", await inventoryResponse.json());
        toast({
          title: "Error",
          description: "Failed to fetch inventory. Please try again.",
          variant: "destructive",
        });
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        console.log("Fetched transactions:", transactionsData);
        const transformedTransactions = (transactionsData.results || transactionsData)
          .map((tx: any) => ({
            ...tx,
            medicationId: tx.medication_id || tx.medication || "",
            medicationName: tx.medication_name || tx.medicationName || "",
            id: tx.id || "",
            performedBy: tx.performed_by || tx.performedBy || "Unknown",
            previousStock: tx.previous_stock || 0,
            newStock: tx.new_stock || 0,
            date: tx.date || new Date().toISOString().split("T")[0],
            time: tx.time || new Date().toLocaleTimeString(),
          }))
          .filter((tx: StockTransaction) => {
            if (!tx.id || !tx.medicationId) {
              console.warn("Invalid transaction:", tx);
              return false;
            }
            return true;
          });
        console.log("Transformed transactions:", transformedTransactions);
        setTransactions(transformedTransactions);
      } else {
        console.error("Transactions fetch failed:", await transactionsResponse.json());
        toast({
          title: "Error",
          description: "Failed to fetch transactions. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [toast]);

  // Handle dispensing medication
  const handleDispense = async (medicationId: string, quantity: number) => {
    const medication = inventory.find((m) => m.id === medicationId);
    if (!medication) {
      toast({
        title: "Error",
        description: "Medication not found.",
        variant: "destructive",
      });
      return;
    }

    if (medication.currentStock < quantity) {
      toast({
        title: "Error",
        description: "Insufficient stock to dispense.",
        variant: "destructive",
      });
      return;
    }

    const previousStock = medication.currentStock;
    const newStock = Math.max(0, previousStock - quantity);
    const transactionPayload = {
      medication: medicationId,
      medication_name: medication.name, // Match backend field
      type: "Dispensed",
      quantity: -quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
      performed_by: "Current User", // Replace with actual user if authenticated
      reason: "Dispensed from inventory page",
    };

    try {
      console.log("Dispense transaction payload:", transactionPayload);

      // Update medication stock
      const updateResponse = await fetch(`${API_URL}/api/medications/${medicationId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ current_stock: newStock }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("Stock update failed:", errorData);
        toast({
          title: "Error",
          description: `Failed to update stock: ${errorData.detail || "Unknown error"}`,
          variant: "destructive",
        });
        return;
      }

      // Create stock transaction
      const transactionResponse = await fetch(`${API_URL}/api/stock-transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(transactionPayload),
      });

      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        console.error("Transaction creation failed:", errorData);
        toast({
          title: "Error",
          description: `Failed to create transaction: ${errorData.detail || "Unknown error"}`,
          variant: "destructive",
        });
        return;
      }

      const newTransaction = await transactionResponse.json();
      console.log("New transaction created:", newTransaction);

      // Re-fetch inventory and transactions
      await loadData();

      toast({
        title: "Success",
        description: `Dispensed ${quantity} units of ${medication.name} successfully.`,
      });
    } catch (error) {
      console.error("Error dispensing medication:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while dispensing.",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const safeInventory = inventory || [];
    const totalItems = safeInventory.length;
    const inStock = safeInventory.filter((item) => item.status === "In Stock").length;
    const lowStock = safeInventory.filter((item) => item.status === "Low Stock").length;
    const outOfStock = safeInventory.filter((item) => item.status === "Out of Stock").length;
    const nearExpiry = safeInventory.filter((item) => item.status === "Near Expiry").length;
    const expired = safeInventory.filter((item) => item.status === "Expired").length;
    const reorderNeeded = safeInventory.filter((item) => item.currentStock <= item.minimumStock).length;
    const totalBatches = safeInventory.reduce((sum, med) => sum + (med.batches?.length || 0), 0);
    const activeBatches = safeInventory.reduce(
      (sum, med) => sum + (med.batches?.filter((b) => b.status === "Active").length || 0),
      0
    );

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      nearExpiry,
      expired,
      reorderNeeded,
      totalBatches,
      activeBatches,
    };
  }, [inventory]);

  // Category summaries
  const categorySummaries = useMemo(() => {
    const safeInventory = inventory || [];
    return getCategorySummaries(safeInventory);
  }, [inventory]);

  // Filtering and sorting for inventory
  const filteredInventory = inventory.filter((med) => {
    const matchesSearch =
      (med.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.genericName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.manufacturer || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || med.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || med.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = (a.name || "").localeCompare(b.name || "");
        break;
      case "stock":
        comparison = a.currentStock - b.currentStock;
        break;
      case "lastRestocked":
        comparison = new Date(a.lastRestocked || 0).getTime() - new Date(b.lastRestocked || 0).getTime();
        break;
      default:
        comparison = 0;
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const totalInventoryPages = Math.ceil(sortedInventory.length / itemsPerPage);
  const paginatedInventory = sortedInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filtering and sorting for transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      (tx.medicationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.performedBy || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = statusFilter === "All" || tx.type === statusFilter;
    return matchesSearch && matchesType;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "date":
        comparison = new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();
        break;
      case "medication":
        comparison = (a.medicationName || "").localeCompare(b.medicationName || "");
        break;
      case "quantity":
        comparison = a.quantity - b.quantity;
        break;
      default:
        comparison = 0;
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const totalTransactionPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Custom Report Modal (unchanged)
  const CustomReportModal = () => (
    <Dialog open={showCustomReportModal} onOpenChange={setShowCustomReportModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Custom Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {reportType === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="report-start">Start Date</Label>
                <Input
                  id="report-start"
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-end">End Date</Label>
                <Input
                  id="report-end"
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>
            </>
          )}
          <Button onClick={() => {
            console.log("Generating custom report", { type: reportType, startDate: reportStartDate, endDate: reportEndDate });
            toast({
              title: "Report Generated",
              description: "Check console for report details.",
            });
            setShowCustomReportModal(false);
          }} className="w-full">
            Generate Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // JSX
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading pharmacy inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Inventory Management</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
          <Button onClick={() => setShowCustomReportModal(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">{stats.inStock} in stock</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">{stats.reorderNeeded} need reorder</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.nearExpiry}</div>
            <p className="text-xs text-muted-foreground">{stats.expired} expired</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalBatches}</div>
            <p className="text-xs text-muted-foreground">{stats.activeBatches} active</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Stock Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Medication Categories
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    Table
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                  >
                    Cards
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Near Expiry</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {categorySummaries.map((category) => (
                        <tr key={category.category} className="hover:bg-gray-50">
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${getCategoryColor(category.category)}`}>
                                {React.createElement(getCategoryIcon(category.category), { className: "h-5 w-5" })}
                              </div>
                              {category.category}
                            </div>
                          </td>
                          <td className="p-4">{category.totalItems}</td>
                          <td className="p-4 text-green-600">{category.totalItems - category.outOfStockItems - category.expiredItems}</td>
                          <td className="p-4 text-yellow-600">{category.lowStockItems}</td>
                          <td className="p-4 text-red-600">{category.outOfStockItems}</td>
                          <td className="p-4 text-orange-600">{category.nearExpiryItems}</td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const filtered = inventory.filter((med) => med.category === category.category);
                                toast({
                                  title: "Category Details",
                                  description: `Found ${filtered.length} medications in ${category.category} category`,
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {viewMode === "cards" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorySummaries.map((category) => {
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
                                const filtered = inventory.filter((med) => med.category === category.category);
                                toast({
                                  title: "Category Details",
                                  description: `Found ${filtered.length} medications in ${category.category} category`,
                                });
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Inventory Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Medications</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Name, generic name, or ID..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Filter</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
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
                  <div className="space-y-2">
                    <Label>Category Filter</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => {
                        setCategoryFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categorySummaries.map((cat) => (
                          <SelectItem key={cat.category} value={cat.category}>
                            {cat.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {paginatedInventory.length} of {filteredInventory.length} medications
                    {filteredInventory.length !== inventory.length && ` (filtered from ${inventory.length} total)`}
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="stock">Stock Level</SelectItem>
                        <SelectItem value="lastRestocked">Last Restocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      Table
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                    >
                      Cards
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardContent>
              {viewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedInventory.map((medication) => (
                        <tr key={medication.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {React.createElement(getCategoryIcon(medication.category), { className: "h-5 w-5 text-gray-500" })}
                              <div>
                                <div className="font-medium">{medication.name} {medication.strength}</div>
                                <div className="text-sm text-gray-500">{medication.dosageForm}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{medication.category}</td>
                          <td className="p-4">{medication.currentStock} tablets</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(medication.status)}>{medication.status}</Badge>
                          </td>
                          <td className="p-4 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDispense(medication.id, 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowRestockModal(medication.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAdjustModal(medication.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowBatchModal(medication.id)}
                            >
                              <Layers className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetailsModal(medication.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTransactionModal(medication.id)}
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {viewMode === "cards" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedInventory.map((medication) => (
                    <Card key={medication.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {React.createElement(getCategoryIcon(medication.category), { className: "h-5 w-5 text-gray-500" })}
                            <div>
                              <CardTitle>{medication.name} {medication.strength}</CardTitle>
                              <CardDescription>{medication.dosageForm} • {medication.manufacturer}</CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(medication.status)}>{medication.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div><strong>Category:</strong> {medication.category}</div>
                          <div><strong>Stock:</strong> {medication.currentStock} tablets</div>
                          <div><strong>Location:</strong> {medication.location}</div>
                          <div><strong>Last Restocked:</strong> {formatDate(medication.lastRestocked)}</div>
                          <div className="flex justify-end gap-2 banques-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDispense(medication.id, 1)}
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Dispense
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowRestockModal(medication.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Restock
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
                              onClick={() => setShowTransactionModal(medication.id)}
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Transactions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalInventoryPages}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalInventoryPages, currentPage + 1))}
                    disabled={currentPage === totalInventoryPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Stock Transactions Filter & Search
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => loadData()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Transactions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Medication, ID, or performed by..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type Filter</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Dispensed">Dispensed</SelectItem>
                        <SelectItem value="Restocked">Restocked</SelectItem>
                        <SelectItem value="Adjusted">Adjusted</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date & Time</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="quantity">Quantity</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
                    {filteredTransactions.length !== transactions.length &&
                      ` (filtered from ${transactions.length} total)`}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      Table
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                    >
                      Cards
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardContent>
              {viewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="p-4">{transaction.medicationName}</td>
                          <td className="p-4">{transaction.type}</td>
                          <td className="p-4">
                            <span className={transaction.quantity < 0 ? "text-red-600" : "text-green-600"}>
                              {transaction.quantity > 0 ? "+" : ""}{transaction.quantity}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>{formatDate(transaction.date)}</div>
                            <div className="text-sm text-gray-500">{transaction.time}</div>
                          </td>
                          <td className="p-4">{transaction.performedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {viewMode === "cards" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedTransactions.map((transaction) => (
                    <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{transaction.medicationName}</CardTitle>
                            <CardDescription>{transaction.type}</CardDescription>
                          </div>
                          <div
                            className={`font-bold text-lg ${
                              transaction.quantity < 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {transaction.quantity > 0 ? "+" : ""}{transaction.quantity}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div><strong>Date:</strong> {formatDate(transaction.date)} {transaction.time}</div>
                          <div><strong>Performed By:</strong> {transaction.performedBy}</div>
                          <div><strong>Stock Change:</strong> {transaction.previousStock} → {transaction.newStock}</div>
                          {transaction.reason && <div><strong>Reason:</strong> {transaction.reason}</div>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                    )}
            </CardContent>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalTransactionPages}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalTransactionPages, currentPage + 1))}
                    disabled={currentPage === totalTransactionPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMedicationModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        inventory={inventory}
        setInventory={setInventory}
        newMed={newMed}
        setNewMed={setNewMed}
      />
      <DetailsModal
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        medication={inventory.find((m) => m.id === showDetailsModal) || null}
      />
      <BatchModal
        showBatchModal={showBatchModal}
        setShowBatchModal={setShowBatchModal}
        medication={inventory.find((m) => m.id === showBatchModal) || null}
      />
      <AdjustStockModal
        showAdjustModal={showAdjustModal}
        setShowAdjustModal={setShowAdjustModal}
        medication={inventory.find((m) => m.id === showAdjustModal) || null}
        inventory={inventory}
        setInventory={setInventory}
      />
      <RestockModal
        showRestockModal={showRestockModal}
        setShowRestockModal={setShowRestockModal}
        medication={inventory.find((m) => m.id === showRestockModal) || null}
        inventory={inventory}
        setInventory={setInventory}
      />
      <TransactionModal
        showTransactionModal={showTransactionModal}
        setShowTransactionModal={setShowTransactionModal}
        medication={inventory.find((m) => m.id === showTransactionModal) || null}
        transactions={transactions}
      />
      <CustomReportModal />
    </div>
  );
}