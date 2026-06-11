import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Coffee, Soup, Cookie, Moon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/mess")({
  component: Mess,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Soup },
  { key: "snacks", label: "Snacks", icon: Cookie },
  { key: "dinner", label: "Dinner", icon: Moon },
] as const;

type Row = { id: string; day_of_week: string; breakfast: string | null; lunch: string | null; snacks: string | null; dinner: string | null };

function Mess() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const today = DAYS[(new Date().getDay() + 6) % 7];
  const [edit, setEdit] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["mess"],
    queryFn: async () => (await supabase.from("mess_menu").select("*")).data ?? [],
  });

  const byDay = (d: string) => (data ?? []).find((r) => r.day_of_week === d) as Row | undefined;

  const save = async () => {
    if (!edit) return;
    setSaving(true);
    const { error } = await supabase
      .from("mess_menu")
      .upsert({ day_of_week: edit.day_of_week, breakfast: edit.breakfast, lunch: edit.lunch, snacks: edit.snacks, dinner: edit.dinner }, { onConflict: "day_of_week" });
    setSaving(false);
    if (error) return toast.error("Save failed.");
    toast.success(`${edit.day_of_week} menu updated.`);
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["mess"] });
  };

  return (
    <div>
      <PageHeader title="Mess Menu" description="Weekly dining schedule" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day) => {
          const row = byDay(day);
          const isToday = day === today;
          return (
            <div key={day} className={`stat-card p-5 ${isToday ? "ring-2 ring-primary" : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  {day} {isToday && <span className="ml-1 text-xs font-medium text-primary">• Today</span>}
                </h3>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => setEdit(row ?? { id: "", day_of_week: day, breakfast: "", lunch: "", snacks: "", dinner: "" })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <ul className="space-y-2.5">
                {MEALS.map((m) => (
                  <li key={m.key} className="flex gap-2.5 text-sm">
                    <m.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="text-xs font-semibold uppercase text-muted-foreground">{m.label}</div>
                      <div>{row?.[m.key] || "—"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {edit?.day_of_week} menu</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              {MEALS.map((m) => (
                <div key={m.key} className="space-y-1.5">
                  <Label>{m.label}</Label>
                  <Input value={edit[m.key] ?? ""} onChange={(e) => setEdit({ ...edit, [m.key]: e.target.value })} />
                </div>
              ))}
            </div>
          )}
          <DialogFooter><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
