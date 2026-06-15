import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/inquiries")({
  component: MyInquiries,
});

type Row = { id: string; message: string | null; status: string; created_at: string; hostel_id: string; hostels: { name: string } | null };

function MyInquiries() {
  const { user } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("inquiries")
      .select("id,message,status,created_at,hostel_id,hostels(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as unknown as Row[]) ?? []); setLoading(false); });
  }, [user]);

  return (
    <div>
      <PageHeader title="My Inquiries" description="Inquiries you've sent to hostels." action={<Button asChild variant="outline"><Link to="/browse">Browse hostels</Link></Button>} />
      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="stat-card flex flex-col items-center py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">You haven't sent any inquiries yet.</p>
          <Button asChild className="mt-4 gap-1"><Link to="/browse"><Search className="h-4 w-4" /> Find hostels</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="stat-card p-5">
              <div className="flex items-center justify-between">
                <Link to="/hostel/$id" params={{ id: q.hostel_id }} className="font-semibold hover:text-primary">{q.hostels?.name ?? "Hostel"}</Link>
                <StatusBadge value={q.status} />
              </div>
              {q.message && <p className="mt-2 text-sm text-muted-foreground">{q.message}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
