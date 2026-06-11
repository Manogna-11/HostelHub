import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register
  const [reg, setReg] = useState({
    name: "",
    email: "",
    password: "",
    student_id: "",
    phone: "",
    gender: "",
    department: "",
    year: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in successfully");
    navigate({ to: "/dashboard" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.name || !reg.email || reg.password.length < 6) {
      return toast.error("Please fill name, email and a password (6+ characters).");
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: reg.email,
      password: reg.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: reg.name,
          student_id: reg.student_id,
          phone: reg.phone,
          gender: reg.gender,
          department: reg.department,
          year: reg.year,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Redirecting…");
    navigate({ to: "/dashboard" });
  };

  const handleForgot = async () => {
    if (!email) return toast.error("Enter your email above first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent.");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-[image:var(--gradient-primary)] p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="HostelHub AI" width={40} height={40} className="h-10 w-10 rounded-lg bg-white/90 p-1" />
          <span className="text-xl font-bold">HostelHub AI</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Manage your hostel intelligently.</h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Complaints, rooms, notices, mess and feedback — all enhanced with AI for students and administrators.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© 2026 HostelHub AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <img src={logo} alt="HostelHub AI" width={36} height={36} className="h-9 w-9" />
            <span className="text-lg font-bold">HostelHub AI</span>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="stat-card mt-4 p-6">
                <h1 className="text-xl font-bold">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">Students & admins sign in here.</p>
                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="le">Email</Label>
                    <Input id="le" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lp">Password</Label>
                    <Input id="lp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <button type="button" onClick={handleForgot} className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <div className="stat-card mt-4 p-6">
                <h1 className="text-xl font-bold">Create student account</h1>
                <form onSubmit={handleRegister} className="mt-5 grid grid-cols-2 gap-3">
                  <Field label="Full Name" className="col-span-2">
                    <Input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} required />
                  </Field>
                  <Field label="Email" className="col-span-2">
                    <Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required />
                  </Field>
                  <Field label="Password" className="col-span-2">
                    <Input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} required />
                  </Field>
                  <Field label="Student ID">
                    <Input value={reg.student_id} onChange={(e) => setReg({ ...reg, student_id: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
                  </Field>
                  <Field label="Gender">
                    <Select value={reg.gender} onValueChange={(v) => setReg({ ...reg, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Year">
                    <Select value={reg.year} onValueChange={(v) => setReg({ ...reg, year: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4"].map((y) => (
                          <SelectItem key={y} value={y}>Year {y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Department" className="col-span-2">
                    <Input value={reg.department} onChange={(e) => setReg({ ...reg, department: e.target.value })} />
                  </Field>
                  <Button type="submit" className="col-span-2 w-full" disabled={loading}>
                    {loading ? "Creating…" : "Create account"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
