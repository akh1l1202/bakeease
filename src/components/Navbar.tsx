import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/catalogue", label: "Menu" },
  { to: "/catalogue", label: "Custom Cake", search: { category: "custom" } },
  { to: "/game", label: "Game" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { count } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/home" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-bold">
            B
          </span>
          <span className="font-display text-xl font-bold text-primary">BakeEase</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l, idx) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={idx}
                to={l.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <Link
            to="/checkout"
            className="relative grid size-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70"
            aria-label="Cart"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-secondary"
              >
                <User className="size-4" />
                <span className="max-w-[120px] truncate">{user?.fullName}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button>Login</Button>
            </Link>
          )}

          <button
            className="grid size-10 place-items-center rounded-full bg-secondary md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((l, idx) => (
              <Link
                key={idx}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
