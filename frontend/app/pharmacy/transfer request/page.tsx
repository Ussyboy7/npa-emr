import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, ArrowUpRight, Clock, CheckCircle } from "lucide-react";
import { useDispensaryInventory, useTransferRequests, useDrugs } from "@/hooks/usePharmacyData";

const dispensaryInventory = [
  { id: 1, drug: "Amoxicillin 500mg", currentStock: 150, minStock: 200, unit: "tablet" },
  { id: 2, drug: "Paracetamol 500mg", currentStock: 80, minStock: 300, unit: "tablet" },
  { id: 3, drug: "Lisinopril 10mg", currentStock: 45, minStock: 100, unit: "tablet" },
  { id: 4, drug: "Vitamin C 1000mg", currentStock: 30, minStock: 150, unit: "tablet" },
];

const myRequests = [
  {
    id: 1,
    requestNumber: "REQ-20240105-001",
    status: "approved",
    requestedDate: "2024-01-05T09:30:00Z",
    approvedDate: "2024-01-05T14:30:00Z",
    totalItems: 3,
    notes: "Urgent request for outpatient clinic"
  },
  {
    id: 2,
    requestNumber: "REQ-20240104-003",
    status: "pending",
    requestedDate: "2024-01-04T15:20:00Z",
    totalItems: 2,
    notes: "Regular stock replenishment"
  },
  {
    id: 3,
    requestNumber: "REQ-20240104-001",
    status: "completed",
    requestedDate: "2024-01-04T10:15:00Z",
    completedDate: "2024-01-04T16:45:00Z",
    totalItems: 4,
    notes: "Weekly inventory refresh"
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-800';
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function DispensaryTransferRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [requestItems, setRequestItems] = useState<any[]>([]);
  const [requestNotes, setRequestNotes] = useState("");
  
  const { inventory: dispensaryInventory, loading: inventoryLoading } = useDispensaryInventory();
  const { requests: myRequests, loading: requestsLoading, createRequest } = useTransferRequests();
  const { drugs } = useDrugs();

  const filteredInventory = dispensaryInventory.filter(item =>
    item.drugs?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = dispensaryInventory.filter(item => item.quantity <= (item.min_stock_level || 0));
  const pendingRequests = myRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = myRequests.filter(req => req.status === 'approved').length;

  const addItemToRequest = (drug: any) => {
    const existingItem = requestItems.find(item => item.drugId === drug.id);
    if (existingItem) {
      setRequestItems(requestItems.map(item =>
        item.drugId === drug.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setRequestItems([...requestItems, {
        drugId: drug.id,
        drug: drug.drug,
        quantity: drug.minStock - drug.currentStock,
        unit: drug.unit,
        priority: drug.currentStock <= drug.minStock * 0.5 ? 'high' : 'normal'
      }]);
    }
  };

  const removeItemFromRequest = (drugId: number) => {
    setRequestItems(requestItems.filter(item => item.drugId !== drugId));
  };

  const updateItemQuantity = (drugId: number, quantity: number) => {
    setRequestItems(requestItems.map(item =>
      item.drugId === drugId ? { ...item, quantity } : item
    ));
  };

  const submitRequest = async () => {
    try {
      await createRequest({
        items: requestItems.map(item => ({
          drug_id: item.drugId,
          quantity: item.quantity,
          unit: item.unit,
          notes: `Priority: ${item.priority}`
        })),
        notes: requestNotes
      });
      setRequestItems([]);
      setRequestNotes("");
      setIsNewRequestOpen(false);
    } catch (error) {
      console.error("Failed to submit request:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Transfer Requests</h1>
          <p className="text-muted-foreground">Request stock from warehouse to dispensary</p>
        </div>
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Transfer Request</DialogTitle>
              <DialogDescription>
                Request stock from warehouse to replenish dispensary inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Current Inventory */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Dispensary Inventory</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dispensaryInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.drug}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}
                        </p>
                        {item.currentStock <= item.minStock && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Low Stock</Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addItemToRequest(item)}
                        disabled={requestItems.some(reqItem => reqItem.drugId === item.id)}
                      >
                        {requestItems.some(reqItem => reqItem.drugId === item.id) ? 'Added' : 'Add to Request'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Items */}
              {requestItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Request Items ({requestItems.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {requestItems.map((item) => (
                      <div key={item.drugId} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                        <div className="flex-1">
                          <p className="font-medium">{item.drug}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.drugId, parseInt(e.target.value) || 0)}
                              className="w-20 h-8"
                              min="1"
                            />
                            <span className="text-sm">{item.unit}</span>
                            <Select value={item.priority} onValueChange={(value) => 
                              setRequestItems(requestItems.map(req => 
                                req.drugId === item.drugId ? { ...req, priority: value } : req
                              ))
                            }>
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItemFromRequest(item.drugId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Request Notes</label>
                <Textarea
                  placeholder="Add any special instructions or urgency notes..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2">
                <Button onClick={submitRequest} disabled={requestItems.length === 0}>
                  Submit Request ({requestItems.length} items)
                </Button>
                <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
            <p className="text-xs text-muted-foreground">Ready for transfer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-red-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Items that need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                <div>
                  <p className="font-medium text-sm">{item.drug}</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}
                  </p>
                </div>
                <Button size="sm" onClick={() => addItemToRequest(item)}>
                  Request Stock
                </Button>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                All items are above minimum stock level
              </p>
            )}
          </CardContent>
        </Card>

        {/* My Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              My Recent Requests
            </CardTitle>
            <CardDescription>Track your transfer request status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{request.requestNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.totalItems} items • {new Date(request.requestedDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}