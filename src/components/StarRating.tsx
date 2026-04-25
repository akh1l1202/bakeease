import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  outOf?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({
  value,
  outOf = 5,
  size = 16,
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: outOf }).map((_, i) => {
          const filled = i < Math.round(value);
          const StarBtn = (
            <Star
              key={i}
              size={size}
              className={cn(
                "transition-colors",
                filled ? "fill-accent text-accent" : "text-muted-foreground/40"
              )}
            />
          );
          if (!interactive) return StarBtn;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(i + 1)}
              className="hover:scale-110 transition-transform"
              aria-label={`Rate ${i + 1} stars`}
            >
              {StarBtn}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
