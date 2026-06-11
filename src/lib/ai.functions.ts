import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { aiChat, safeParseJson } from "./ai.server";

const CATEGORIES = ["electrical", "plumbing", "cleaning", "internet", "furniture", "mess", "other"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

// AI Feature 1: Complaint classification
export const classifyComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ title: z.string().min(1).max(200), description: z.string().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "You are a hostel maintenance triage assistant. Classify the complaint and respond ONLY with JSON: " +
            '{"category": one of [electrical, plumbing, cleaning, internet, furniture, mess, other], ' +
            '"priority": one of [low, medium, high], "summary": a concise one-sentence maintenance summary}.',
        },
        { role: "user", content: `Title: ${data.title}\nDescription: ${data.description}` },
      ],
      true,
    );
    const parsed = safeParseJson(raw, { category: "other", priority: "medium", summary: data.title });
    const category = (CATEGORIES as readonly string[]).includes(parsed.category) ? parsed.category : "other";
    const priority = (PRIORITIES as readonly string[]).includes(parsed.priority) ? parsed.priority : "medium";
    return { category, priority, summary: String(parsed.summary || data.title).slice(0, 300) };
  });

// AI Feature 3: Notice summarizer
export const summarizeNotice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ title: z.string().min(1).max(200), description: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "Summarize the hostel notice. Respond ONLY with JSON: " +
            '{"summary": short 1-2 sentence summary, "key_points": array of up to 4 short bullet strings, ' +
            '"deadlines": array of important dates/deadlines as short strings (empty if none)}.',
        },
        { role: "user", content: `Title: ${data.title}\nNotice: ${data.description}` },
      ],
      true,
    );
    const parsed = safeParseJson<{ summary: string; key_points: string[]; deadlines: string[] }>(raw, {
      summary: data.description.slice(0, 160),
      key_points: [],
      deadlines: [],
    });
    return {
      summary: String(parsed.summary || "").slice(0, 400),
      key_points: (parsed.key_points || []).slice(0, 4).map((s) => String(s).slice(0, 120)),
      deadlines: (parsed.deadlines || []).slice(0, 4).map((s) => String(s).slice(0, 120)),
    };
  });

// AI Feature 4: Feedback sentiment analysis
export const analyzeFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ rating: z.number().min(1).max(5), text: z.string().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "Analyze hostel feedback sentiment. Respond ONLY with JSON: " +
            '{"sentiment": one of [positive, neutral, negative], "score": number from -1 to 1, ' +
            '"summary": one short sentence summary}.',
        },
        { role: "user", content: `Rating: ${data.rating}/5\nFeedback: ${data.text}` },
      ],
      true,
    );
    const parsed = safeParseJson<{ sentiment: string; score: number; summary: string }>(raw, {
      sentiment: data.rating >= 4 ? "positive" : data.rating <= 2 ? "negative" : "neutral",
      score: (data.rating - 3) / 2,
      summary: data.text.slice(0, 120),
    });
    const sentiment = ["positive", "neutral", "negative"].includes(parsed.sentiment) ? parsed.sentiment : "neutral";
    let score = Number(parsed.score);
    if (Number.isNaN(score)) score = 0;
    score = Math.max(-1, Math.min(1, score));
    return { sentiment, score, summary: String(parsed.summary || "").slice(0, 200) };
  });

// AI Feature 2: Hostel Assistant chatbot
export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
          .max(20)
          .default([]),
        message: z.string().min(1).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const reply = await aiChat([
      {
        role: "system",
        content:
          "You are 'HostelHub Assistant', a friendly AI helper for a student hostel management portal. " +
          "Help students with hostel rules, complaint procedures (they can file complaints in the Complaints section which are auto-classified by AI), " +
          "room allocation, mess timings (Breakfast 7:30-9:30, Lunch 12:30-2:30, Snacks 5-6, Dinner 8-9:30), notices, and navigating the portal. " +
          "Be concise, warm, and helpful. Use markdown formatting when useful.",
      },
      ...data.history,
      { role: "user", content: data.message },
    ]);
    return { reply };
  });
