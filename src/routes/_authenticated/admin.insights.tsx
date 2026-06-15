import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Wrench, Star, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { analyzeComplaints, analyzeReviews } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/insights")({
  component: AdminInsights,
});

function AdminInsights() {
  const { hostel } = useMyHostel();
  const [cLoading, setCLoading] = useState(false);
  const [rLoading, setRLoading] = useState(false);
  const [complaintResult, setComplaintResult] = useState<{ summary: string; urgent: string[]; recurring: string[] } | null>(null);
  const [reviewResult, setReviewResult] = useState<{ positive: string; negative: string; suggestions: string[] } | null>(null);

  const runComplaints = async () => {
    if (!hostel) return;
    setCLoading(true);
    try {
      const { data } = await supabase.from("complaints").select("title,description").eq("hostel_id", hostel.id).limit(60);
      const res = await analyzeComplaints({ data: { complaints: (data ?? []).map((c) => ({ title: c.title, description: c.description ?? "" })) } });
      setComplaintResult(res);
    } catch { toast.error("AI analysis failed. Try again."); } finally { setCLoading(false); }
  };

  const runReviews = async () => {
    if (!hostel) return;
    setRLoading(true);
    try {
      const { data } = await supabase.from("reviews").select("rating,comment").eq("hostel_id", hostel.id).limit(60);
      const res = await analyzeReviews({ data: { reviews: (data ?? []).map((r) => ({ rating: r.rating, comment: r.comment ?? "" })) } });
      setReviewResult(res);
    } catch { toast.error("AI analysis failed. Try again."); } finally { setRLoading(false); }
  };

  return (
    <div>
      <PageHeader title="AI Insights" description="AI-powered analysis of complaints and reviews." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="stat-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-primary" /> Complaint Analysis</h2>
            <Button size="sm" variant="outline" className="gap-1" onClick={runComplaints} disabled={cLoading}>
              {cLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />} Analyze
            </Button>
          </div>
          {complaintResult ? (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">{complaintResult.summary}</p>
              <Block icon={AlertTriangle} title="Urgent issues" items={complaintResult.urgent} tone="text-destructive" />
              <Block icon={RotateCcw} title="Recurring issues" items={complaintResult.recurring} tone="text-warning" />
            </div>
          ) : <p className="text-sm text-muted-foreground">Click Analyze to categorize complaints and detect urgent and recurring issues.</p>}
        </div>

        <div className="stat-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><Star className="h-4 w-4 text-primary" /> Review Sentiment</h2>
            <Button size="sm" variant="outline" className="gap-1" onClick={runReviews} disabled={rLoading}>
              {rLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />} Analyze
            </Button>
          </div>
          {reviewResult ? (
            <div className="space-y-4 text-sm">
              <div><p className="mb-1 font-medium text-success">What students love</p><p className="text-muted-foreground">{reviewResult.positive}</p></div>
              <div><p className="mb-1 font-medium text-destructive">Common complaints</p><p className="text-muted-foreground">{reviewResult.negative}</p></div>
              <Block icon={RotateCcw} title="Improvement suggestions" items={reviewResult.suggestions} tone="text-primary" />
            </div>
          ) : <p className="text-sm text-muted-foreground">Click Analyze for positive/negative summaries and improvement suggestions.</p>}
        </div>
      </div>
    </div>
  );
}

function Block({ icon: Icon, title, items, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className={`mb-1 flex items-center gap-1.5 font-medium ${tone}`}><Icon className="h-4 w-4" /> {title}</p>
      <ul className="ml-1 space-y-1">
        {items.map((it, i) => <li key={i} className="text-muted-foreground">• {it}</li>)}
      </ul>
    </div>
  );
}
