import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Inbox, User, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Student Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold">Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Discover hostels, track inquiries, and manage your account.</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/browse"><Search className="h-4 w-4" /> Browse Hostels</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/browse" className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">AI Hostel Search</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search by city, budget, food, WiFi, college, and safety.</p>
        </Link>
        <Link to="/inquiries" className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary">
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">My Inquiries</h2>
          <p className="mt-1 text-sm text-muted-foreground">View inquiry messages sent to hostel administrators.</p>
        </Link>
        <Link to="/profile" className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary">
          <User className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep your contact details up to date.</p>
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Popular cities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Hyderabad", "Bangalore", "Chennai", "Vijayawada", "Visakhapatnam"].map((city) => (
            <Button key={city} asChild variant="outline" size="sm">
              <Link to="/browse" search={{ city }}>{city}</Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
