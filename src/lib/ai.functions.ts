import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { aiChat, safeParseJson } from "./ai.server";

// ── AI Feature 1: Natural-language hostel search (public) ──────────────
export const aiHostelSearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ query: z.string().min(1).max(500) }).parse(d),
  )
  .handler(async ({ data }) => {
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "You convert a student's natural-language hostel search into filters. " +
            "Respond ONLY with JSON: " +
            '{"city": string|null, "college": string|null, "gender": one of ["boys","girls","coliving",null], ' +
            '"maxBudget": number|null (monthly rent in INR), ' +
            '"facilities": array of any of ["wifi","ac","attached_bathroom","mess_facility","laundry","parking","cctv","security_guard","power_backup","water_facility","study_room","gym","medical_support"], ' +
            '"keywords": string (anything else useful, e.g. "good food")}. ' +
            'Map "girls"/"women"->girls, "boys"/"men"->boys, "co-living"/"coed"->coliving. "good food" implies mess_facility.',
        },
        { role: "user", content: data.query },
      ],
      true,
    );
    const parsed = safeParseJson<{
      city: string | null;
      college: string | null;
      gender: string | null;
      maxBudget: number | null;
      facilities: string[];
      keywords: string;
    }>(raw, { city: null, college: null, gender: null, maxBudget: null, facilities: [], keywords: data.query });
    return {
      city: parsed.city ?? null,
      college: parsed.college ?? null,
      gender: ["boys", "girls", "coliving"].includes(parsed.gender ?? "") ? parsed.gender : null,
      maxBudget: typeof parsed.maxBudget === "number" ? parsed.maxBudget : null,
      facilities: Array.isArray(parsed.facilities) ? parsed.facilities.slice(0, 13) : [],
      keywords: String(parsed.keywords ?? "").slice(0, 200),
    };
  });

// ── AI Feature 2: Per-hostel chat assistant (public) ──────────────────
export const askHostelAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        context: z.string().max(6000),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
          .max(16)
          .default([]),
        message: z.string().min(1).max(1000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const reply = await aiChat([
      {
        role: "system",
        content:
          "You are HostelHub Assistant, helping a student decide on a hostel. " +
          "Answer ONLY using the hostel details below. If something is not listed, say it's not specified and suggest sending an inquiry. " +
          "Be concise and friendly.\n\nHOSTEL DETAILS:\n" +
          data.context,
      },
      ...data.history,
      { role: "user", content: data.message },
    ]);
    return { reply };
  });

// ── AI Feature 5: Review sentiment analysis (admin) ───────────────────
export const analyzeReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        reviews: z.array(z.object({ rating: z.number(), comment: z.string().max(2000) })).max(60),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (data.reviews.length === 0)
      return { positive: "No reviews yet.", negative: "No reviews yet.", suggestions: [] as string[] };
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "Analyze these student hostel reviews. Respond ONLY with JSON: " +
            '{"positive": short paragraph of what students praise, ' +
            '"negative": short paragraph of common complaints, ' +
            '"suggestions": array of up to 4 short improvement suggestions}.',
        },
        { role: "user", content: data.reviews.map((r) => `(${r.rating}/5) ${r.comment}`).join("\n") },
      ],
      true,
    );
    const parsed = safeParseJson<{ positive: string; negative: string; suggestions: string[] }>(raw, {
      positive: "",
      negative: "",
      suggestions: [],
    });
    return {
      positive: String(parsed.positive ?? "").slice(0, 600),
      negative: String(parsed.negative ?? "").slice(0, 600),
      suggestions: (parsed.suggestions ?? []).slice(0, 4).map((s) => String(s).slice(0, 160)),
    };
  });

// ── AI Feature 4: Complaint analysis (admin) ──────────────────────────
export const analyzeComplaints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        complaints: z.array(z.object({ title: z.string().max(300), description: z.string().max(2000) })).max(60),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (data.complaints.length === 0)
      return { summary: "No complaints to analyze.", urgent: [] as string[], recurring: [] as string[] };
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "Analyze these hostel complaints. Respond ONLY with JSON: " +
            '{"summary": 1-2 sentence overview, ' +
            '"urgent": array of up to 4 short urgent issue strings, ' +
            '"recurring": array of up to 4 short recurring-issue strings}.',
        },
        { role: "user", content: data.complaints.map((c) => `${c.title}: ${c.description}`).join("\n") },
      ],
      true,
    );
    const parsed = safeParseJson<{ summary: string; urgent: string[]; recurring: string[] }>(raw, {
      summary: "",
      urgent: [],
      recurring: [],
    });
    return {
      summary: String(parsed.summary ?? "").slice(0, 400),
      urgent: (parsed.urgent ?? []).slice(0, 4).map((s) => String(s).slice(0, 160)),
      recurring: (parsed.recurring ?? []).slice(0, 4).map((s) => String(s).slice(0, 160)),
    };
  });
