import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Star, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { analyzeFeedback } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/feedback")({
  component: Feedback,
});

function Feedback() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeFeedback);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["feedback", isAdmin],
    queryFn: async () => {
      const q = supabase.from("feedback").select("*").order("created_at", { ascending: false });
      const { data } = isAdmin ? await q : await q.eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const submit = async () => {
    if (!text.trim()) return toast.error("Please write your feedback.");
    setSubmitting(true);
    try {
      toast.info("AI is analyzing sentiment…");
      const ai = await analyze({ data: { rating, text } });
      const { error } = await supabase.from("feedback").insert({
        user_id: user!.id,
        rating,
        feedback_text: text,
        sentiment: ai.sentiment as never,
        sentiment_score: ai.score,
        ai_summary: ai.summary,
      });
      if (error) throw error;
      toast.success(`Feedback submitted · ${ai.sentiment}`);
      setText("");
      setRating(5);
      qc.invalidateQueries({ queryKey: ["feedback"] });
    } catch {
      toast.error("Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Feedback" description={isAdmin ? "Student feedback with AI sentiment" : "Share your hostel experience"} />

      <div className="grid gap-6 lg:grid-cols-3">
        {!isAdmin && (
          <div className="stat-card h-fit p-5">
            <h2 className="font-semibold">Submit feedback</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}>
                      <Star className={cn("h-7 w-7 transition-colors", n <= rating ? "fill-warning text-warning" : "text-muted-foreground/40")} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Your feedback</Label>
                <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell us what you think…" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary">
                <Sparkles className="h-4 w-4 shrink-0" /> AI will detect sentiment automatically.
              </div>
              <Button className="w-full" onClick={submit} disabled={submitting}>{submitting ? "Analyzing…" : "Submit"}</Button>
            </div>
          </div>
        )}

        <div className={cn("space-y-4", isAdmin ? "lg:col-span-3" : "lg:col-span-2")}>
          {(!items || items.length === 0) && (
            <div className="stat-card p-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No feedback yet.</p>
            </div>
          )}
          {items?.map((f) => (
            <div key={f.id} className="stat-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("h-4 w-4", n <= f.rating ? "fill-warning text-warning" : "text-muted-foreground/30")} />
                  ))}
                </div>
                {f.sentiment && <StatusBadge value={f.sentiment} />}
              </div>
              <p className="mt-2 text-sm">{f.feedback_text}</p>
              {f.ai_summary && (
                <div className="mt-3 flex gap-2 rounded-lg bg-accent/50 p-3 text-xs">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span><strong className="text-primary">AI:</strong> {f.ai_summary}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
