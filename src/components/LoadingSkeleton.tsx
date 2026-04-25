import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/60",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-warm-sm">
      <LoadingSkeleton className="aspect-square w-full" />
      <LoadingSkeleton className="mt-3 h-4 w-3/4" />
      <LoadingSkeleton className="mt-2 h-3 w-full" />
      <LoadingSkeleton className="mt-3 h-8 w-full" />
    </div>
  );
}
