import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { askAssistant } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/assistant")({
  component: Assistant,
});

const SUGGESTIONS = [
  "What are the mess timings?",
  "How do I file a complaint?",
  "Explain the room allocation process",
  "What are the hostel rules?",
];

type Msg = { id?: string; role: "user" | "assistant"; content: string };

function Assistant() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ask = useServerFn(askAssistant);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: history } = useQuery({
    queryKey: ["chat", user?.id],
    queryFn: async () =>
      ((await supabase.from("chat_history").select("*").eq("user_id", user!.id).order("created_at")).data ?? []) as Msg[],
  });

  const messages: Msg[] = [...(history ?? []), ...pending];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (textRaw?: string) => {
    const text = (textRaw ?? input).trim();
    if (!text || typing) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setPending([userMsg]);
    setTyping(true);
    try {
      await supabase.from("chat_history").insert({ user_id: user!.id, role: "user", content: text });
      const hist = (history ?? []).slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await ask({ data: { history: hist, message: text } });
      await supabase.from("chat_history").insert({ user_id: user!.id, role: "assistant", content: reply });
      setPending([]);
      await qc.invalidateQueries({ queryKey: ["chat"] });
    } catch {
      toast.error("Assistant is unavailable right now.");
      setPending([]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    await supabase.from("chat_history").delete().eq("user_id", user!.id);
    qc.invalidateQueries({ queryKey: ["chat"] });
    toast.success("Chat cleared.");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        title="HostelHub Assistant"
        description="Your AI hostel helper"
        action={messages.length > 0 && <Button variant="outline" size="sm" onClick={clearChat}><Trash2 className="mr-1.5 h-4 w-4" /> Clear</Button>}
      />

      <div className="stat-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <img src={logo} alt="" width={56} height={56} className="h-14 w-14" />
              <h3 className="mt-3 font-semibold">Hi! I'm the HostelHub Assistant 👋</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Ask me anything about hostel rules, complaints, mess timings or the portal.</p>
              <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={m.id ?? i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}>
                {m.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the assistant…" disabled={typing} />
          <Button type="submit" size="icon" disabled={typing || !input.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
}
