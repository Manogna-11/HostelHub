import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminGuard } from "@/components/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  component: () => (
    <AdminGuard>
      <Rooms />
    </AdminGuard>
  ),
});

type RoomForm = {
  id?: string;
  room_number: string;
  capacity: number;
  occupied_count: number;
  floor: number;
  room_type: string;
  status: string;
};
const empty: RoomForm = { room_number: "", capacity: 2, occupied_count: 0, floor: 1, room_type: "Standard", status: "available" };
const STATUSES = ["available", "occupied", "full", "maintenance"];

function Rooms() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RoomForm>(empty);

  const { data: rooms } = useQuery({
    queryKey: ["rooms-admin"],
    queryFn: async () => (await supabase.from("rooms").select("*").order("room_number")).data ?? [],
  });

  const save = async () => {
    if (!form.room_number.trim()) return toast.error("Room number is required.");
    const payload = {
      room_number: form.room_number,
      capacity: form.capacity,
      occupied_count: form.occupied_count,
      floor: form.floor,
      room_type: form.room_type,
      status: form.status as never,
    };
    const { error } = form.id
      ? await supabase.from("rooms").update(payload).eq("id", form.id)
      : await supabase.from("rooms").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Room updated." : "Room added.");
    setForm(empty);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["rooms-admin"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) return toast.error("Delete failed.");
    toast.success("Room deleted.");
    qc.invalidateQueries({ queryKey: ["rooms-admin"] });
  };

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Add, edit and manage hostel rooms"
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> Add Room</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit room" : "Add room"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Room Number"><Input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} /></Fld>
                <Fld label="Room Type"><Input value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} /></Fld>
                <Fld label="Capacity"><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></Fld>
                <Fld label="Occupied"><Input type="number" value={form.occupied_count} onChange={(e) => setForm({ ...form, occupied_count: +e.target.value })} /></Fld>
                <Fld label="Floor"><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: +e.target.value })} /></Fld>
                <Fld label="Status">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Fld>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms?.map((r) => (
          <div key={r.id} className="stat-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><BedDouble className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold">Room {r.room_number}</div>
                  <div className="text-xs text-muted-foreground">{r.room_type} · Floor {r.floor}</div>
                </div>
              </div>
              <StatusBadge value={r.status} />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">Occupancy: <strong className="text-foreground">{r.occupied_count}/{r.capacity}</strong></div>
            <div className="mt-3 flex gap-1.5">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setForm({ id: r.id, room_number: r.room_number, capacity: r.capacity, occupied_count: r.occupied_count, floor: r.floor, room_type: r.room_type, status: r.status }); setOpen(true); }}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
