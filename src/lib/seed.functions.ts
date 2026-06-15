import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;
const IMG_CATS = ["Building", "Rooms", "Mess", "Security Area", "Study Area", "Bathroom", "Reception"];

type DemoHostel = {
  name: string;
  type: "boys" | "girls" | "coliving";
  city: string;
  state: string;
  college: string;
  distance: string;
  single: number;
  double: number;
  triple: number;
  deposit: number;
  lat: number;
  lng: number;
  desc: string;
  facilities: string[];
};

const HOSTELS: DemoHostel[] = [
  { name: "Sunrise Boys Residency", type: "boys", city: "Vellore", state: "Tamil Nadu", college: "VIT University", distance: "0.8 km", single: 9000, double: 6500, triple: 5000, deposit: 10000, lat: 12.9692, lng: 79.1559, desc: "Premium boys hostel walking distance from VIT main gate with spacious AC rooms and 24/7 security.", facilities: ["wifi", "ac", "attached_bathroom", "mess_facility", "laundry", "cctv", "security_guard", "power_backup", "water_facility", "study_room"] },
  { name: "Lotus Girls Hostel", type: "girls", city: "Vellore", state: "Tamil Nadu", college: "VIT University", distance: "1.2 km", single: 8500, double: 6000, triple: 4500, deposit: 9000, lat: 12.9710, lng: 79.1602, desc: "Safe and secure girls-only hostel with biometric entry, hygienic mess and dedicated wardens.", facilities: ["wifi", "attached_bathroom", "mess_facility", "laundry", "cctv", "security_guard", "power_backup", "water_facility", "study_room", "medical_support"] },
  { name: "Green Valley PG", type: "coliving", city: "Hyderabad", state: "Telangana", college: "JNTU Hyderabad", distance: "1.5 km", single: 7500, double: 5500, triple: 4000, deposit: 8000, lat: 17.4933, lng: 78.3915, desc: "Modern co-living PG near JNTU with great food, fast WiFi and a vibrant student community.", facilities: ["wifi", "ac", "mess_facility", "parking", "cctv", "power_backup", "water_facility", "gym"] },
  { name: "Scholars Nest", type: "boys", city: "Hyderabad", state: "Telangana", college: "JNTU Hyderabad", distance: "0.5 km", single: 8000, double: 6000, triple: 4800, deposit: 9000, lat: 17.4948, lng: 78.3899, desc: "Study-focused boys hostel with quiet study rooms, power backup and nutritious mess food.", facilities: ["wifi", "attached_bathroom", "mess_facility", "cctv", "security_guard", "power_backup", "water_facility", "study_room"] },
  { name: "Urban Stay Co-Living", type: "coliving", city: "Bangalore", state: "Karnataka", college: "Christ University", distance: "2.0 km", single: 12000, double: 9000, triple: 7000, deposit: 15000, lat: 12.9345, lng: 77.6066, desc: "Upscale co-living space near Christ University with gym, gaming lounge and premium amenities.", facilities: ["wifi", "ac", "attached_bathroom", "mess_facility", "laundry", "parking", "cctv", "security_guard", "power_backup", "gym", "medical_support"] },
  { name: "Maple Girls Residency", type: "girls", city: "Bangalore", state: "Karnataka", college: "Christ University", distance: "1.1 km", single: 11000, double: 8500, triple: 6500, deposit: 12000, lat: 12.9301, lng: 77.6101, desc: "Comfortable girls hostel with home-style meals, 24/7 CCTV and visitor management.", facilities: ["wifi", "ac", "attached_bathroom", "mess_facility", "laundry", "cctv", "security_guard", "water_facility", "study_room", "medical_support"] },
  { name: "Anna Nagar Boys Hostel", type: "boys", city: "Chennai", state: "Tamil Nadu", college: "Anna University", distance: "1.8 km", single: 8500, double: 6200, triple: 4800, deposit: 9000, lat: 13.0118, lng: 80.2356, desc: "Budget-friendly boys hostel close to Anna University with reliable water and power supply.", facilities: ["wifi", "mess_facility", "parking", "cctv", "power_backup", "water_facility"] },
  { name: "Riverside Co-Living", type: "coliving", city: "Pune", state: "Maharashtra", college: "COEP Technological University", distance: "1.0 km", single: 10000, double: 7500, triple: 5800, deposit: 11000, lat: 18.5290, lng: 73.8567, desc: "Trendy co-living near COEP with rooftop study lounge, fast internet and laundry service.", facilities: ["wifi", "ac", "attached_bathroom", "mess_facility", "laundry", "parking", "cctv", "power_backup", "study_room", "gym"] },
];

const REVIEW_TEXT = [
  { r: 5, name: "Aarav S.", c: "Amazing hostel! Clean rooms, tasty mess food and very responsive management." },
  { r: 4, name: "Priya P.", c: "Good location and safe. WiFi could be a bit faster during evenings." },
  { r: 5, name: "Rohan M.", c: "Loved the study room and the security. Highly recommend for students." },
  { r: 3, name: "Sneha I.", c: "Decent place for the price. Hot water timing can be improved." },
  { r: 4, name: "Karan V.", c: "Friendly wardens and good food. Rooms are spacious." },
];

