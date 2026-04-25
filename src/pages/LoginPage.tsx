import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

export function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // register state
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPw, setRPw] = useState("");
  const [rPw2, setRPw2] = useState("");
  const [rErrors, setRErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e: Record<string, string> = {};
    if (!rName.trim()) e.name = "Full name required";
    if (!/^\d{10}$/.test(rPhone.replace(/\D/g, ""))) e.phone = "Enter a 10-digit number";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rEmail)) e.email = "Enter a valid email";
    if (rPw.length < 8) e.pw = "Min 8 characters";
    if (rPw !== rPw2) e.pw2 = "Passwords don't match";
    setRErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      const isAdmin = email.toLowerCase() === "admin@bakeease.com";
      navigate({ to: isAdmin ? "/admin" : "/home" });
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    try {
      await register({ fullName: rName, email: rEmail, phone: rPhone, password: rPw });
      toast.success("Account created!");
      navigate({ to: "/home" });
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const pwScore = strength(rPw);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
        <Link to="/home" className="mb-6 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-xl font-bold">
            B
          </span>
          <span className="font-display text-2xl font-bold text-primary">BakeEase</span>
        </Link>

        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-warm md:p-8">
          {/* Tabs */}
          <div className="mb-6 flex border-b border-border">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 pb-3 text-sm font-semibold capitalize transition-colors",
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                    aria-label="Toggle password"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Tip: use <code className="rounded bg-secondary px-1">admin@bakeease.com</code> for admin demo
              </p>
              <Link to="/home" className="block text-center text-sm text-primary hover:underline">
                Browse as guest →
              </Link>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="rname">Full Name</Label>
                <Input
                  id="rname"
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  className="mt-1"
                  placeholder="Aarav Sharma"
                />
                {rErrors.name && <p className="mt-1 text-xs text-destructive">{rErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="rphone">Phone</Label>
                <Input
                  id="rphone"
                  value={rPhone}
                  onChange={(e) => setRPhone(e.target.value)}
                  className="mt-1"
                  placeholder="98XXXXXXXX"
                  inputMode="tel"
                />
                {rErrors.phone && <p className="mt-1 text-xs text-destructive">{rErrors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="remail">Email</Label>
                <Input
                  id="remail"
                  type="email"
                  value={rEmail}
                  onChange={(e) => setREmail(e.target.value)}
                  className="mt-1"
                />
                {rErrors.email && <p className="mt-1 text-xs text-destructive">{rErrors.email}</p>}
              </div>
              <div>
                <Label htmlFor="rpw">Password</Label>
                <Input
                  id="rpw"
                  type="password"
                  value={rPw}
                  onChange={(e) => setRPw(e.target.value)}
                  className="mt-1"
                />
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i < pwScore
                          ? pwScore <= 1
                            ? "bg-destructive"
                            : pwScore === 2
                            ? "bg-warning"
                            : "bg-success"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                {rErrors.pw && <p className="mt-1 text-xs text-destructive">{rErrors.pw}</p>}
              </div>
              <div>
                <Label htmlFor="rpw2">Confirm Password</Label>
                <Input
                  id="rpw2"
                  type="password"
                  value={rPw2}
                  onChange={(e) => setRPw2(e.target.value)}
                  className="mt-1"
                />
                {rErrors.pw2 && <p className="mt-1 text-xs text-destructive">{rErrors.pw2}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
