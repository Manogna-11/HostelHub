import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return (
      <div className="stat-card mx-auto mt-10 max-w-md p-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-3 font-semibold">Administrator access required</h2>
        <p className="mt-1 text-sm text-muted-foreground">This page is restricted to hostel administrators.</p>
        <Button asChild className="mt-4" variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }
  return <>{children}</>;
}
