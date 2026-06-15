import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Mail, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: AdminInquiries,
});

type Inquiry = Tables<"inquiries">;
const STATUSES = ["new", "contacted", "converted"];

function AdminInquiries() {
  const { hostel } = useMyHostel();
  const [items, setItems] = useState<Inquiry[]>([]);

  const load = async () => {
    if (!hostel) return;
    const { data } = await supabase.from("inquiries").select("*").eq("hostel_id", hostel.id).order("created_at", { ascending: false });
    setItems((data as Inquiry[]) ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hostel]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    load();
  };

  return (
    <div>
      <PageHeader title="Inquiries" description="Student inquiries about your hostel." />
      {items.length === 0 ? (
        <div className="stat-card flex flex-col items-center py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="stat-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{q.name}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {q.phone && <a href={`tel:${q.phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-3.5 w-3.5" /> {q.phone}</a>}
                    {q.email && <a href={`mailto:${q.email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="h-3.5 w-3.5" /> {q.email}</a>}
                  </div>
                </div>
                <select value={q.status} onChange={(e) => setStatus(q.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {q.message && <p className="mt-3 text-sm">{q.message}</p>}
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge value={q.status} />
                <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
