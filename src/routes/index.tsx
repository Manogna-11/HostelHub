import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Bot,
  Wrench,
  Bell,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  GraduationCap,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Wrench, title: "Smart Complaints", desc: "AI auto-classifies category, priority & summary for every complaint." },
  { icon: Bot, title: "HostelHub Assistant", desc: "A 24/7 AI chatbot for rules, mess timings & portal help." },
  { icon: Bell, title: "Notice Summaries", desc: "AI condenses every notice into key points and deadlines." },
  { icon: MessageSquare, title: "Sentiment Analysis", desc: "Feedback is scored positive, neutral or negative automatically." },
  { icon: BarChart3, title: "Live Analytics", desc: "Occupancy, complaint and feedback trends in beautiful charts." },
  { icon: ShieldCheck, title: "Role-based Access", desc: "Separate secure dashboards for students and administrators." },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="HostelHub AI" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">HostelHub AI</span>
        </div>
        <Button asChild variant="default">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center lg:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Bot className="h-3.5 w-3.5" /> Powered by Artificial Intelligence
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Intelligent Hostel Management,{" "}
          <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">reimagined</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          HostelHub AI streamlines complaints, rooms, notices, mess and feedback for students and administrators — with
          smart AI working behind every feature.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="stat-card flex flex-col p-6 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Students</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Complaints, room, mess, notices & AI assistant.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild><Link to="/student/login">Student Login</Link></Button>
              <Button asChild variant="outline"><Link to="/student/register">Student Registration</Link></Button>
            </div>
          </div>
          <div className="stat-card flex flex-col p-6 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Administrators</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Manage students, rooms, complaints & analytics.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild><Link to="/admin/login">Administrator Login</Link></Button>
              <Button asChild variant="outline"><Link to="/admin/register">Administrator Registration</Link></Button>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="stat-card p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-6 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" /> HostelHub AI — Intelligent Hostel Management System
        </div>
      </footer>
    </div>
  );
}
