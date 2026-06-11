import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Redirecting…");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="stat-card w-full max-w-md p-7">
        <img src={logo} alt="HostelHub AI" width={40} height={40} className="h-10 w-10" />
        <h1 className="mt-4 text-xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ready ? "Enter your new password below." : "Open this page from the reset link in your email."}
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="np">New password</Label>
            <Input id="np" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!ready} required />
          </div>
          <Button type="submit" className="w-full" disabled={!ready || loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
