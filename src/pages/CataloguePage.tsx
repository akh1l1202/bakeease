import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Grid3x3, List, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PRODUCTS } from "@/lib/data";
import type { Category, Flavour, Occasion } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { v: Category; l: string }[] = [
  { v: "cakes", l: "Cakes" },
  { v: "pastries", l: "Pastries" },
  { v: "cupcakes", l: "Cupcakes" },
  { v: "bread", l: "Bread" },
  { v: "custom", l: "Custom" },
];

const OCCASIONS: { v: Occasion; l: string }[] = [
  { v: "birthday", l: "Birthday" },
  { v: "wedding", l: "Wedding" },
  { v: "anniversary", l: "Anniversary" },
  { v: "babyShower", l: "Baby Shower" },
  { v: "casual", l: "Casual" },
];

const FLAVOURS: { v: Flavour; l: string }[] = [
  { v: "chocolate", l: "Chocolate" },
  { v: "vanilla", l: "Vanilla" },
  { v: "redVelvet", l: "Red Velvet" },
  { v: "mango", l: "Mango" },
  { v: "butterscotch", l: "Butterscotch" },
];

type Sort = "popular" | "newest" | "price_asc" | "price_desc";

export function CataloguePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [occs, setOccs] = useState<Occasion[]>([]);
  const [flavs, setFlavs] = useState<Flavour[]>([]);
  const [priceMax, setPriceMax] = useState(2000);
  const [highRated, setHighRated] = useState(false);
  const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // fake initial loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const results = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.price <= priceMax);
    if (search.trim())
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (cats.length) list = list.filter((p) => cats.includes(p.category));
    if (occs.length) list = list.filter((p) => p.occasions.some((o) => occs.includes(o)));
    if (flavs.length) list = list.filter((p) => flavs.includes(p.flavour));
    if (highRated) list = list.filter((p) => p.rating >= 4);
    switch (sort) {
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "newest": list = [...list].reverse(); break;
      default: list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [search, cats, occs, flavs, priceMax, highRated, sort]);

  const clearAll = () => {
    setCats([]);
    setOccs([]);
    setFlavs([]);
    setPriceMax(2000);
    setHighRated(false);
  };

  const FiltersPanel = (
    <aside className="space-y-6 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Filters</h3>
        <button
          onClick={clearAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Category</p>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c.v} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={cats.includes(c.v)}
                onCheckedChange={() => toggle(cats, c.v, setCats)}
              />
              {c.l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Price up to ₹{priceMax}</p>
        <Slider
          value={[priceMax]}
          min={0}
          max={2000}
          step={50}
          onValueChange={(v) => setPriceMax(v[0])}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Occasion</p>
        <div className="space-y-2">
          {OCCASIONS.map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={occs.includes(o.v)}
                onCheckedChange={() => toggle(occs, o.v, setOccs)}
              />
              {o.l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Flavour</p>
        <div className="space-y-2">
          {FLAVOURS.map((f) => (
            <label key={f.v} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={flavs.includes(f.v)}
                onCheckedChange={() => toggle(flavs, f.v, setFlavs)}
              />
              {f.l}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md bg-secondary/60 p-3">
        <span className="text-sm font-medium">4★ &amp; above only</span>
        <Switch checked={highRated} onCheckedChange={setHighRated} />
      </div>
    </aside>
  );

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <header className="mb-6">
          <h1 className="font-display text-4xl font-bold">Our Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse {PRODUCTS.length} freshly baked products from our Bandra kitchen.
          </p>
        </header>

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cakes, pastries..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="lg:hidden" onClick={() => setDrawer(true)}>
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popularity</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden rounded-md border border-border bg-card p-1 md:flex">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "grid size-8 place-items-center rounded",
                view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
              aria-label="Grid view"
            >
              <Grid3x3 className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "grid size-8 place-items-center rounded",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>
          <p className="ml-auto text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">{FiltersPanel}</div>

          <div>
            {loading ? (
              <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-secondary text-3xl">🥐</div>
                <h3 className="mt-4 font-display text-xl font-semibold">Nothing found</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try removing some filters or searching for something else.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} variant={view} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-background p-4 shadow-warm-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Filters</h3>
              <button
                onClick={() => setDrawer(false)}
                className="grid size-9 place-items-center rounded-full bg-secondary"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{FiltersPanel}</div>
            <Button className="mt-4" size="lg" onClick={() => setDrawer(false)}>
              Show {results.length} results
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
