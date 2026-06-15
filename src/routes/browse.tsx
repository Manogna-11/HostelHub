import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, ArrowLeft, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { aiHostelSearch } from "@/lib/ai.functions";
import { FACILITIES, HOSTEL_TYPE_LABEL, type HostelType } from "@/lib/hostels";
import { HostelCard, type HostelCardData } from "@/components/hostel-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Student Hostels & PGs — HostelHub" },
      { name: "description", content: "Search and filter student hostels and PGs by city, college, budget, gender and amenities." },
    ],
  }),
  component: Browse,
});

type Row = HostelCardData & { city: string | null; college_name: string | null };

function Browse() {
  const [all, setAll] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const [text, setText] = useState("");
  const [city, setCity] = useState<string>("");
  const [gender, setGender] = useState<HostelType | "">("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [facilities, setFacilities] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: hostels } = await supabase
        .from("hostels")
        .select("id,name,city,college_name,distance_from_college,hostel_type,single_fee,double_fee,triple_fee,rating,review_count,facilities")
        .eq("is_published", true)
        .order("rating", { ascending: false });
      const ids = (hostels ?? []).map((h) => h.id);
      const imgMap: Record<string, string> = {};
      if (ids.length) {
        const { data: imgs } = await supabase
          .from("hostel_images")
          .select("hostel_id,url,sort_order")
          .in("hostel_id", ids)
          .order("sort_order", { ascending: true });
        (imgs ?? []).forEach((im) => {
          if (!imgMap[im.hostel_id]) imgMap[im.hostel_id] = im.url;
        });
      }
      setAll((hostels ?? []).map((h) => ({ ...(h as Row), image: imgMap[h.id] ?? null })));
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() => Array.from(new Set(all.map((h) => h.city).filter(Boolean))) as string[], [all]);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    const budget = maxBudget ? Number(maxBudget) : null;
    return all.filter((h) => {
      if (q) {
        const hay = `${h.name} ${h.city ?? ""} ${h.college_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (city && h.city !== city) return false;
      if (gender && h.hostel_type !== gender) return false;
      if (budget) {
        const fees = [h.single_fee, h.double_fee, h.triple_fee].filter((f): f is number => f != null);
        if (!fees.some((f) => f <= budget)) return false;
      }
      if (facilities.length) {
        const f = (h.facilities ?? {}) as Record<string, boolean>;
        if (!facilities.every((key) => f[key])) return false;
      }
      return true;
    });
  }, [all, text, city, gender, maxBudget, facilities]);

  const toggleFacility = (key: string) =>
    setFacilities((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const clearAll = () => {
    setText(""); setCity(""); setGender(""); setMaxBudget(""); setFacilities([]);
  };

  const runAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiHostelSearch({ data: { query: aiQuery } });
      clearAll();
      if (res.city) setCity(cities.find((c) => c.toLowerCase() === res.city!.toLowerCase()) ?? "");
      if (res.gender) setGender(res.gender as HostelType);
      if (res.maxBudget) setMaxBudget(String(res.maxBudget));
      if (res.facilities?.length) setFacilities(res.facilities.filter((f) => FACILITIES.some((x) => x.key === f)));
      if (res.college || res.keywords) setText(res.college || res.keywords);
      toast.success("AI applied your search filters");
    } catch {
      toast.error("AI search is busy. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="HostelHub" width={32} height={32} className="h-8 w-8" />
            <span className="hidden text-lg font-bold sm:inline">HostelHub</span>
          </Link>
          <div className="relative flex-1 max-w-xl">
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAiSearch()}
              placeholder="Ask AI: girls hostel near VIT under ₹6000"
              className="pl-9 pr-24"
            />
            <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 gap-1" onClick={runAiSearch} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Search
            </Button>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-6">
        {/* Filters */}
        <aside className="stat-card h-fit p-5 lg:sticky lg:top-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> Filters</h2>
            <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear</button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Name, city, college" className="pl-8" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hostel Type</Label>
              <select value={gender} onChange={(e) => setGender(e.target.value as HostelType | "")} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Any</option>
                {(Object.keys(HOSTEL_TYPE_LABEL) as HostelType[]).map((t) => <option key={t} value={t}>{HOSTEL_TYPE_LABEL[t]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Budget (₹/mo)</Label>
              <Input type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="e.g. 8000" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Amenities</Label>
              <div className="space-y-2">
                {FACILITIES.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={facilities.includes(f.key)} onCheckedChange={() => toggleFacility(f.key)} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{loading ? "Loading hostels…" : `${filtered.length} hostels available`}</h1>
              <p className="text-sm text-muted-foreground">Student hostels & PG accommodations</p>
            </div>
          </div>

          {(city || gender || maxBudget || facilities.length > 0 || text) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {[city && city, gender && HOSTEL_TYPE_LABEL[gender as HostelType], maxBudget && `≤ ₹${maxBudget}`, text && `"${text}"`]
                .filter(Boolean)
                .map((chip, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                    {chip as string}
                  </span>
                ))}
              <button onClick={clearAll} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent">
                <X className="h-3 w-3" /> Reset
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="stat-card aspect-[4/3] animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="stat-card flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No hostels match your filters</p>
              <p className="text-sm text-muted-foreground">Try adjusting or clearing your filters.</p>
              <Button onClick={clearAll} variant="outline" className="mt-4">Clear filters</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((h) => <HostelCard key={h.id} hostel={h} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
