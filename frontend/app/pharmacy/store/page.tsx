import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Search, Filter, Package, Truck, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function StoreDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_deliveries')
        .select(`
          *,
          suppliers(name, contact_person),
          supplier_delivery_items(
            *,
            drugs(name, generic_name)
          )
        `)
        .order('delivery_date', { ascending: false });

      if (!error && data) {
        setDeliveries(data);
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.delivery_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.suppliers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'partial': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const viewDetails = (delivery: any) => {
    setSelectedDelivery(delivery);
    setShowDetails(true);
  };

  const totalDeliveries = deliveries.length;
  const totalValue = deliveries.reduce((sum, d) => sum + (d.total_amount || 0), 0);
  const receivedDeliveries = deliveries.filter(d => d.status === 'received').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground">Track and manage all supplier deliveries</p>
        </div>
        <Button onClick={() => navigate('/pharmacy/store/receive')}>
          <Package className="h-4 w-4 mr-2" />
          Receive Delivery
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{receivedDeliveries}</div>
            <p className="text-xs text-muted-foreground">Completed deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground">Awaiting receipt</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>View and manage all supplier deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by delivery number, supplier, or invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold">{delivery.delivery_number}</h3>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Supplier:</strong> {delivery.suppliers?.name}</p>
                        <p><strong>Invoice:</strong> {delivery.invoice_number || 'N/A'}</p>
                        <p><strong>Date:</strong> {new Date(delivery.delivery_date).toLocaleDateString()}</p>
                        <p><strong>Items:</strong> {delivery.supplier_delivery_items?.length || 0}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">
                        ${(delivery.total_amount || 0).toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewDetails(delivery)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDeliveries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No deliveries found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details - {selectedDelivery?.delivery_number}</DialogTitle>
            <DialogDescription>
              Complete information about this delivery
            </DialogDescription>
          </DialogHeader>
          
          {selectedDelivery && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Delivery Information</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Number:</strong> {selectedDelivery.delivery_number}</p>
                    <p><strong>Date:</strong> {new Date(selectedDelivery.delivery_date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <Badge className={getStatusColor(selectedDelivery.status)}>{selectedDelivery.status}</Badge></p>
                    <p><strong>Invoice:</strong> {selectedDelivery.invoice_number || 'N/A'}</p>
                    <p><strong>Total Amount:</strong> ${(selectedDelivery.total_amount || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Supplier Information</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedDelivery.suppliers?.name}</p>
                    <p><strong>Contact:</strong> {selectedDelivery.suppliers?.contact_person || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedDelivery.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedDelivery.notes}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-4">Delivery Items</h4>
                <div className="space-y-2">
                  {selectedDelivery.supplier_delivery_items?.map((item: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="grid gap-4 md:grid-cols-6 text-sm">
                        <div>
                          <p className="font-medium">{item.drugs?.name}</p>
                          <p className="text-muted-foreground">{item.drugs?.generic_name}</p>
                        </div>
                        <div>
                          <p className="font-medium">Quantity</p>
                          <p>{item.quantity} {item.unit}</p>
                        </div>
                        <div>
                          <p className="font-medium">Cost/Unit</p>
                          <p>${(item.cost_per_unit || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Batch</p>
                          <p>{item.batch_number}</p>
                        </div>
                        <div>
                          <p className="font-medium">Expiry</p>
                          <p>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Location</p>
                          <p>{item.location || 'N/A'}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}