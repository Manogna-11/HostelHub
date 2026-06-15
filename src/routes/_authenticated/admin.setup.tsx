import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { HostelForm } from "@/components/hostel-form";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/admin/setup")({
  component: AdminSetup,
});

function AdminSetup() {
  const { user } = useAuth();
  const { hostel, loading } = useMyHostel();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && hostel) navigate({ to: "/admin/dashboard" });
  }, [loading, hostel, navigate]);

  if (loading || !user) return <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Create Your Hostel Profile" description="Set up your hostel listing so students can discover and contact you." />
      <HostelForm ownerId={user.id} onSaved={() => navigate({ to: "/admin/dashboard" })} submitLabel="Create hostel listing" />
    </div>
  );
}