const COMPLAINTS = [
  { title: "Fan not working", description: "Ceiling fan in room makes noise and stopped rotating.", category: "electrical", priority: "high", status: "pending" },
  { title: "Slow WiFi on 2nd floor", description: "Internet is very slow during evening hours.", category: "internet", priority: "medium", status: "pending" },
  { title: "Leaking tap", description: "Bathroom tap keeps dripping all day.", category: "plumbing", priority: "medium", status: "resolved" },
  { title: "Mess food quality", description: "Dinner quality dropped this week.", category: "mess", priority: "low", status: "resolved" },
];

const RESIDENT_NAMES = ["Aarav Sharma", "Priya Patel", "Rohan Mehta", "Sneha Iyer", "Karan Verma", "Diya Nair", "Vikram Rao", "Ananya Das"];

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify caller is an admin.
    const { data: isAdminRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) throw new Error("Forbidden");

    // Ensure a demo owner exists (hostels owned by a showcase account).
    const demoEmail = "demo.owner@hostelhub.test";
    let demoOwnerId: string | null = null;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    demoOwnerId = list?.users.find((u) => u.email === demoEmail)?.id ?? null;
    if (!demoOwnerId) {
      const { data: created } = await supabaseAdmin.auth.admin.createUser({
        email: demoEmail,
        password: "Demo@12345",
        email_confirm: true,
        user_metadata: { name: "HostelHub Demo", role: "admin" },
      });
      demoOwnerId = created?.user?.id ?? null;
    }
    if (!demoOwnerId) throw new Error("Could not create demo owner");

    // Avoid duplicate seeding.
    const { count } = await supabaseAdmin
      .from("hostels")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", demoOwnerId);
    if ((count ?? 0) > 0) return { created: 0, message: "Demo data already exists" };

    let created = 0;
    for (const h of HOSTELS) {
      const facilities: Record<string, boolean> = {};
      h.facilities.forEach((f) => (facilities[f] = true));

      const { data: hostel, error } = await supabaseAdmin
        .from("hostels")
        .insert({
          owner_id: demoOwnerId,
          name: h.name,
          description: h.desc,
          hostel_type: h.type,
          address: `Near ${h.college}, ${h.city}`,
          city: h.city,
          state: h.state,
          pincode: "500000",
          college_name: h.college,
          distance_from_college: h.distance,
          maps_link: `https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`,
          latitude: h.lat,
          longitude: h.lng,
          phone: "+91 98765 43210",
          email: `${h.name.toLowerCase().replace(/[^a-z]+/g, ".")}@hostelhub.test`,
          single_fee: h.single,
          double_fee: h.double,
          triple_fee: h.triple,
          security_deposit: h.deposit,
          rules: "No smoking. Gates close at 10:30 PM. Guests must register at reception.",
          mess_veg_nonveg: h.type === "girls" ? "Veg" : "Veg & Non-Veg",
          mess_timings: "Breakfast 7:30-9:30, Lunch 12:30-2:30, Dinner 8-9:30",
          facilities,
          is_published: true,
        })
        .select("id")
        .single();
      if (error || !hostel) continue;
      const hid = hostel.id;
      created++;

      await supabaseAdmin.from("hostel_images").insert(
        IMG_CATS.map((cat, i) => ({
          hostel_id: hid,
          url: IMG(`${h.name.replace(/\s/g, "")}${i}`),
          category: cat,
          sort_order: i,
        })),
      );

      await supabaseAdmin.from("rooms").insert(
        [1, 2, 3, 4, 5, 6].map((n) => {
          const cap = n % 3 === 0 ? 3 : n % 2 === 0 ? 2 : 1;
          return {
            hostel_id: hid,
            room_number: `${n < 4 ? 1 : 2}0${n}`,
            capacity: cap,
            occupied_beds: Math.max(0, cap - (n % 2)),
            room_type: cap === 1 ? "Single Sharing" : cap === 2 ? "Double Sharing" : "Triple Sharing",
            monthly_fee: cap === 1 ? h.single : cap === 2 ? h.double : h.triple,
          };
        }),
      );

      await supabaseAdmin.from("residents").insert(
        RESIDENT_NAMES.slice(0, 5).map((name, i) => ({
          hostel_id: hid,
          name,
          phone: `98765${10000 + i}`,
          room_number: `${i < 2 ? 1 : 2}0${i + 1}`,
          joining_date: `2025-0${(i % 8) + 1}-15`,
          fee_status: i % 3 === 0 ? "pending" : "paid",
        })),
      );

      await supabaseAdmin.from("reviews").insert(
        REVIEW_TEXT.map((rv) => ({
          hostel_id: hid,
          user_id: demoOwnerId,
          author_name: rv.name,
          rating: rv.r,
          comment: rv.c,
        })),
      );

      await supabaseAdmin.from("complaints").insert(
        COMPLAINTS.map((c, i) => ({
          hostel_id: hid,
          resident_name: RESIDENT_NAMES[i],
          title: c.title,
          description: c.description,
          category: c.category,
          priority: c.priority,
          status: c.status,
        })),
      );

      await supabaseAdmin.from("inquiries").insert([
        { hostel_id: hid, name: "Interested Student", phone: "9876500000", email: "student@example.com", message: "Is a single room available from next month?", status: "new" },
        { hostel_id: hid, name: "Parent Inquiry", phone: "9876511111", email: "parent@example.com", message: "What are the security arrangements for girls?", status: "new" },
      ]);
    }

    return { created, message: `Seeded ${created} demo hostels` };
  });
