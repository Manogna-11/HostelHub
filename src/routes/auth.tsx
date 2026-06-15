import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Get Started — HostelHub" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <div className="mb-8 flex items-center gap-2.5">
        <img src={logo} alt="HostelHub" width={40} height={40} className="h-10 w-10" />
        <span className="text-xl font-bold">HostelHub</span>
      </div>

      {!role ? (
        <>
          <h1 className="mb-2 text-2xl font-bold">How would you like to continue?</h1>
          <p className="mb-8 text-muted-foreground">Choose your role to get started.</p>
          <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
            <RoleCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Continue as Student"
              desc="Search hostels, compare prices, read reviews and send inquiries."
              tone="primary"
              onClick={() => setRole("student")}
            />
            <RoleCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Continue as Hostel Administrator"
              desc="List your hostel, manage rooms, residents, inquiries and analytics."
              tone="foreground"
              onClick={() => setRole("admin")}
            />
          </div>
        </>
      ) : (
        <AuthForm role={role} onBack={() => setRole(null)} />
      )}
    </div>
  );
}

function RoleCard({
  icon, title, desc, tone, onClick,
}: {
  icon: React.ReactNode; title: string; desc: string; tone: "primary" | "foreground"; onClick: () => void;
}) {
  const badge = tone === "primary" ? "bg-primary/10 text-primary" : "bg-foreground/10 text-foreground";
  return (
    <button onClick={onClick} className="stat-card flex flex-col p-6 text-center transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${badge}`}>{icon}</div>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </button>
  );
}

function AuthForm({ role, onBack }: { role: AppRole; onBack: () => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const roleLabel = role === "admin" ? "Hostel Administrator" : "Student";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please enter your email and password.");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { role, name: form.name },
          },
        });
        if (error) throw error;
        // Try immediate sign-in (auto-confirm enabled).
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInErr) {
          toast.success("Account created! Please sign in.");
          setMode("login");
          return;
        }
        toast.success("Welcome to HostelHub!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Signed in!");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error("Google sign-in failed.");
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  const accent = role === "admin" ? "bg-foreground/10 text-foreground" : "bg-primary/10 text-primary";

  return (
    <div className="w-full max-w-md">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Choose a different role
      </button>
      <div className="stat-card p-6">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          {role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
        </div>
        <h1 className="text-xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">as a {roleLabel}</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Email Address</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" className="w-full gap-2" onClick={googleSignIn}>
          <GoogleIcon /> Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="font-semibold text-primary hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
