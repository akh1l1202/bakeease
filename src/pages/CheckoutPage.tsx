import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Tag, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, DELIVERY_FEE } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { placeOrder } from "@/lib/products";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CheckoutPage() {
  const cart = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coupon, setCoupon] = useState("");
  const [delivery, setDelivery] = useState<"delivery" | "pickup">("delivery");
  const [pay, setPay] = useState<"upi" | "cod">("upi");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  if (cart.items.length === 0 && !done) {
    return (
      <>
        <Navbar />
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-secondary">
            <ShoppingBag className="size-10 text-muted-foreground" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add some delicious bakes from our menu to get started.
          </p>
          <Link to="/catalogue" className="mt-6">
            <Button size="lg">Browse Menu</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (done) {
    return (
      <>
        <Navbar />
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <CheckCircle2 className="size-20 text-success" />
          <h1 className="mt-4 font-display text-3xl font-bold">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you. We've received your order — track it from your dashboard.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/dashboard"><Button>Track Order</Button></Link>
            <Link to="/catalogue"><Button variant="outline">Keep Shopping</Button></Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const placeOrderHandler = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to place an order");
      navigate({ to: "/login" });
      return;
    }
    if (delivery === "delivery" && address.trim().length < 10) {
      toast.error("Please enter a complete delivery address");
      return;
    }
    setPlacing(true);
    try {
      const orderNumber = await placeOrder({
        userId: user.id,
        items: cart.items.map((it) => ({
          productId: UUID_RE.test(it.product.id) ? it.product.id : null,
          productName: it.product.name,
          quantity: it.quantity,
          unitPrice: it.product.price,
        })),
        total: cart.total,
        paymentMethod: pay,
        deliveryType: delivery,
        address: delivery === "pickup" ? "Pickup at Bandra store" : address,
      });
      toast.success(`Order ${orderNumber} placed!`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDone(true);
      cart.clear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const applyCoupon = () => {
    const r = cart.applyCoupon(coupon);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Cart &amp; Checkout</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Items */}
          <section className="space-y-3">
            {cart.items.map((it) => (
              <div key={it.product.id} className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-warm-sm">
                <img
                  src={it.product.image}
                  alt={it.product.name}
                  loading="lazy"
                  width={120}
                  height={120}
                  className="size-24 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold">{it.product.name}</p>
                      <p className="text-xs text-muted-foreground">₹{it.product.price} each</p>
                    </div>
                    <button
                      onClick={() => cart.remove(it.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex items-center gap-1 rounded-md border border-border">
                      <button
                        onClick={() => cart.setQuantity(it.product.id, it.quantity - 1)}
                        className="grid size-8 place-items-center hover:bg-secondary"
                      >−</button>
                      <span className="w-8 text-center text-sm font-medium">{it.quantity}</span>
                      <button
                        onClick={() => cart.setQuantity(it.product.id, it.quantity + 1)}
                        className="grid size-8 place-items-center hover:bg-secondary"
                      >+</button>
                    </div>
                    <p className="font-bold text-primary">₹{it.product.price * it.quantity}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-warm-sm">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <span className="text-sm font-semibold">Apply coupon</span>
              </div>
              {cart.appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-md bg-success/10 p-3">
                  <span className="text-sm font-medium text-success">
                    {cart.appliedCoupon.code} — {cart.appliedCoupon.discountPct}% off
                  </span>
                  <button
                    onClick={cart.clearCoupon}
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Enter code (try BAKE20)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <Button onClick={applyCoupon}>Apply</Button>
                </div>
              )}
            </div>
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-5 shadow-warm">
              <h2 className="font-display text-xl font-semibold">Order Summary</h2>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["delivery", "pickup"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDelivery(d)}
                    className={cn(
                      "rounded-md border-2 p-3 text-sm font-medium capitalize transition-colors",
                      delivery === d
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {delivery === "delivery" && (
                <div className="mt-3">
                  <Label htmlFor="addr">Delivery Address</Label>
                  <Textarea id="addr" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" rows={2} placeholder="Flat, building, area, pincode" />
                </div>
              )}
              <div className="mt-3">
                <Label htmlFor="when">Preferred date &amp; time</Label>
                <Input id="when" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold">Payment Method</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["upi", "cod"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPay(p)}
                      className={cn(
                        "rounded-md border-2 p-3 text-sm font-medium uppercase transition-colors",
                        pay === p
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {p === "upi" ? "UPI" : "Cash on Delivery"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <Row label="Subtotal" value={`₹${cart.subtotal}`} />
                {cart.discount > 0 && (
                  <Row label={`Discount (${cart.appliedCoupon?.code})`} value={`-₹${cart.discount}`} accent="success" />
                )}
                <Row label="Delivery fee" value={`₹${DELIVERY_FEE}`} />
                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{cart.total}</span>
                </div>
              </div>

              <Button onClick={placeOrderHandler} className="mt-5 w-full" size="lg" disabled={placing}>
                {placing ? "Placing order..." : `Place Order — ₹${cart.total}`}
              </Button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "success" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", accent === "success" && "text-success")}>{value}</span>
    </div>
  );
}
