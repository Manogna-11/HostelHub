import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminGuard } from "@/components/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: () => (
    <AdminGuard>
      <Students />
    </AdminGuard>
  ),
});

function Students() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [assign, setAssign] = useState<{ id: string; name: string; room: string } | null>(null);

  const { data } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = (data ?? []).filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.student_id ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const saveRoom = async () => {
    if (!assign) return;
    const { error } = await supabase.from("profiles").update({ room_number: assign.room || null }).eq("id", assign.id);
    if (error) return toast.error("Update failed.");
    toast.success("Room assigned.");
    setAssign(null);
    qc.invalidateQueries({ queryKey: ["all-students"] });
  };

  return (
    <div>
      <PageHeader title="Students" description="Manage student records and room assignments" />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-40" /> No students found.
                </TableCell></TableRow>
              )}
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name || "—"}</TableCell>
                  <TableCell>{s.student_id || "—"}</TableCell>
                  <TableCell>{s.gender || "—"}</TableCell>
                  <TableCell>{s.room_number || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setAssign({ id: s.id, name: s.name, room: s.room_number ?? "" })}>
                      Assign Room
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign room to {assign?.name}</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Room number</Label>
            <Input value={assign?.room ?? ""} onChange={(e) => assign && setAssign({ ...assign, room: e.target.value })} placeholder="e.g. 203" />
          </div>
          <DialogFooter><Button onClick={saveRoom}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
