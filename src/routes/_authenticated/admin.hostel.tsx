import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyHostel } from "@/hooks/use-my-hostel";
import { HostelForm, type HostelFormValue } from "@/components/hostel-form";
import { PageHeader } from "@/components/page-header";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import type { HostelType } from "@/lib/hostels";

export const Route = createFileRoute("/_authenticated/admin/hostel")({
  component: AdminHostel,
});

function AdminHostel() {
  const { user } = useAuth();
  const { hostel, loading, reload } = useMyHostel();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (!loading && !hostel) navigate({ to: "/admin/setup" });
  }, [loading, hostel, navigate]);

  useEffect(() => {
    if (hostel) {
      supabase.from("hostel_images").select("url").eq("hostel_id", hostel.id).order("sort_order").then(({ data }) => {
        setImages((data ?? []).map((d) => d.url));
      });
    }
  }, [hostel]);

  if (loading || !user || !hostel || images === null)
    return <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>;

  const initial: Partial<HostelFormValue> = {
    name: hostel.name, description: hostel.description ?? "", hostel_type: hostel.hostel_type as HostelType,
    address: hostel.address ?? "", city: hostel.city ?? "", state: hostel.state ?? "", pincode: hostel.pincode ?? "",
    college_name: hostel.college_name ?? "", distance_from_college: hostel.distance_from_college ?? "", maps_link: hostel.maps_link ?? "",
    phone: hostel.phone ?? "", email: hostel.email ?? "",
    single_fee: hostel.single_fee?.toString() ?? "", double_fee: hostel.double_fee?.toString() ?? "",
    triple_fee: hostel.triple_fee?.toString() ?? "", security_deposit: hostel.security_deposit?.toString() ?? "",
    mess_veg_nonveg: hostel.mess_veg_nonveg ?? "", mess_timings: hostel.mess_timings ?? "", rules: hostel.rules ?? "",
    facilities: (hostel.facilities ?? {}) as Record<string, boolean>,
    security: (hostel.security_info ?? {}) as Record<string, boolean>,
    images: images.length >= 5 ? images : [...images, ...Array(5 - images.length).fill("")],
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Hostel" description="Edit your hostel listing details and images." />
      <HostelForm ownerId={user.id} hostelId={hostel.id} initial={initial} onSaved={() => reload()} submitLabel="Update hostel" />
    </div>
  );
}
