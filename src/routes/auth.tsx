import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

type AuthSearch = { role?: AppRole; mode?: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Get Started — HostelHub" }] }),
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    role: search.role === "admin" || search.role === "student" ? search.role : undefined,
    mode: search.mode === "signup" ? "signup" : search.mode === "login" ? "login" : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [role, setRole] = useState<AppRole | null>(search.role ?? null);

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
