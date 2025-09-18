import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Filter, Plus, ArrowUpRight, AlertTriangle, Calendar } from "lucide-react";
import { useStoreInventory } from "@/hooks/usePharmacyData";
import StockUpdateDialog from "@/components/pharmacy/StockUpdateDialog";
import { useToast } from "@/hooks/use-toast";

function getStockStatus(current: number, min: number, max: number) {
  if (current <= min) {
    return { label: "Low", color: "bg-red-100 text-red-800" };
  } else if (current >= max * 0.8) {
    return { label: "High", color: "bg-blue-100 text-blue-800" };
  }
  return { label: "Normal", color: "bg-green-100 text-green-800" };
}

function isExpiringSoon(expiryDate: string) {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const monthsUntilExpiry = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsUntilExpiry <= 6;
}

export default function StoreInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { inventory, loading, updateStock } = useStoreInventory();
  const { toast } = useToast();

  const filteredItems = inventory.filter(item =>
    item.drugs?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.suppliers?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock_level).length;
  const expiringSoonItems = inventory.filter(item => isExpiringSoon(item.expiry_date)).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.cost_per_unit || 0)), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Inventory</h1>
          <p className="text-muted-foreground">Warehouse bulk inventory management</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
          <Button variant="outline">
            <ArrowUpRight className="h-4 w-4" />
            Transfer to Dispensary
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Different products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringSoonItems}</div>
            <p className="text-xs text-muted-foreground">Within 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by drug name, batch number, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Inventory Items */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No inventory items found</div>
        ) : (
          filteredItems.map((item) => {
            const stockStatus = getStockStatus(item.quantity, item.min_stock_level || 0, item.max_stock_level || 1000);
            const expiringSoon = isExpiringSoon(item.expiry_date);

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.drugs?.name || 'Unknown Drug'}</CardTitle>
                      <CardDescription>
                        Batch: {item.batch_number} • Supplier: {item.suppliers?.name || 'Unknown'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                      {expiringSoon && (
                        <Badge className="bg-red-100 text-red-800">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Current Stock</p>
                      <p className="text-2xl font-bold">{item.quantity}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Stock Range</p>
                      <p className="text-sm">{item.min_stock_level || 0} - {item.max_stock_level || 1000}</p>
                      <p className="text-xs text-muted-foreground">Min - Max {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cost Per Unit</p>
                      <p className="text-lg font-semibold">₦{(item.cost_per_unit || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry Date</p>
                      <p className={`text-sm ${expiringSoon ? 'text-red-600 font-medium' : ''}`}>
                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">Location: {item.location || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedItem({
                          id: item.id,
                          name: item.drugs?.name || 'Unknown Drug',
                          currentStock: item.quantity,
                          unit: item.unit
                        });
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      Update Stock
                    </Button>
                    <Button size="sm" variant="outline">Transfer</Button>
                    <Button size="sm" variant="outline">Edit Details</Button>
                    <Button size="sm" variant="outline">View History</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <StockUpdateDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => {
          setIsUpdateDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onUpdate={async (updateData) => {
          try {
            await updateStock(updateData.itemId, {
              quantity: updateData.newStockLevel,
              updated_at: new Date().toISOString()
            });
            toast({
              title: "Success",
              description: "Stock updated successfully",
            });
          } catch (error) {
            toast({
              title: "Error", 
              description: "Failed to update stock",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}