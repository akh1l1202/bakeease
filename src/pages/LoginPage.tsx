import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "admin@bakeease.com";

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
  const { login, register, loginWithGoogle } = useAuth();

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
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
      navigate({ to: isAdmin ? "/admin" : "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    try {
      await register({ fullName: rName, email: rEmail, phone: rPhone, password: rPw });
      toast.success("Account created! Check your email to confirm.");
      navigate({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
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

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
                </svg>
                Continue with Google
              </Button>

              <p className="pt-1 text-center text-xs text-muted-foreground">
                Tip: sign up with <code className="rounded bg-secondary px-1">admin@bakeease.com</code> for admin access
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
