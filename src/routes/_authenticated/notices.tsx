import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Search, Sparkles, Trash2, Pencil, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { summarizeNotice } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/notices")({
  component: Notices,
});

type NoticeForm = { id?: string; title: string; description: string; priority: string };
const empty: NoticeForm = { title: "", description: "", priority: "medium" };

function Notices() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const summarize = useServerFn(summarizeNotice);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NoticeForm>(empty);

  const { data: notices } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => (await supabase.from("notices").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = (notices ?? []).filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase()),
  );

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error("Fill in all fields.");
    setSaving(true);
    try {
      toast.info("AI is summarizing the notice…");
      const ai = await summarize({ data: { title: form.title, description: form.description } });
      const summaryBlock = [
        ai.summary,
        ai.key_points.length ? "Key points: " + ai.key_points.join("; ") : "",
        ai.deadlines.length ? "Deadlines: " + ai.deadlines.join("; ") : "",
      ].filter(Boolean).join("\n");
      const payload = { title: form.title, description: form.description, priority: form.priority as never, ai_summary: summaryBlock };
      const { error } = form.id
        ? await supabase.from("notices").update(payload).eq("id", form.id)
        : await supabase.from("notices").insert(payload);
      if (error) throw error;
      toast.success(form.id ? "Notice updated." : "Notice published.");
      setForm(empty);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["notices"] });
    } catch {
      toast.error("Could not save notice.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast.error("Delete failed.");
    toast.success("Notice deleted.");
    qc.invalidateQueries({ queryKey: ["notices"] });
  };

  return (
    <div>
      <PageHeader
        title="Notices"
        description="Hostel announcements with AI summaries"
        action={
          isAdmin && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
              <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> New Notice</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{form.id ? "Edit notice" : "Create notice"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Description</Label>
                    <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["low", "medium", "high"].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary">
                    <Sparkles className="h-4 w-4 shrink-0" /> AI generates a summary, key points and deadlines.
                  </div>
                </div>
                <DialogFooter><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search notices…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 && (
        <div className="stat-card p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No notices found.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((n) => (
          <div key={n.id} className="stat-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{n.title}</h3>
                  <StatusBadge value={n.priority} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setForm({ id: n.id, title: n.title, description: n.description, priority: n.priority }); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{n.description}</p>
            {n.ai_summary && (
              <div className="mt-3 flex gap-2 rounded-lg bg-accent/50 p-3 text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="whitespace-pre-line"><strong className="text-primary">AI Summary:</strong> {n.ai_summary}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
