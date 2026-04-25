import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Gamepad2, ArrowRight, Sparkles, Star, Quote } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/data";
import type { Category } from "@/lib/types";
import heroImg from "@/assets/hero-bakery.jpg";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PILLS: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cakes", label: "Cakes" },
  { value: "cupcakes", label: "Cupcakes" },
  { value: "pastries", label: "Pastries" },
  { value: "bread", label: "Bread" },
  { value: "custom", label: "Custom" },
];

const TESTIMONIALS = [
  {
    name: "Priya Mehta",
    avatar: "PM",
    quote: "The chocolate truffle cake was divine — better than any 5-star bakery in Mumbai!",
    rating: 5,
  },
  {
    name: "Rahul Iyer",
    avatar: "RI",
    quote: "Same-day delivery to Bandra, perfectly packed and still warm. Will order again.",
    rating: 5,
  },
  {
    name: "Aisha Khan",
    avatar: "AK",
    quote: "Beautiful custom wedding cake. Their decorators made my big day unforgettable.",
    rating: 5,
  },
];

export function HomePage() {
  const [pill, setPill] = useState<Category | "all">("all");

  const featured = useMemo(
    () => (pill === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === pill)).slice(0, 8),
    [pill]
  );

  const bestSellers = useMemo(() => PRODUCTS.filter((p) => p.bestSeller), []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Fresh bakery counter with cakes and pastries"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/60 to-ink/30" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-32">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/95 px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="size-3" /> Mumbai's freshest online bakery
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
              Fresh Baked,
              <br /> Just for You
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85 md:text-lg">
              Handcrafted cakes, pastries and breads delivered fresh from our Bandra ovens to your door — every single day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/catalogue">
                <Button variant="hero" size="xl">
                  Order Now <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link to="/catalogue">
                <Button variant="heroOutline" size="xl">
                  Build Your Cake
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { v: "50+", l: "Products" },
                { v: "4.9★", l: "Avg Rating" },
                { v: "2000+", l: "Happy Customers" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md"
                >
                  <span className="font-bold text-accent">{s.v}</span>{" "}
                  <span className="text-white/80">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {PILLS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPill(p.value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                pill === p.value
                  ? "border-primary bg-primary text-primary-foreground shadow-warm-sm"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Featured Products</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked favourites from our master bakers
            </p>
          </div>
          <Link to="/catalogue" className="hidden text-sm font-medium text-primary hover:underline md:inline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary to-primary-glow p-6 text-primary-foreground md:flex-row md:p-8">
          <div>
            <p className="font-display text-2xl font-bold md:text-3xl">20% off your next order</p>
            <p className="mt-1 text-sm text-primary-foreground/85">
              Use code <span className="font-mono font-bold">BAKE20</span> at checkout. Min order ₹500.
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            onClick={() => {
              navigator.clipboard.writeText("BAKE20");
              toast.success("Code copied!");
            }}
          >
            <Copy className="size-4" /> Copy code
          </Button>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-6">
        <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl">Best Sellers</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* GAME CTA */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-6">
        <Link
          to="/game"
          className="group flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-8 transition-all hover:border-primary hover:bg-cream-deep md:flex-row"
        >
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Gamepad2 className="size-8" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">Play BakeMaster</p>
              <p className="text-sm text-muted-foreground">
                A fun mini-game — assemble the perfect cake against the clock!
              </p>
            </div>
          </div>
          <Button variant="hero" size="lg">
            Play Now <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-6">
        <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl">Loved by Mumbai</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card p-6 shadow-warm-sm">
              <Quote className="size-6 text-accent" />
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <div className="flex">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
