// Shared, client-safe types & helpers for the hostel platform.

import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { HostelCardData } from "@/components/hostel-card";

export type HostelType = "boys" | "girls" | "coliving";

export type Facilities = Record<string, boolean>;

export type HostelRow = HostelCardData & { city: string | null; college_name: string | null; created_at?: string };

export const POPULAR_CITIES = ["Hyderabad", "Bangalore", "Chennai", "Vijayawada", "Visakhapatnam"];

/** Loads all published hostels with a cover image and available-bed counts. */
export async function fetchPublishedHostels(): Promise<HostelRow[]> {
  const { data: hostels } = await supabase
    .from("hostels")
    .select(
      "id,name,city,college_name,distance_from_college,hostel_type,single_fee,double_fee,triple_fee,rating,review_count,facilities,created_at",
    )
    .eq("is_published", true)
    .order("rating", { ascending: false });

  const rows = hostels ?? [];
  const ids = rows.map((h) => h.id);
  const imgMap: Record<string, string> = {};
  const bedMap: Record<string, number> = {};

  if (ids.length) {
    const [{ data: imgs }, { data: rooms }] = await Promise.all([
      supabase.from("hostel_images").select("hostel_id,url,sort_order").in("hostel_id", ids).order("sort_order", { ascending: true }),
      supabase.from("rooms").select("hostel_id,capacity,occupied_beds").in("hostel_id", ids),
    ]);
    (imgs ?? []).forEach((im) => {
      if (!imgMap[im.hostel_id]) imgMap[im.hostel_id] = im.url;
    });
    (rooms ?? []).forEach((r) => {
      bedMap[r.hostel_id] = (bedMap[r.hostel_id] ?? 0) + Math.max(0, (r.capacity ?? 0) - (r.occupied_beds ?? 0));
    });
  }

  return rows.map((h) => ({
    ...(h as unknown as HostelRow),
    image: imgMap[h.id] ?? null,
    available_beds: bedMap[h.id] ?? 0,
  }));
}

/** Cached query for the published hostels list — keeps navigation instant. */
export const publishedHostelsQueryOptions = queryOptions({
  queryKey: ["published-hostels"],
  queryFn: fetchPublishedHostels,
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
});

export const FACILITIES: { key: string; label: string }[] = [
  { key: "wifi", label: "WiFi" },
  { key: "ac", label: "AC" },
  { key: "attached_bathroom", label: "Attached Bathroom" },
  { key: "mess_facility", label: "Mess Facility" },
  { key: "laundry", label: "Laundry" },
  { key: "parking", label: "Parking" },
  { key: "cctv", label: "CCTV" },
  { key: "security_guard", label: "Security Guard" },
  { key: "power_backup", label: "Power Backup" },
  { key: "water_facility", label: "Water Facility" },
  { key: "study_room", label: "Study Room" },
  { key: "gym", label: "Gym" },
  { key: "medical_support", label: "Medical Support" },
];

export const HOSTEL_TYPE_LABEL: Record<HostelType, string> = {
  boys: "Boys Hostel",
  girls: "Girls Hostel",
  coliving: "Co-Living",
};

export const SHARING_TYPES = ["Single Sharing", "Double Sharing", "Triple Sharing"] as const;

export function formatINR(value?: number | null): string {
  if (value == null) return "—";
  return "₹" + value.toLocaleString("en-IN");
}

export function facilityList(facilities: unknown): string[] {
  if (!facilities || typeof facilities !== "object") return [];
  const f = facilities as Facilities;
  return FACILITIES.filter((x) => f[x.key]).map((x) => x.label);
}

export function hasFacility(facilities: unknown, key: string): boolean {
  if (!facilities || typeof facilities !== "object") return false;
  return !!(facilities as Facilities)[key];
}
