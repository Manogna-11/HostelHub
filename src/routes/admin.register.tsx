import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin/register")({
  head: () => ({ meta: [{ title: "Administrator Registration — HostelHub AI" }] }),
  component: AdminRegister,
});

const DESIGNATIONS = ["Hostel Warden", "Assistant Warden", "Hostel Manager", "Administrator"];

function AdminRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reg, setReg] = useState({
    name: "",
    admin_id: "",
    email: "",
    phone: "",
    designation: "",
    password: "",
    confirm: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.name || !reg.email) return toast.error("Please enter your name and email.");
    if (!reg.password) return toast.error("Please enter a password.");
    if (reg.password !== reg.confirm) return toast.error("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: reg.email,
      password: reg.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          role: "admin",
          name: reg.name,
          admin_id: reg.admin_id,
          phone: reg.phone,
          designation: reg.designation,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Administrator account created! Please sign in.");
    navigate({ to: "/admin/login" });
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
          <h2 className="text-3xl font-bold leading-tight">Administrator Access</h2>
          <p className="mt-3 max-w-md text-background/70">
            Register as hostel staff to manage operations across the entire hostel.
          </p>
        </div>
        <p className="text-sm text-background/60">© 2026 HostelHub AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/admin/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Administrator Login
          </Link>
          <div className="stat-card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">Administrator Registration</h1>
            <form onSubmit={handleRegister} className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Full Name" className="col-span-2">
                <Input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} required />
              </Field>
              <Field label="Admin ID">
                <Input value={reg.admin_id} onChange={(e) => setReg({ ...reg, admin_id: e.target.value })} />
              </Field>
              <Field label="Phone Number">
                <Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
              </Field>
              <Field label="Email Address" className="col-span-2">
                <Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required />
              </Field>
              <Field label="Designation" className="col-span-2">
                <Select value={reg.designation} onValueChange={(v) => setReg({ ...reg, designation: v })}>
                  <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Password">
                <Input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} required />
              </Field>
              <Field label="Confirm Password">
                <Input type="password" value={reg.confirm} onChange={(e) => setReg({ ...reg, confirm: e.target.value })} required />
              </Field>
              <Button type="submit" className="col-span-2 w-full" disabled={loading}>
                {loading ? "Creating…" : "Create administrator account"}
              </Button>
            </form>
          </div>
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
