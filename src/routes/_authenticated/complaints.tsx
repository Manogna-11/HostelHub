import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { classifyComplaint } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/complaints")({
  component: Complaints,
});

const STATUSES = ["open", "in_progress", "resolved"];

function Complaints() {
  const { user, isAdmin, profile } = useAuth();
  const qc = useQueryClient();
  const classify = useServerFn(classifyComplaint);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const { data: complaints } = useQuery({
    queryKey: ["complaints", isAdmin],
    queryFn: async () => {
      const q = supabase.from("complaints").select("*").order("created_at", { ascending: false });
      const { data } = isAdmin ? await q : await q.eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error("Fill in all fields.");
    setSubmitting(true);
    try {
      toast.info("AI is analyzing your complaint…");
      const ai = await classify({ data: { title: form.title, description: form.description } });
      const { error } = await supabase.from("complaints").insert({
        user_id: user!.id,
        title: form.title,
        description: form.description,
        category: ai.category as never,
        priority: ai.priority as never,
        ai_summary: ai.summary,
        room_number: profile?.room_number ?? null,
      });
      if (error) throw error;
      toast.success(`Complaint filed · ${ai.category} · ${ai.priority} priority`);
      setForm({ title: "", description: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["complaints"] });
    } catch {
      toast.error("Could not submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("complaints").update({ status: status as never }).eq("id", id);
    if (error) return toast.error("Update failed.");
    toast.success("Status updated.");
    qc.invalidateQueries({ queryKey: ["complaints"] });
  };

  return (
    <div>
      <PageHeader
        title={isAdmin ? "All Complaints" : "My Complaints"}
        description={isAdmin ? "Review and resolve maintenance complaints" : "Submit and track your complaints"}
        action={
          !isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-1.5 h-4 w-4" /> New Complaint</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit a complaint</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fan not working" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue…" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary">
                    <Sparkles className="h-4 w-4 shrink-0" /> AI will auto-detect category, priority and a summary.
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={submit} disabled={submitting}>{submitting ? "Analyzing…" : "Submit"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {(!complaints || complaints.length === 0) && (
        <div className="stat-card p-12 text-center">
          <Wrench className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No complaints found.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {complaints?.map((c) => (
          <div key={c.id} className="stat-card p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{c.title}</h3>
              <StatusBadge value={c.status} />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge value={c.category} />
              <StatusBadge value={c.priority} />
              {c.room_number && <span className="text-xs text-muted-foreground">Room {c.room_number}</span>}
            </div>
            {c.ai_summary && (
              <div className="mt-3 flex gap-2 rounded-lg bg-accent/50 p-3 text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span><strong className="text-primary">AI Summary:</strong> {c.ai_summary}</span>
              </div>
            )}
            {isAdmin && (
              <div className="mt-3">
                <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
