import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Building2, Users, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, StatCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/room")({
  component: RoomPage,
});

function RoomPage() {
  const { profile } = useAuth();

  const { data: room, isLoading } = useQuery({
    queryKey: ["my-room", profile?.room_number],
    queryFn: async () =>
      profile?.room_number
        ? (await supabase.from("rooms").select("*").eq("room_number", profile.room_number).maybeSingle()).data
        : null,
    enabled: !!profile,
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="My Room" description="Your assigned accommodation" />

      {!profile?.room_number ? (
        <div className="stat-card p-12 text-center">
          <BedDouble className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No room assigned yet. Update your room number in your profile.</p>
          <Button asChild className="mt-4" variant="outline"><Link to="/profile">Go to Profile</Link></Button>
        </div>
      ) : isLoading ? (
        <div className="stat-card p-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : !room ? (
        <div className="stat-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Room <strong>{profile.room_number}</strong> details are not available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="stat-card overflow-hidden">
            <div className="flex items-center justify-between bg-[image:var(--gradient-primary)] p-6 text-primary-foreground">
              <div>
                <div className="text-sm opacity-80">Room Number</div>
                <div className="text-3xl font-bold">{room.room_number}</div>
              </div>
              <StatusBadge value={room.status} className="bg-white/20 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
              <Detail label="Type" value={room.room_type} />
              <Detail label="Floor" value={`Floor ${room.floor}`} />
              <Detail label="Capacity" value={`${room.capacity} beds`} />
              <Detail label="Occupied" value={`${room.occupied_count} / ${room.capacity}`} />
              <Detail label="Available Beds" value={`${Math.max(0, room.capacity - room.occupied_count)}`} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Floor" value={room.floor} icon={Layers} />
            <StatCard label="Capacity" value={room.capacity} icon={Users} tint="success" />
            <StatCard label="Room Type" value={room.room_type} icon={Building2} />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
