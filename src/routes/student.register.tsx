import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/student/register")({
  head: () => ({ meta: [{ title: "Student Registration — HostelHub AI" }] }),
  component: StudentRegister,
});

function StudentRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reg, setReg] = useState({
    name: "",
    student_id: "",
    email: "",
    phone: "",
    gender: "",
    room_number: "",
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
          role: "student",
          name: reg.name,
          student_id: reg.student_id,
          phone: reg.phone,
          gender: reg.gender,
          room_number: reg.room_number,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Student account created! Please sign in.");
    navigate({ to: "/student/login" });
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
          <h2 className="text-3xl font-bold leading-tight">Join as a Student</h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Create your student account to manage hostel life with AI-powered tools.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© 2026 HostelHub AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/student/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Student Login
          </Link>
          <div className="stat-card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">Student Registration</h1>
            <form onSubmit={handleRegister} className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Full Name" className="col-span-2">
                <Input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} required />
              </Field>
              <Field label="Student ID">
                <Input value={reg.student_id} onChange={(e) => setReg({ ...reg, student_id: e.target.value })} />
              </Field>
              <Field label="Phone Number">
                <Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
              </Field>
              <Field label="Email Address" className="col-span-2">
                <Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required />
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
              <Field label="Room Number (optional)">
                <Input value={reg.room_number} onChange={(e) => setReg({ ...reg, room_number: e.target.value })} />
              </Field>
              <Field label="Password">
                <Input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} required />
              </Field>
              <Field label="Confirm Password">
                <Input type="password" value={reg.confirm} onChange={(e) => setReg({ ...reg, confirm: e.target.value })} required />
              </Field>
              <Button type="submit" className="col-span-2 w-full" disabled={loading}>
                {loading ? "Creating…" : "Create student account"}
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
