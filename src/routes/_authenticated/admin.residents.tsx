import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Users, BedDouble, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { PageHeader, StatCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/residents")({
  component: AdminResidents,
});

type Resident = Tables<"residents">;

function AdminResidents() {
  const { hostel } = useMyHostel();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [beds, setBeds] = useState({ total: 0, occupied: 0 });
  const [form, setForm] = useState({ name: "", phone: "", room_number: "", joining_date: "", fee_status: "pending" });

  const load = async () => {
    if (!hostel) return;
    const [{ data: res }, { data: rooms }] = await Promise.all([
      supabase.from("residents").select("*").eq("hostel_id", hostel.id).order("created_at", { ascending: false }),
      supabase.from("rooms").select("capacity,occupied_beds").eq("hostel_id", hostel.id),
    ]);
    setResidents((res as Resident[]) ?? []);
    setBeds({
      total: (rooms ?? []).reduce((s, r) => s + r.capacity, 0),
      occupied: (rooms ?? []).reduce((s, r) => s + r.occupied_beds, 0),
    });
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hostel]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel || !form.name) return;
    const { error } = await supabase.from("residents").insert({
      hostel_id: hostel.id, name: form.name, phone: form.phone, room_number: form.room_number,
      joining_date: form.joining_date || null, fee_status: form.fee_status,
    });
    if (error) return toast.error(error.message);
    toast.success("Resident added");
    setForm({ name: "", phone: "", room_number: "", joining_date: "", fee_status: "pending" });
    load();
  };

  const remove = async (id: string) => { await supabase.from("residents").delete().eq("id", id); load(); };
  const toggleFee = async (r: Resident) => {
    await supabase.from("residents").update({ fee_status: r.fee_status === "paid" ? "pending" : "paid" }).eq("id", r.id);
    load();
  };

  return (
    <div>
      <PageHeader title="Resident Management" description="Track residents, room allocation and fee status." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Residents" value={residents.length} icon={Users} />
        <StatCard label="Occupied Beds" value={beds.occupied} icon={UserCheck} tint="primary" />
        <StatCard label="Available Beds" value={Math.max(0, beds.total - beds.occupied)} icon={BedDouble} tint="success" />
      </div>

      <form onSubmit={add} className="stat-card mb-6 grid gap-3 p-5 sm:grid-cols-6">
        <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Room</Label><Input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Joining Date</Label><Input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Fee Status</Label>
          <select value={form.fee_status} onChange={(e) => setForm({ ...form, fee_status: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
            <option value="pending">Pending</option><option value="paid">Paid</option>
          </select>
        </div>
        <div className="flex items-end"><Button type="submit" className="w-full gap-1"><Plus className="h-4 w-4" /> Add</Button></div>
      </form>

      <div className="stat-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground">
            <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Room</th><th className="p-3">Joining</th><th className="p-3">Fee</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.room_number}</td>
                <td className="p-3">{r.joining_date ?? "—"}</td>
                <td className="p-3"><button onClick={() => toggleFee(r)}><StatusBadge value={r.fee_status === "paid" ? "resolved" : "open"} className="capitalize">{r.fee_status}</StatusBadge></button></td>
                <td className="p-3"><Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
            {residents.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No residents yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
