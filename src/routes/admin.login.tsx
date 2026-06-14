import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginEmail } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Administrator Login — HostelHub AI" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const resolve = useServerFn(resolveLoginEmail);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return toast.error("Enter your credentials.");
    setLoading(true);
    try {
      const { email } = await resolve({ data: { identifier, role: "admin" } });
      if (!email) {
        setLoading(false);
        return toast.error("No administrator account found for that ID or email.");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back, Administrator!");
      navigate({ to: "/dashboard" });
    } catch {
      setLoading(false);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="HostelHub AI" width={40} height={40} className="h-10 w-10 rounded-lg bg-white/90 p-1" />
          <span className="text-xl font-bold">HostelHub AI</span>
        </Link>
        <div>
          <ShieldCheck className="mb-4 h-10 w-10" />
          <h2 className="text-3xl font-bold leading-tight">Administrator Console</h2>
          <p className="mt-3 max-w-md text-background/70">
            Manage students, rooms, complaints, notices, mess menus and view live analytics.
          </p>
        </div>
        <p className="text-sm text-background/60">© 2026 HostelHub AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="stat-card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">Administrator Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with your Admin ID or email.</p>
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="aid">Admin ID or Email</Label>
                <Input id="aid" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ap">Password</Label>
                <Input id="ap" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Need an admin account?{" "}
              <Link to="/admin/register" className="font-semibold text-primary hover:underline">
                Register as Administrator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
