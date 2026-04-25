import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  MapPin,
  Settings,
  LogOut,
  Truck,
  ChefHat,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { fetchMyOrders } from "@/lib/products";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type View = "orders" | "profile" | "addresses" | "settings";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  baking: "Baking",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/40",
  baking: "bg-accent/15 text-accent-foreground border-accent/40",
  out_for_delivery: "bg-primary/15 text-primary border-primary/40",
  delivered: "bg-success/15 text-success border-success/40",
  cancelled: "bg-destructive/15 text-destructive border-destructive/40",
};

const STEPS: { key: OrderStatus; label: string; Icon: typeof Clock }[] = [
  { key: "pending", label: "Pending", Icon: Clock },
  { key: "baking", label: "Baking", Icon: ChefHat },
  { key: "out_for_delivery", label: "On the way", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: CheckCircle2 },
];

export function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("orders");
  const [tab, setTab] = useState<"all" | "active" | "completed" | "cancelled">("all");

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: fetchMyOrders,
    enabled: isAuthenticated,
  });

  if (!user) return null;

  const orders = allOrders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "active") return o.status === "pending" || o.status === "baking" || o.status === "out_for_delivery";
    if (tab === "completed") return o.status === "delivered";
    return o.status === "cancelled";
  });

  const NavItem = ({
    v, label, Icon,
  }: { v: View; label: string; Icon: typeof Package }) => (
    <button
      onClick={() => setView(v)}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        view === v ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
      )}
    >
      <Icon className="size-4" /> {label}
    </button>
  );

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <h1 className="font-display text-3xl font-bold md:text-4xl">My Account</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-xl border border-border bg-card p-4 shadow-warm-sm lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <nav className="mt-3 space-y-1">
              <NavItem v="orders" label="My Orders" Icon={Package} />
              <NavItem v="profile" label="Profile" Icon={Settings} />
              <NavItem v="addresses" label="Saved Addresses" Icon={MapPin} />
              <NavItem v="settings" label="Account Settings" Icon={Settings} />
              <button
                onClick={() => { logout(); navigate({ to: "/home" }); toast.success("Logged out"); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" /> Logout
              </button>
            </nav>
          </aside>

          {/* Main */}
          <main>
            {view === "orders" && (
              <>
                <div className="mb-4 flex flex-wrap gap-2 border-b border-border">
                  {(["all", "active", "completed", "cancelled"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "border-b-2 px-3 py-2 text-sm font-medium capitalize",
                        tab === t
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
                      <p className="text-muted-foreground">Loading your orders…</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
                      <p className="text-muted-foreground">No orders here yet.</p>
                      <Link to="/catalogue" className="mt-3 inline-block">
                        <Button variant="outline" size="sm">Browse menu</Button>
                      </Link>
                    </div>
                  ) : (
                    orders.map((o) => <OrderCard key={o.id} order={o} />)
                  )}
                </div>
              </>
            )}

            {view === "profile" && <ProfileView />}
            {view === "addresses" && <AddressesView />}
            {view === "settings" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-warm-sm">
                <h2 className="font-display text-xl font-bold">Account Settings</h2>
                <p className="mt-1 text-sm text-muted-foreground">Manage notifications, password, and connected accounts.</p>
                <div className="mt-4 space-y-3">
                  <Button variant="outline" className="w-full justify-start">Change Password</Button>
                  <Button variant="outline" className="w-full justify-start">Notification Preferences</Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">Delete Account</Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

function OrderCard({ order }: { order: Order }) {
  const stepIdx =
    order.status === "cancelled"
      ? -1
      : STEPS.findIndex((s) => s.key === order.status);

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-warm-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">Order #{order.id}</p>
          <p className="text-xs text-muted-foreground">Placed on {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", STATUS_BADGE[order.status])}>
          {order.status === "cancelled" && <XCircle className="mr-1 inline size-3" />}
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between">
            <span>{it.quantity}× {it.name}</span>
            <span className="text-muted-foreground">₹{it.price * it.quantity}</span>
          </li>
        ))}
      </ul>

      {order.status !== "cancelled" && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const reached = i <= stepIdx;
              return (
                <div key={s.key} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition-colors",
                      reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <s.Icon className="size-4" />
                  </div>
                  <span className={cn("mt-1 text-[10px] font-medium", reached ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="relative mt-2 h-1 rounded-full bg-secondary">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(0, (stepIdx / (STEPS.length - 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <p className="text-sm font-bold">Total: <span className="text-primary">₹{order.total}</span></p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">View</Button>
          {order.status === "delivered" && <Button size="sm">Reorder</Button>}
        </div>
      </div>
    </article>
  );
}

function ProfileView() {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-warm-sm">
      <h2 className="font-display text-xl font-bold">Profile</h2>
      <form className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Full name</Label>
          <Input defaultValue={user?.fullName} className="mt-1" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input defaultValue={user?.phone ?? ""} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label>Email</Label>
          <Input type="email" defaultValue={user?.email} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Button type="button" onClick={(e) => { e.preventDefault(); toast.success("Profile saved"); }}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}

function AddressesView() {
  const addresses = [
    { tag: "Home", line: "B-12, Sea Breeze Apts, Bandra West, Mumbai 400050" },
    { tag: "Office", line: "WeWork BKC, Bandra Kurla Complex, Mumbai 400051" },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-warm-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Saved Addresses</h2>
        <Button size="sm"><PlusCircle className="size-4" /> Add new</Button>
      </div>
      <div className="mt-4 space-y-3">
        {addresses.map((a) => (
          <div key={a.tag} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <MapPin className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{a.tag}</p>
              <p className="text-sm text-muted-foreground">{a.line}</p>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
