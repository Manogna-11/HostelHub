import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { AdminGuard } from "@/components/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: () => (
    <AdminGuard>
      <Analytics />
    </AdminGuard>
  ),
});

const COLORS = ["oklch(0.55 0.2 257)", "oklch(0.62 0.16 150)", "oklch(0.74 0.16 70)", "oklch(0.62 0.2 300)", "oklch(0.65 0.2 20)", "oklch(0.6 0.12 200)", "oklch(0.5 0.1 280)"];

function monthKey(d: string) {
  const dt = new Date(d);
  return dt.toLocaleString("en", { month: "short" });
}

function Analytics() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [complaints, feedback, rooms] = await Promise.all([
        supabase.from("complaints").select("status,category,created_at"),
        supabase.from("feedback").select("sentiment,rating,created_at"),
        supabase.from("rooms").select("status,occupied_count,capacity"),
      ]);
      return { complaints: complaints.data ?? [], feedback: feedback.data ?? [], rooms: rooms.data ?? [] };
    },
  });

  const complaints = data?.complaints ?? [];
  const feedback = data?.feedback ?? [];
  const rooms = data?.rooms ?? [];

  const byStatus = group(complaints, "status").map((g) => ({ name: g.key.replace("_", " "), value: g.count }));
  const byCategory = group(complaints, "category").map((g) => ({ name: g.key, value: g.count }));
  const sentiment = group(feedback, "sentiment").map((g) => ({ name: g.key || "n/a", value: g.count }));

  const occCapacity = rooms.reduce((a, r) => a + (r.capacity ?? 0), 0);
  const occUsed = rooms.reduce((a, r) => a + (r.occupied_count ?? 0), 0);
  const occupancy = [
    { name: "Occupied", value: occUsed },
    { name: "Available", value: Math.max(0, occCapacity - occUsed) },
  ];

  // monthly trends
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendMap: Record<string, { month: string; complaints: number; feedback: number }> = {};
  for (const m of months) trendMap[m] = { month: m, complaints: 0, feedback: 0 };
  complaints.forEach((c) => { const k = monthKey(c.created_at); if (trendMap[k]) trendMap[k].complaints++; });
  feedback.forEach((f) => { const k = monthKey(f.created_at); if (trendMap[k]) trendMap[k].feedback++; });
  const trend = months.map((m) => trendMap[m]).filter((t) => t.complaints || t.feedback);
  const trendData = trend.length ? trend : months.slice(0, 6).map((m) => trendMap[m]);

  return (
    <div>
      <PageHeader title="Analytics" description="Complaint, feedback and occupancy insights" />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Complaints by Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={fallback(byStatus)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {fallback(byStatus).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaints by Category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fallback(byCategory)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.2 257)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Feedback Sentiment">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={fallback(sentiment)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                {fallback(sentiment).map((e, i) => (
                  <Cell key={i} fill={e.name === "positive" ? "oklch(0.62 0.16 150)" : e.name === "negative" ? "oklch(0.58 0.22 25)" : "oklch(0.74 0.16 70)"} />
                ))}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Room Occupancy">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={occupancy} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                <Cell fill="oklch(0.55 0.2 257)" /><Cell fill="oklch(0.62 0.16 150)" />
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trends" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" /><YAxis allowDecimals={false} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="complaints" stroke="oklch(0.55 0.2 257)" strokeWidth={2} />
              <Line type="monotone" dataKey="feedback" stroke="oklch(0.62 0.16 150)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`stat-card p-5 ${className ?? ""}`}>
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function group<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const map: Record<string, number> = {};
  rows.forEach((r) => { const k = String(r[key] ?? "unknown"); map[k] = (map[k] ?? 0) + 1; });
  return Object.entries(map).map(([key, count]) => ({ key, count }));
}

function fallback(arr: { name: string; value: number }[]) {
  return arr.length ? arr : [{ name: "No data", value: 1 }];
}
