// Shared, client-safe types & helpers for the hostel platform.

export type HostelType = "boys" | "girls" | "coliving";

export type Facilities = Record<string, boolean>;

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
