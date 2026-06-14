import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — HostelHub AI" }] }),
  component: AuthChooser,
});

function AuthChooser() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <div className="mb-8 flex items-center gap-2.5">
        <img src={logo} alt="HostelHub AI" width={40} height={40} className="h-10 w-10" />
        <span className="text-xl font-bold">HostelHub AI</span>
      </div>
      <h1 className="mb-2 text-2xl font-bold">Choose how to continue</h1>
      <p className="mb-8 text-muted-foreground">Select your role to sign in or create an account.</p>

      <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        <RoleCard
          icon={<GraduationCap className="h-6 w-6" />}
          title="Student"
          desc="Track complaints, view your room, mess & notices."
          loginTo="/student/login"
          registerTo="/student/register"
          tone="primary"
        />
        <RoleCard
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Administrator"
          desc="Manage students, rooms, complaints & analytics."
          loginTo="/admin/login"
          registerTo="/admin/register"
          tone="foreground"
        />
      </div>
    </div>
  );
}

function RoleCard({
  icon, title, desc, loginTo, registerTo, tone,
}: {
  icon: React.ReactNode; title: string; desc: string;
  loginTo: "/student/login" | "/admin/login";
  registerTo: "/student/register" | "/admin/register";
  tone: "primary" | "foreground";
}) {
  const badge = tone === "primary" ? "bg-primary/10 text-primary" : "bg-foreground/10 text-foreground";
  return (
    <div className="stat-card flex flex-col p-6 text-center">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${badge}`}>{icon}</div>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Link to={loginTo} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Login
        </Link>
        <Link to={registerTo} className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent">
          Register
        </Link>
      </div>
    </div>
  );
}
