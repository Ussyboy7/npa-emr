import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TruckIcon, AlertTriangle, DollarSign, ArrowUpRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const recentDeliveries = [
  { id: 1, supplier: "MedSupply Corp", deliveryNumber: "DEL-20240105-001", items: 15, status: "received", date: "2024-01-05" },
  { id: 2, supplier: "PharmaCorp Ltd", deliveryNumber: "DEL-20240104-002", items: 8, status: "pending", date: "2024-01-04" },
  { id: 3, supplier: "GlobalMeds Inc", deliveryNumber: "DEL-20240104-001", items: 22, status: "received", date: "2024-01-04" },
];

const lowStockAlerts = [
  { id: 1, drug: "Amoxicillin 500mg", currentStock: 50, minStock: 100, unit: "carton" },
  { id: 2, drug: "Paracetamol 500mg", currentStock: 25, minStock: 80, unit: "pack" },
  { id: 3, drug: "Vitamin C 1000mg", currentStock: 15, minStock: 40, unit: "box" },
];

const pendingTransfers = [
  { id: 1, requestNumber: "REQ-20240105-001", items: 5, requestedBy: "Dispensary Team", date: "2024-01-05" },
  { id: 2, requestNumber: "REQ-20240105-002", items: 3, requestedBy: "Dispensary Team", date: "2024-01-05" },
];

const todayStats = {
  totalStock: { value: 1250, unit: "items" },
  deliveries: { value: 3, unit: "received" },
  transfers: { value: 8, unit: "completed" },
  value: { value: 450000, unit: "NGN" }
};

export default function StoreDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Dashboard</h1>
          <p className="text-muted-foreground">Warehouse & bulk inventory management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/pharmacy/store/receive')} className="gap-2">
            <TruckIcon className="h-4 w-4" />
            Receive Delivery
          </Button>
          <Button variant="outline" onClick={() => navigate('/pharmacy/store/inventory')}>
            View Inventory
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalStock.value}</div>
            <p className="text-xs text-muted-foreground">
              Bulk units in warehouse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.deliveries.value}</div>
            <p className="text-xs text-muted-foreground">
              Supplier deliveries received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers Completed</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.transfers.value}</div>
            <p className="text-xs text-muted-foreground">
              To dispensary today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{todayStats.value.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current warehouse value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockAlerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.drug}</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}
                  </p>
                </div>
                <Button size="sm" variant="outline">Reorder</Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/pharmacy/store/inventory')}>
              View All Stock
            </Button>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5 text-blue-500" />
              Recent Deliveries
            </CardTitle>
            <CardDescription>Latest supplier deliveries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{delivery.supplier}</p>
                  <p className="text-xs text-muted-foreground">
                    {delivery.deliveryNumber} • {delivery.items} items
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    delivery.status === 'received' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {delivery.status}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/pharmacy/store/deliveries')}>
              View All Deliveries
            </Button>
          </CardContent>
        </Card>

        {/* Pending Transfer Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Pending Transfers
            </CardTitle>
            <CardDescription>Requests from dispensary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTransfers.map((transfer) => (
              <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{transfer.requestNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {transfer.items} items • {transfer.requestedBy}
                  </p>
                </div>
                <Button size="sm">Approve</Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/pharmacy/store/transfer-requests')}>
              View All Requests
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common store management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={() => navigate('/pharmacy/store/receive')}>
              <TruckIcon className="h-6 w-6" />
              <span>Receive Delivery</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={() => navigate('/pharmacy/store/transfer-requests')}>
              <ArrowUpRight className="h-6 w-6" />
              <span>Process Transfers</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={() => navigate('/pharmacy/store/inventory')}>
              <Package className="h-6 w-6" />
              <span>Manage Inventory</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={() => navigate('/pharmacy/store/reports')}>
              <DollarSign className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}