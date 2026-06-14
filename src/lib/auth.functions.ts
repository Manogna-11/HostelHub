import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().trim().min(1).max(255),
  role: z.enum(["student", "admin"]),
});

// Resolves a Student ID / Admin ID (or email) to the account email so the
// user can sign in with either value. Public by design (used before login).
export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.identifier.includes("@")) return { email: data.identifier.toLowerCase() };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const column = data.role === "admin" ? "admin_id" : "student_id";
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq(column, data.identifier)
      .maybeSingle();

    return { email: row?.email ?? null };
  });
