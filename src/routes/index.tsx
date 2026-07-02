import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Home,
  Bot,
  MapPin,
  ShieldCheck,
  Star,
  Building2,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Clock,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishedHostelsQueryOptions, POPULAR_CITIES, type HostelRow } from "@/lib/hostels";
import { HostelCard } from "@/components/hostel-card";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostelHub — Find & Book Student Hostels and PGs" },
      {
        name: "description",
        content:
          "Discover, compare and book student hostels and PG accommodations near your college with AI-powered search, verified reviews and instant inquiries.",
      },
      { property: "og:title", content: "HostelHub — Find Student Hostels & PGs" },
      {
        property: "og:description",
        content: "AI-powered hostel discovery for students. Search by college, budget, gender and amenities.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedHostelsQueryOptions),
  component: Landing,
});

const features = [
  { icon: Bot, title: "AI Search Assistant", desc: "Type \"girls hostel near VIT under ₹6000\" and get instant matches." },
  { icon: Search, title: "Smart Filters", desc: "Filter by city, college, budget, sharing type and amenities." },
  { icon: MapPin, title: "Maps & Distance", desc: "See hostel locations and distance from your college." },
  { icon: Star, title: "Verified Reviews", desc: "Real student ratings with AI sentiment summaries." },
  { icon: MessageSquare, title: "Instant Inquiries", desc: "Call, email, WhatsApp or send an inquiry in one tap." },
  { icon: ShieldCheck, title: "Owner Dashboard", desc: "Hostel owners manage rooms, residents, complaints & analytics." },
];

function minFee(h: HostelRow) {
  return Math.min(...[h.single_fee, h.double_fee, h.triple_fee].filter((f): f is number => f != null));
}

function HostelRowSection({
  icon: Icon,
  title,
  subtitle,
  hostels,
}: {
  icon: typeof Star;
  title: string;
  subtitle: string;
  hostels: HostelRow[];
}) {
  if (hostels.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/browse">View all <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hostels.map((h) => <HostelCard key={h.id} hostel={h} />)}
      </div>
    </section>
  );
}

function Landing() {
  const { data: hostels = [], isLoading: loadingHostels } = useQuery(publishedHostelsQueryOptions);
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);



  const featured = useMemo(() => hostels.slice(0, 8), [hostels]);
  const topRated = useMemo(() => [...hostels].sort((a, b) => b.rating - a.rating).slice(0, 4), [hostels]);
  const recent = useMemo(
    () => [...hostels].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 4),
    [hostels],
  );
  const budget = useMemo(() => [...hostels].sort((a, b) => minFee(a) - minFee(b)).slice(0, 4), [hostels]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="HostelHub" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">HostelHub</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex gap-1.5">
            <Link to="/"><Home className="h-4 w-4" /> Home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/browse">Browse Hostels</Link>
          </Button>
          {mounted && !authLoading && user ? (
            <Button asChild variant="outline">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-12 pt-8 lg:grid-cols-2 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Bot className="h-3.5 w-3.5" /> AI-Powered Hostel Discovery
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your perfect{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">student hostel</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Search hostels and PGs near your college by budget, gender and amenities. Compare prices, read reviews and
            send inquiries — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/browse">
                Browse hostels <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Popular locations</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.map((c) => (
                <Link
                  key={c}
                  to="/browse"
                  search={{ city: c }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  <MapPin className="h-3.5 w-3.5" /> {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <img
            src={hero}
            alt="Modern student hostel building"
            width={1600}
            height={1024}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-elevated)]"
          />
        </div>
      </section>

      {loadingHostels ? (
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="stat-card aspect-[4/3] animate-pulse bg-muted/40" />
            ))}
          </div>
        </section>
      ) : (
        <>
          <HostelRowSection icon={Star} title="Featured Hostels" subtitle="Hand-picked stays loved by students" hostels={featured} />
          <HostelRowSection icon={TrendingUp} title="Top Rated Hostels" subtitle="Highest rated by residents" hostels={topRated} />
          <HostelRowSection icon={Clock} title="Recently Added" subtitle="The newest listings on HostelHub" hostels={recent} />
          <HostelRowSection icon={Wallet} title="Budget Friendly Hostels" subtitle="Great stays that won't break the bank" hostels={budget} />
        </>
      )}

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">Everything you need to find the right stay</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="stat-card p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-6 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" /> HostelHub — Student Hostel & PG Discovery Platform
        </div>
      </footer>
    </div>
  );
}
