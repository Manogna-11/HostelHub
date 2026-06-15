import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  component: AdminComplaints,
});

type Complaint = Tables<"complaints">;
const STATUSES = ["pending", "in_progress", "resolved"];

function AdminComplaints() {
  const { hostel } = useMyHostel();
  const [items, setItems] = useState<Complaint[]>([]);
  const [form, setForm] = useState({ resident_name: "", title: "", description: "", category: "other", priority: "medium" });
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!hostel) return;
    const { data } = await supabase.from("complaints").select("*").eq("hostel_id", hostel.id).order("created_at", { ascending: false });
    setItems((data as Complaint[]) ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hostel]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel || !form.title) return;
    const { error } = await supabase.from("complaints").insert({ hostel_id: hostel.id, ...form, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Complaint logged");
    setForm({ resident_name: "", title: "", description: "", category: "other", priority: "medium" });
    setOpen(false);
    load();
  };

  const setStatus = async (id: string, status: string) => { await supabase.from("complaints").update({ status }).eq("id", id); load(); };

  return (
    <div>
      <PageHeader title="Complaint Management" description="Track and resolve hostel complaints." action={<Button onClick={() => setOpen((o) => !o)} className="gap-1"><Plus className="h-4 w-4" /> Log complaint</Button>} />

      {open && (
        <form onSubmit={add} className="stat-card mb-6 grid gap-3 p-5 sm:grid-cols-2">
          <div className="space-y-1"><Label className="text-xs">Resident</Label><Input value={form.resident_name} onChange={(e) => setForm({ ...form, resident_name: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-xs">Category</Label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {["electrical", "plumbing", "cleaning", "internet", "furniture", "mess", "other"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label className="text-xs">Priority</Label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {["low", "medium", "high"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><Button type="submit">Save complaint</Button></div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="stat-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{c.title}</p>
                {c.resident_name && <p className="text-xs text-muted-foreground">by {c.resident_name}</p>}
              </div>
              <div className="flex items-center gap-2">
                {c.priority && <StatusBadge value={c.priority} />}
                <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-3 flex items-center gap-2">
              {c.category && <span className="rounded-md bg-secondary px-2 py-0.5 text-xs capitalize">{c.category}</span>}
              <StatusBadge value={c.status} />
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="stat-card py-16 text-center text-muted-foreground">No complaints logged.</div>}
      </div>
    </div>
  );
}
