import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, role, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name, phone }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refreshProfile();
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="My Profile" description="Manage your account details." />
      <div className="stat-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Account type:</span>
          <Badge variant="outline" className="capitalize">{role === "admin" ? "Hostel Administrator" : "Student"}</Badge>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input value={profile?.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </form>
      </div>
    </div>
  );
}
