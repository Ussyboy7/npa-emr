import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, Package, DollarSign, AlertTriangle, Truck, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function StoreReports() {
  const [timeRange, setTimeRange] = useState("30");
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [deliveryData, setDeliveryData] = useState<any[]>([]);
  const [expiryData, setExpiryData] = useState<any[]>([]);
  const [topDrugs, setTopDrugs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    deliveriesThisMonth: 0,
    transfersThisMonth: 0
  });

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      // Get inventory statistics
      const { data: inventory } = await supabase
        .from('store_inventory')
        .select(`
          *,
          drugs(name, generic_name),
          suppliers(name)
        `);

      if (inventory) {
        const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.cost_per_unit || 0)), 0);
        const totalItems = inventory.length;
        const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock_level).length;
        const expiringSoon = inventory.filter(item => {
          if (!item.expiry_date) return false;
          const expiryDate = new Date(item.expiry_date);
          const sixMonthsFromNow = new Date();
          sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
          return expiryDate <= sixMonthsFromNow;
        }).length;

        setStats(prev => ({
          ...prev,
          totalValue,
          totalItems,
          lowStockItems,
          expiringSoon
        }));

        // Process top drugs by value
        const drugValues = inventory.reduce((acc: any, item) => {
          const drugName = item.drugs?.name || 'Unknown';
          const value = item.quantity * (item.cost_per_unit || 0);
          acc[drugName] = (acc[drugName] || 0) + value;
          return acc;
        }, {});

        const sortedDrugs = Object.entries(drugValues)
          .map(([name, value]) => ({ name, value }))
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 10);

        setTopDrugs(sortedDrugs);

        // Process expiry data
        const expiryMonths = inventory.reduce((acc: any, item) => {
          if (!item.expiry_date) return acc;
          const month = new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const expiryChart = Object.entries(expiryMonths)
          .map(([month, count]) => ({ month, items: count }))
          .slice(0, 12);

        setExpiryData(expiryChart);
      }

      // Get delivery statistics
      const { data: deliveries } = await supabase
        .from('supplier_deliveries')
        .select(`
          *,
          suppliers(name),
          supplier_delivery_items(quantity, cost_per_unit)
        `)
        .gte('delivery_date', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString());

      if (deliveries) {
        setStats(prev => ({ ...prev, deliveriesThisMonth: deliveries.length }));

        // Process delivery data for chart
        const deliveryChart = deliveries.reduce((acc: any, delivery) => {
          const date = new Date(delivery.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const value = delivery.total_amount || 0;
          const existing = acc.find((item: any) => item.date === date);
          if (existing) {
            existing.value += value;
            existing.count += 1;
          } else {
            acc.push({ date, value, count: 1 });
          }
          return acc;
        }, []);

        setDeliveryData(deliveryChart);
      }

      // Get transfer statistics
      const { data: transfers } = await supabase
        .from('stock_transfers')
        .select('*')
        .gte('transfer_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (transfers) {
        setStats(prev => ({ ...prev, transfersThisMonth: transfers.length }));
      }

    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for store inventory management</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deliveries This Month</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveriesThisMonth}</div>
            <p className="text-xs text-muted-foreground">Supplier deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transfersThisMonth}</div>
            <p className="text-xs text-muted-foreground">To dispensary</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Drugs by Value</CardTitle>
            <CardDescription>Highest value inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDrugs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Trends</CardTitle>
            <CardDescription>Daily delivery values over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']} />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiry Distribution</CardTitle>
            <CardDescription>Items expiring by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expiryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="items" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Stock level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Normal Stock', value: stats.totalItems - stats.lowStockItems },
                    { name: 'Low Stock', value: stats.lowStockItems }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {[
                    { name: 'Normal Stock', value: stats.totalItems - stats.lowStockItems },
                    { name: 'Low Stock', value: stats.lowStockItems }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}