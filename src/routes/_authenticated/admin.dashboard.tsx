import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, BedDouble, TrendingUp, IndianRupee, Wrench, Inbox, Star, Sparkles, Database } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { seedDemoData } from "@/lib/seed.functions";
import { PageHeader, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/hostels";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: AdminDashboard,
});

const COLORS = ["oklch(0.55 0.2 257)", "oklch(0.72 0.15 65)", "oklch(0.6 0.17 145)", "oklch(0.58 0.22 25)"];

function AdminDashboard() {
  const { user } = useAuth();
  const { hostel, loading: hLoading } = useMyHostel();
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState({
    residents: 0, beds: 0, occupied: 0, revenue: 0, openC: 0, resolvedC: 0, inquiries: 0, rating: 0, reviews: 0,
  });
  const [complaintData, setComplaintData] = useState<{ name: string; value: number }[]>([]);
  const [ratingData, setRatingData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hLoading && !hostel) navigate({ to: "/admin/setup" });
  }, [hLoading, hostel, navigate]);

  useEffect(() => {
    if (!hostel) return;
    (async () => {
      const hid = hostel.id;
      const [{ data: rooms }, { count: residents }, { data: complaints }, { count: inquiries }, { data: reviews }] = await Promise.all([
        supabase.from("rooms").select("capacity,occupied_beds,monthly_fee").eq("hostel_id", hid),
        supabase.from("residents").select("*", { count: "exact", head: true }).eq("hostel_id", hid),
        supabase.from("complaints").select("status").eq("hostel_id", hid),
        supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("hostel_id", hid).eq("status", "new"),
        supabase.from("reviews").select("rating").eq("hostel_id", hid),
      ]);
      const beds = (rooms ?? []).reduce((s, r) => s + r.capacity, 0);
      const occupied = (rooms ?? []).reduce((s, r) => s + r.occupied_beds, 0);
      const revenue = (rooms ?? []).reduce((s, r) => s + r.occupied_beds * (r.monthly_fee ?? 0), 0);
      const openC = (complaints ?? []).filter((c) => c.status !== "resolved").length;
      const resolvedC = (complaints ?? []).filter((c) => c.status === "resolved").length;
      const ratings = (reviews ?? []).map((r) => r.rating);
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      setStats({
        residents: residents ?? 0, beds, occupied, revenue, openC, resolvedC,
        inquiries: inquiries ?? 0, rating: Math.round(avg * 10) / 10, reviews: ratings.length,
      });
      setComplaintData([{ name: "Open", value: openC }, { name: "Resolved", value: resolvedC }]);
      setRatingData([5, 4, 3, 2, 1].map((star) => ({ name: `${star}★`, value: ratings.filter((r) => r === star).length })));
      setLoading(false);
    })();
  }, [hostel]);

  const runSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedDemoData();
      toast.success(res.message ?? "Demo data added");
    } catch {
      toast.error("Could not seed demo data.");
    } finally {
      setSeeding(false);
    }
  };

  if (hLoading || !hostel || loading) return <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading dashboard…</div>;

  const occupancy = stats.beds ? Math.round((stats.occupied / stats.beds) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={hostel.name}
        description="Hostel overview & analytics"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" onClick={runSeed} disabled={seeding}>
              <Database className="h-4 w-4" /> {seeding ? "Seeding…" : "Seed demo hostels"}
            </Button>
            <Button asChild variant="outline"><Link to="/admin/hostel">Edit hostel</Link></Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Residents" value={stats.residents} icon={Users} />
        <StatCard label="Available Beds" value={Math.max(0, stats.beds - stats.occupied)} icon={BedDouble} tint="success" />
        <StatCard label="Occupancy Rate" value={`${occupancy}%`} icon={TrendingUp} tint="warning" />
        <StatCard label="Monthly Revenue" value={formatINR(stats.revenue)} icon={IndianRupee} />
        <StatCard label="Open Complaints" value={stats.openC} icon={Wrench} tint="destructive" />
        <StatCard label="Resolved Complaints" value={stats.resolvedC} icon={Wrench} tint="success" />
        <StatCard label="New Inquiries" value={stats.inquiries} icon={Inbox} tint="primary" />
        <StatCard label="Avg Rating" value={`${stats.rating} (${stats.reviews})`} icon={Star} tint="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="stat-card p-5">
          <h2 className="mb-4 font-semibold">Complaint Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={complaintData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.2 257)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card p-5">
          <h2 className="mb-4 font-semibold">Ratings Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={ratingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {ratingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 stat-card flex items-center gap-3 p-5">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Visit <Link to="/admin/insights" className="font-medium text-primary hover:underline">AI Insights</Link> for AI-generated complaint analysis and review sentiment summaries.
        </p>
      </div>
    </div>
  );
}
