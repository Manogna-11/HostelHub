import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyHostel } from "@/hooks/use-my-hostel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/dashboard") return <Outlet />;
  return <DashboardRedirect />;
}

function DashboardRedirect() {
  const { role, loading } = useAuth();
  const { hostel, loading: hostelLoading } = useMyHostel();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (role === "admin") {
      if (hostelLoading) return;
      navigate({ to: hostel ? "/admin/dashboard" : "/admin/setup" });
    } else {
      navigate({ to: "/dashboard/student" });
    }
  }, [role, loading, hostel, hostelLoading, navigate]);

  return (
    <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading your dashboard…</div>
  );
}
