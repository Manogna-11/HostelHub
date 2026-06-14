import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, user, isAdmin, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    student_id: profile?.student_id ?? "",
    admin_id: profile?.admin_id ?? "",
    phone: profile?.phone ?? "",
    gender: profile?.gender ?? "",
    designation: profile?.designation ?? "",
    room_number: profile?.room_number ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = isAdmin
      ? { name: form.name, admin_id: form.admin_id, phone: form.phone, designation: form.designation }
      : { name: form.name, student_id: form.student_id, phone: form.phone, gender: form.gender, room_number: form.room_number };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error("Update failed.");
    toast.success("Profile updated.");
    refreshProfile();
  };

  const initials = (form.name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Manage your account details" />
      <div className="stat-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{form.name || "Unnamed"}</div>
            <div className="text-sm text-muted-foreground">{profile?.email || user?.email}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{isAdmin ? "Administrator" : "Student"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <F label="Full Name" className="col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></F>
          {isAdmin ? (
            <>
              <F label="Admin ID"><Input value={form.admin_id} onChange={(e) => setForm({ ...form, admin_id: e.target.value })} /></F>
              <F label="Designation"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></F>
              <F label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
            </>
          ) : (
            <>
              <F label="Student ID"><Input value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} /></F>
              <F label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
              <F label="Gender"><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></F>
              <F label="Room Number"><Input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} /></F>
            </>
          )}
        </div>
        <Button className="mt-6" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><Label className="text-xs">{label}</Label>{children}</div>;
}
