import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Promote the calling user to admin ONLY if no admin exists yet (demo bootstrap).
export const claimAdminIfNone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) > 0) {
      const { data: mine } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      return { promoted: !!mine, reason: mine ? "already_admin" : "admin_exists" };
    }

    await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    return { promoted: true, reason: "bootstrapped" };
  });

const DEPARTMENTS = ["Computer Science", "Mechanical", "Electrical", "Civil", "Electronics"];
const COMPLAINT_SAMPLES = [
  { title: "Fan not working in room", description: "The ceiling fan stopped rotating and makes a buzzing noise.", category: "electrical", priority: "high", status: "open" },
  { title: "Leaking tap in washroom", description: "Water keeps dripping from the bathroom tap all day.", category: "plumbing", priority: "medium", status: "in_progress" },
  { title: "Slow Wi-Fi on 2nd floor", description: "Internet is extremely slow during evening hours.", category: "internet", priority: "medium", status: "open" },
  { title: "Broken study chair", description: "The chair leg is cracked and unsafe to sit on.", category: "furniture", priority: "low", status: "resolved" },
  { title: "Corridor not cleaned", description: "The hallway has not been swept for several days.", category: "cleaning", priority: "low", status: "resolved" },
];
const FEEDBACK_SAMPLES = [
  { rating: 5, feedback_text: "The mess food has improved a lot and the staff is friendly!", sentiment: "positive", sentiment_score: 0.9 },
  { rating: 2, feedback_text: "Hot water is rarely available in the mornings, please fix it.", sentiment: "negative", sentiment_score: -0.6 },
  { rating: 4, feedback_text: "Rooms are clean but Wi-Fi could be faster.", sentiment: "neutral", sentiment_score: 0.2 },
  { rating: 1, feedback_text: "Too much noise at night, very hard to study.", sentiment: "negative", sentiment_score: -0.8 },
  { rating: 5, feedback_text: "Great hostel experience overall, well managed!", sentiment: "positive", sentiment_score: 0.95 },
];

// Admin-only: create demo students with complaints & feedback.
export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdminRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) throw new Error("Forbidden");

    const names = ["Aarav Sharma", "Priya Patel", "Rohan Mehta", "Sneha Iyer", "Karan Verma"];
    const rooms = ["101", "201", "203", "302", "401"];
    const createdIds: string[] = [];

    for (let i = 0; i < names.length; i++) {
      const email = `demo.student${i + 1}@hostelhub.test`;
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: "Demo@12345",
        email_confirm: true,
        user_metadata: {
          name: names[i],
          student_id: `STU20${i + 1}0${i + 3}`,
          phone: `98765${10000 + i}`,
          gender: i % 2 === 0 ? "Male" : "Female",
          room_number: rooms[i],
        },
      });
      if (error || !created.user) continue;
      const uid = created.user.id;
      createdIds.push(uid);
      await supabaseAdmin.from("profiles").update({ room_number: rooms[i] }).eq("id", uid);

      const c = COMPLAINT_SAMPLES[i];
      await supabaseAdmin.from("complaints").insert({
        user_id: uid,
        title: c.title,
        description: c.description,
        category: c.category as never,
        priority: c.priority as never,
        status: c.status as never,
        room_number: rooms[i],
        ai_summary: c.description,
      });
      const f = FEEDBACK_SAMPLES[i];
      await supabaseAdmin.from("feedback").insert({
        user_id: uid,
        rating: f.rating,
        feedback_text: f.feedback_text,
        sentiment: f.sentiment as never,
        sentiment_score: f.sentiment_score,
        ai_summary: f.feedback_text,
      });
    }

    return { created: createdIds.length };
  });
