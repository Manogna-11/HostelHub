import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Sparkles, Loader2, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { aiHostelSearch } from "@/lib/ai.functions";
import { FACILITIES, HOSTEL_TYPE_LABEL, POPULAR_CITIES, publishedHostelsQueryOptions, type HostelType } from "@/lib/hostels";
import { HostelCard } from "@/components/hostel-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

type BrowseSearch = { city?: string };

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Student Hostels & PGs — HostelHub" },
      { name: "description", content: "Search and filter student hostels and PGs by city, college, budget, gender and amenities." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedHostelsQueryOptions),
  component: Browse,
});

function Browse() {
  const { city: initialCity } = Route.useSearch();
  const { user } = useAuth();
  const { data: all = [], isLoading: loading } = useQuery(publishedHostelsQueryOptions);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const [text, setText] = useState("");
  const [city, setCity] = useState<string>(initialCity ?? "");
  const [gender, setGender] = useState<HostelType | "">("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [facilities, setFacilities] = useState<string[]>([]);


  useEffect(() => {
    setCity(initialCity ?? "");
  }, [initialCity]);

  const cities = useMemo(
    () => Array.from(new Set([...POPULAR_CITIES, ...all.map((h) => h.city).filter(Boolean) as string[]])),
    [all],
  );

  const hasFilters = !!(city || gender || maxBudget || facilities.length || text);

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

  // When there are no exact matches, recommend similar hostels (relax to city, else top rated).
  const similar = useMemo(() => {
    if (filtered.length > 0) return [];
    const pool = city ? all.filter((h) => h.city === city) : all;
    const base = pool.length ? pool : all;
    return [...base].sort((a, b) => b.rating - a.rating).slice(0, 8);
  }, [filtered, all, city]);

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
              placeholder="Ask AI: girls hostel near Hyderabad under ₹7000"
              className="pl-9 pr-24"
            />
            <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 gap-1" onClick={runAiSearch} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Search
            </Button>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={user ? "/dashboard" : "/auth"}>{user ? "Dashboard" : "Sign in"}</Link>
          </Button>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pb-3 lg:px-6">
          <span className="text-xs font-semibold text-muted-foreground">Popular:</span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(city === c ? "" : c)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                city === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary hover:text-primary"
              }`}
            >
              <MapPin className="h-3 w-3" /> {c}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-6">
        {/* Filters */}
        <aside className="stat-card h-fit p-5 lg:sticky lg:top-32">
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
              <div className="grid grid-cols-2 gap-2">
                {["", ...cities].map((c) => (
                  <button
                    key={c || "all"}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors ${
                      city === c ? "border-primary bg-primary/10 text-primary" : "border-input bg-background hover:bg-accent"
                    }`}
                  >
                    {c || "All cities"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hostel Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("")}
                  className={`rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    gender === "" ? "border-primary bg-primary/10 text-primary" : "border-input bg-background hover:bg-accent"
                  }`}
                >
                  Any
                </button>
                {(Object.keys(HOSTEL_TYPE_LABEL) as HostelType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGender(t)}
                    className={`rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors ${
                      gender === t ? "border-primary bg-primary/10 text-primary" : "border-input bg-background hover:bg-accent"
                    }`}
                  >
                    {HOSTEL_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
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

          {hasFilters && (
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
          ) : filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((h) => <HostelCard key={h.id} hostel={h} />)}
            </div>
          ) : (
            <div>
              <div className="stat-card mb-5 flex flex-col items-center justify-center py-8 text-center">
                <Search className="mb-3 h-9 w-9 text-muted-foreground" />
                <p className="font-medium">No exact matches found. Showing similar hostels.</p>
                <p className="text-sm text-muted-foreground">Try adjusting or clearing your filters for more options.</p>
                <Button onClick={clearAll} variant="outline" className="mt-4">Clear filters</Button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {similar.map((h) => <HostelCard key={h.id} hostel={h} />)}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
