import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginEmail } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/student/login")({
  head: () => ({ meta: [{ title: "Student Login — HostelHub AI" }] }),
  component: StudentLogin,
});

function StudentLogin() {
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
      const { email } = await resolve({ data: { identifier, role: "student" } });
      if (!email) {
        setLoading(false);
        return toast.error("No student account found for that ID or email.");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch {
      setLoading(false);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-[image:var(--gradient-primary)] p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="HostelHub AI" width={40} height={40} className="h-10 w-10 rounded-lg bg-white/90 p-1" />
          <span className="text-xl font-bold">HostelHub AI</span>
        </Link>
        <div>
          <GraduationCap className="mb-4 h-10 w-10" />
          <h2 className="text-3xl font-bold leading-tight">Student Portal</h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Track complaints, view your room, mess menu, notices and chat with the HostelHub Assistant.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© 2026 HostelHub AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="stat-card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">Student Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with your Student ID or email.</p>
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sid">Student ID or Email</Label>
                <Input id="sid" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp">Password</Label>
                <Input id="sp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/student/register" className="font-semibold text-primary hover:underline">
                Register as Student
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
