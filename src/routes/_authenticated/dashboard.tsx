import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Users,
  BedDouble,
  DoorOpen,
  DoorClosed,
  Wrench,
  CheckCircle2,
  MessageSquare,
  Bell,
  UtensilsCrossed,
  Bot,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StatCard, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { claimAdminIfNone, seedDemoData } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <StudentDashboard />;
}

function todayName() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

function StudentDashboard() {
  const { profile, user } = useAuth();

  const { data } = useQuery({
    queryKey: ["student-dashboard", user?.id],
    queryFn: async () => {
      const [complaints, notices, menu, room] = await Promise.all([
        supabase.from("complaints").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("mess_menu").select("*").eq("day_of_week", todayName()).maybeSingle(),
        profile?.room_number
          ? supabase.from("rooms").select("*").eq("room_number", profile.room_number).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        complaints: complaints.data ?? [],
        notices: notices.data ?? [],
        menu: menu.data,
        room: room.data,
      };
    },
    enabled: !!user,
  });

  const pending = (data?.complaints ?? []).filter((c) => c.status !== "resolved");

  return (
    <div>
      <PageHeader title="Student Dashboard" description="Your hostel at a glance" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Room" value={profile?.room_number || "—"} icon={BedDouble} />
        <StatCard label="Pending Complaints" value={pending.length} icon={Wrench} tint="warning" />
        <StatCard label="Total Complaints" value={data?.complaints.length ?? 0} icon={MessageSquare} />
        <StatCard label="Active Notices" value={data?.notices.length ?? 0} icon={Bell} tint="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="stat-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Complaints</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/complaints">View all</Link></Button>
          </div>
          {(!data || data.complaints.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">No complaints yet.</p>
          )}
          <div className="space-y-3">
            {data?.complaints.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.title}</div>
                  <div className="text-xs capitalize text-muted-foreground">{c.category}</div>
                </div>
                <StatusBadge value={c.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="stat-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <UtensilsCrossed className="h-4 w-4 text-primary" /> Today's Mess
            </h2>
            {data?.menu ? (
              <ul className="space-y-2 text-sm">
                <MenuRow label="Breakfast" value={data.menu.breakfast} />
                <MenuRow label="Lunch" value={data.menu.lunch} />
                <MenuRow label="Snacks" value={data.menu.snacks} />
                <MenuRow label="Dinner" value={data.menu.dinner} />
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Menu not set for today.</p>
            )}
          </div>

          <div className="stat-card p-5">
            <h2 className="mb-3 font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction to="/complaints" icon={Wrench} label="Complaint" />
              <QuickAction to="/assistant" icon={Bot} label="Ask AI" />
              <QuickAction to="/notices" icon={Bell} label="Notices" />
              <QuickAction to="/feedback" icon={MessageSquare} label="Feedback" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 stat-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Bell className="h-4 w-4 text-primary" /> Recent Notices</h2>
        <div className="space-y-3">
          {data?.notices.map((n) => (
            <div key={n.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{n.title}</span>
                <StatusBadge value={n.priority} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.ai_summary || n.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuRow({ label, value }: { label: string; value: string | null }) {
  return (
    <li className="flex flex-col">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </li>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-xs font-medium transition-colors hover:bg-accent">
      <Icon className="h-5 w-5 text-primary" />
      {label}
    </Link>
  );
}

function AdminDashboard() {
  const claim = useServerFn(claimAdminIfNone);
  const seed = useServerFn(seedDemoData);

  const { data, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [students, rooms, complaints, feedback] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("rooms").select("*"),
        supabase.from("complaints").select("status"),
        supabase.from("feedback").select("sentiment,rating"),
      ]);
      return {
        students: students.count ?? 0,
        rooms: rooms.data ?? [],
        complaints: complaints.data ?? [],
        feedback: feedback.data ?? [],
      };
    },
  });

  const rooms = data?.rooms ?? [];
  const occupied = rooms.filter((r) => r.status === "occupied" || r.status === "full").length;
  const complaints = data?.complaints ?? [];
  const open = complaints.filter((c) => c.status !== "resolved").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const feedback = data?.feedback ?? [];
  const positive = feedback.filter((f) => f.sentiment === "positive").length;

  const handleSeed = async () => {
    toast.info("Generating demo data…");
    try {
      const r = await seed();
      toast.success(`Demo data ready (${r.created} students added).`);
      refetch();
    } catch {
      toast.error("Could not seed demo data.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Hostel operations overview"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => claim().then((r) => toast[r.promoted ? "success" : "info"](r.reason))}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Claim admin
            </Button>
            <Button onClick={handleSeed}>Generate demo data</Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={data?.students ?? 0} icon={Users} />
        <StatCard label="Total Rooms" value={rooms.length} icon={BedDouble} />
        <StatCard label="Occupied Rooms" value={occupied} icon={DoorClosed} tint="warning" />
        <StatCard label="Available Rooms" value={rooms.length - occupied} icon={DoorOpen} tint="success" />
        <StatCard label="Open Complaints" value={open} icon={Wrench} tint="destructive" />
        <StatCard label="Resolved Complaints" value={resolved} icon={CheckCircle2} tint="success" />
        <StatCard label="Total Feedback" value={feedback.length} icon={MessageSquare} />
        <StatCard label="Positive Feedback" value={positive} icon={CheckCircle2} tint="success" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction to="/admin/students" icon={Users} label="Manage Students" />
        <QuickAction to="/admin/rooms" icon={BedDouble} label="Manage Rooms" />
        <QuickAction to="/admin/analytics" icon={MessageSquare} label="View Analytics" />
        <QuickAction to="/complaints" icon={Wrench} label="Complaints" />
      </div>

      <div className="mt-6 stat-card p-6 text-center text-sm text-muted-foreground">
        Tip: Use <strong>Generate demo data</strong> to populate students, complaints and feedback, then explore the{" "}
        <Link to="/admin/analytics" className="font-medium text-primary hover:underline">Analytics</Link> dashboard.
      </div>
    </div>
  );
}
