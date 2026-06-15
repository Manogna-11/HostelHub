import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { PageHeader } from "@/components/page-header";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: AdminReviews,
});

type Review = Tables<"reviews">;

function AdminReviews() {
  const { hostel } = useMyHostel();
  const [items, setItems] = useState<Review[]>([]);

  useEffect(() => {
    if (!hostel) return;
    supabase.from("reviews").select("*").eq("hostel_id", hostel.id).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Review[]) ?? []));
  }, [hostel]);

  const avg = items.length ? Math.round((items.reduce((s, r) => s + r.rating, 0) / items.length) * 10) / 10 : 0;

  return (
    <div>
      <PageHeader title="Reviews" description={`${items.length} reviews · ${avg} average rating`} />
      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="stat-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.author_name ?? "Student"}</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                ))}
              </span>
            </div>
            {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
            <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {items.length === 0 && <div className="stat-card py-16 text-center text-muted-foreground">No reviews yet.</div>}
      </div>
    </div>
  );
}
