import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/hostels";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  component: AdminRooms,
});

type Room = Tables<"rooms">;

function AdminRooms() {
  const { hostel } = useMyHostel();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({ room_number: "", capacity: "1", occupied_beds: "0", room_type: "Single Sharing", monthly_fee: "" });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!hostel) return;
    const { data } = await supabase.from("rooms").select("*").eq("hostel_id", hostel.id).order("room_number");
    setRooms((data as Room[]) ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hostel]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel || !form.room_number) return;
    setAdding(true);
    const { error } = await supabase.from("rooms").insert({
      hostel_id: hostel.id, room_number: form.room_number, capacity: Number(form.capacity),
      occupied_beds: Number(form.occupied_beds), room_type: form.room_type,
      monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : null,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success("Room added");
    setForm({ room_number: "", capacity: "1", occupied_beds: "0", room_type: "Single Sharing", monthly_fee: "" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("rooms").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <PageHeader title="Room Management" description="Manage your room inventory and bed availability." />
      <form onSubmit={add} className="stat-card mb-6 grid gap-3 p-5 sm:grid-cols-6">
        <div className="space-y-1"><Label className="text-xs">Room No.</Label><Input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} required /></div>
        <div className="space-y-1"><Label className="text-xs">Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Occupied</Label><Input type="number" value={form.occupied_beds} onChange={(e) => setForm({ ...form, occupied_beds: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Type</Label>
          <select value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
            <option>Single Sharing</option><option>Double Sharing</option><option>Triple Sharing</option>
          </select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Fee (₹)</Label><Input type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} /></div>
        <div className="flex items-end"><Button type="submit" className="w-full gap-1" disabled={adding}><Plus className="h-4 w-4" /> Add</Button></div>
      </form>

      <div className="stat-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground">
            <th className="p-3">Room</th><th className="p-3">Type</th><th className="p-3">Capacity</th><th className="p-3">Occupied</th><th className="p-3">Available</th><th className="p-3">Fee</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{r.room_number}</td>
                <td className="p-3">{r.room_type}</td>
                <td className="p-3">{r.capacity}</td>
                <td className="p-3">{r.occupied_beds}</td>
                <td className="p-3">{Math.max(0, r.capacity - r.occupied_beds)}</td>
                <td className="p-3">{formatINR(r.monthly_fee)}</td>
                <td className="p-3"><Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No rooms yet. Add your first room above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
