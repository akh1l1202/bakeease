import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
}

const CATEGORY_LABELS: Record<Product["category"], string> = {
  cakes: "Cake",
  cupcakes: "Cupcake",
  pastries: "Pastry",
  bread: "Bread",
  custom: "Custom",
};

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const { add } = useCart();

  if (variant === "list") {
    return (
      <article className="group flex gap-4 rounded-xl border border-border bg-card p-3 shadow-warm-sm transition-all hover:shadow-warm">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
            <VegDot isVeg={product.isVeg} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              <p className="text-lg font-bold text-primary">₹{product.price}</p>
              <StarRating value={product.rating} size={12} showValue />
            </div>
            <Button
              size="sm"
              onClick={() => {
                add(product);
                toast.success(`${product.name} added to cart`);
              }}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-warm-sm transition-all hover:-translate-y-1 hover:shadow-warm">
      <div className="relative aspect-square overflow-hidden bg-cream-deep">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs font-medium backdrop-blur-sm"
          )}
        >
          {CATEGORY_LABELS[product.category]}
        </span>
        <div className="absolute right-2 top-2">
          <VegDot isVeg={product.isVeg} />
        </div>
        {product.bestSeller && (
          <span className="absolute bottom-2 left-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
            Best Seller
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-display text-base font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">₹{product.price}</span>
          <StarRating value={product.rating} size={12} showValue />
        </div>
        <Button
          className="mt-3 w-full"
          onClick={() => {
            add(product);
            toast.success(`${product.name} added to cart`);
          }}
        >
          <Plus className="size-4" /> Add to Cart
        </Button>
      </div>
    </article>
  );
}

function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-sm border-2 bg-card",
        isVeg ? "border-success" : "border-destructive"
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          isVeg ? "bg-success" : "bg-destructive"
        )}
      />
    </span>
  );
}
