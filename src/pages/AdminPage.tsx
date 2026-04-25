import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Package2,
  LogOut,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  IndianRupee,
  ClockAlert,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { REVENUE_LAST_7_DAYS, INGREDIENTS } from "@/lib/data";
import {
  fetchProducts,
  fetchAllOrders,
  setProductAvailable,
  deleteProduct,
  createProduct,
  updateOrderStatus,
  type AdminOrder,
} from "@/lib/products";
import type { Product, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type View = "dashboard" | "products" | "orders" | "inventory";

export function AdminPage() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    } else if (!isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/home" });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  const NavItem = ({ v, label, Icon }: { v: View; label: string; Icon: typeof Box }) => (
    <button
      onClick={() => setView(v)}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        view === v
          ? "bg-primary text-primary-foreground"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="size-4" /> {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-ink p-4 text-white md:flex">
        <Link to="/home" className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-bold">B</span>
          <span className="font-display text-xl font-bold">BakeEase</span>
        </Link>
        <div className="mb-6 rounded-lg bg-white/5 p-3">
          <p className="text-sm font-semibold">{user.fullName}</p>
          <p className="text-xs text-white/60">Administrator</p>
        </div>
        <nav className="flex-1 space-y-1">
          <NavItem v="dashboard" label="Dashboard" Icon={LayoutDashboard} />
          <NavItem v="products" label="Products" Icon={Box} />
          <NavItem v="orders" label="Orders" Icon={ShoppingCart} />
          <NavItem v="inventory" label="Inventory" Icon={Package2} />
        </nav>
        <button
          onClick={() => { logout(); navigate({ to: "/home" }); }}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" /> Logout
        </button>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        {/* Mobile top tabs */}
        <div className="border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {(["dashboard", "products", "orders", "inventory"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                  view === v ? "bg-primary text-primary-foreground" : "bg-secondary"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8">
          {view === "dashboard" && <DashboardView />}
          {view === "products" && <ProductsView />}
          {view === "orders" && <OrdersView />}
          {view === "inventory" && <InventoryView />}
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  const stats = [
    { label: "Revenue Today", value: "₹24,580", Icon: IndianRupee, trend: "+12%" },
    { label: "Orders Today", value: "47", Icon: ShoppingCart, trend: "+8%" },
    { label: "Pending Orders", value: "9", Icon: ClockAlert, trend: "-3" },
    { label: "Low Stock Items", value: "3", Icon: AlertTriangle, trend: "Action" },
  ];
  const bestSellers = PRODUCTS.filter((p) => p.bestSeller).slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Today's performance at a glance</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-warm-sm">
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <s.Icon className="size-4" />
              </span>
              <span className="text-xs font-semibold text-success">{s.trend}</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-warm-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Last 7 Days Revenue</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="size-3" /> +18%
            </span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_LAST_7_DAYS}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 70)" />
                <XAxis dataKey="day" stroke="oklch(0.45 0.02 60)" fontSize={12} />
                <YAxis stroke="oklch(0.45 0.02 60)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-warm-sm">
          <h2 className="font-display text-lg font-bold">Best Sellers</h2>
          <ul className="mt-4 space-y-3">
            {bestSellers.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                <img src={p.image} alt="" className="size-10 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">₹{p.price}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-warm-sm">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">#{o.id}</td>
                  <td className="p-3 text-muted-foreground">{o.date}</td>
                  <td className="p-3 font-bold text-primary">₹{o.total}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsView() {
  const [list, setList] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAvail = (id: string) =>
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} products</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="size-4" /> Add Product</Button>
      </div>

      <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-warm-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Available</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="size-10 rounded-md object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 capitalize text-muted-foreground">{p.category}</td>
                  <td className="p-3 font-bold text-primary">₹{p.price}</td>
                  <td className="p-3">
                    <Switch checked={p.isAvailable} onCheckedChange={() => toggleAvail(p.id)} />
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon"><Edit className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-background p-6 shadow-warm-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Add Product</h2>
              <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-secondary"><X className="size-4" /></button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Product added"); setOpen(false); }}>
              <div><Label>Name</Label><Input className="mt-1" required /></div>
              <div><Label>Category</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cakes">Cakes</SelectItem>
                    <SelectItem value="cupcakes">Cupcakes</SelectItem>
                    <SelectItem value="pastries">Pastries</SelectItem>
                    <SelectItem value="bread">Bread</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Price (₹)</Label><Input type="number" className="mt-1" required /></div>
              <div><Label>Description</Label><Input className="mt-1" /></div>
              <div><Label>Image</Label><Input type="file" accept="image/*" className="mt-1" /></div>
              <Button type="submit" className="w-full" size="lg">Save Product</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersView() {
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const list = orders.filter((o) => filter === "all" || o.status === filter);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order #${id} → ${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v as OrderStatus | "all")}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="baking">Baking</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-warm-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <th className="p-3">ID</th><th className="p-3">Date</th><th className="p-3">Address</th><th className="p-3">Total</th><th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">#{o.id}</td>
                  <td className="p-3 text-muted-foreground">{o.date}</td>
                  <td className="p-3 text-muted-foreground">{o.address}</td>
                  <td className="p-3 font-bold text-primary">₹{o.total}</td>
                  <td className="p-3">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className="w-[170px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="baking">Baking</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryView() {
  const lowStock = INGREDIENTS.filter((i) => i.stock < i.reorder);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 text-warning-foreground" />
          <div>
            <p className="font-semibold">{lowStock.length} ingredient{lowStock.length > 1 ? "s" : ""} below reorder level</p>
            <p className="text-sm text-muted-foreground">{lowStock.map((i) => i.name).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-warm-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <th className="p-3">Ingredient</th><th className="p-3">In Stock</th><th className="p-3">Reorder Level</th><th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {INGREDIENTS.map((i) => {
                const low = i.stock < i.reorder;
                return (
                  <tr key={i.name} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">{i.name}</td>
                    <td className="p-3">{i.stock} {i.unit}</td>
                    <td className="p-3 text-muted-foreground">{i.reorder} {i.unit}</td>
                    <td className="p-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        low ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                      )}>
                        {low ? "Low" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
